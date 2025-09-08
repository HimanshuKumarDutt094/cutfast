import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import { LoginForm } from "../components/shared/LoginForm";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../hooks/use-auth";
import "../index.css";
import { getBaseUrl, getCustomApiUrl, saveCustomApiUrl } from "../lib/api-url";
import { cutfastDb } from "../lib/database";

// Popup component for CutFast extension
function Popup() {
	const { session, isPending: sessionLoading, refetch, logout } = useAuth();
	const prevAuthenticated = useRef(false);

	const isAuthenticated = !!session;

	const [dynamicBaseURL, setDynamicBaseURL] = useState("");
	const [dbReady, setDbReady] = useState(false);
	const [shortcuts, setShortcuts] = useState<any[]>([]);
	const [shortcutsLoading, setShortcutsLoading] = useState(true);
	const isLoading = sessionLoading || shortcutsLoading;

	const [syncing, setSyncing] = useState(false);
	const [syncError, setSyncError] = useState<string | null>(null);

	// API endpoint configuration
	const [showApiConfig, setShowApiConfig] = useState(false);
	const [customApiUrl, setCustomApiUrl] = useState("");
	const [apiConfigLoading, setApiConfigLoading] = useState(false);
	const [apiConfigError, setApiConfigError] = useState<string | null>(null);
	const [urlRefreshTrigger, setUrlRefreshTrigger] = useState(0);

	// Consolidated initialization effect
	useEffect(() => {
		const initializeEverything = async () => {
			try {
				console.log(
					"[Init] Starting consolidated initialization (trigger:",
					urlRefreshTrigger,
					")",
				);

				// Initialize database (only once)
				if (!dbReady) {
					await cutfastDb.initialize();
					setDbReady(true);
					console.log("[Init] Database ready");
				}

				// Load shortcuts
				const loadedShortcuts = await cutfastDb.getAllShortcuts();
				setShortcuts(loadedShortcuts);
				console.log("[Init] Loaded", loadedShortcuts.length, "shortcuts");

				// Load API URLs (refresh when urlRefreshTrigger changes)
				const apiUrl = await getBaseUrl();
				setDynamicBaseURL(apiUrl);
				console.log("[Init] Dynamic API URL:", apiUrl);

				const savedUrl = await getCustomApiUrl();
				setCustomApiUrl(savedUrl);
				console.log("[Init] Custom API URL:", savedUrl);

				console.log("[Init] All initialization complete");
			} catch (error) {
				console.error("[Init] Initialization failed:", error);
				// getBaseUrl() already has fallback, so this shouldn't happen
				// But if it does, set a reasonable default
				setDynamicBaseURL("http://localhost:3000");
			} finally {
				setShortcutsLoading(false);
			}
		};

		initializeEverything();
	}, [urlRefreshTrigger]); // Re-run when URL is updated

	// Handle saving custom API URL
	const handleSaveApiUrl = async () => {
		setApiConfigLoading(true);
		setApiConfigError(null);

		try {
			await saveCustomApiUrl(customApiUrl);
			setShowApiConfig(false);
			// Trigger URL refresh to reload the new API URL
			setUrlRefreshTrigger((prev) => prev + 1);
			console.log("[Config] API URL updated, triggering refresh");
		} catch (error) {
			setApiConfigError(
				error instanceof Error ? error.message : "Failed to save API URL",
			);
		} finally {
			setApiConfigLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await logout();
			await refetch();
		} catch (error) {
			console.error("Failed to logout:", error);
		}
	};

	const handleLoginSuccess = () => {
		console.log("[Popup] Login success callback called, refetching session...");
		refetch();
	};

	const handleOpenDashboard = () => {
		browser.tabs.create({
			url: `${dynamicBaseURL}/dashboard`,
		});
		window.close();
	};

	const syncShortcuts = useCallback(
		async (
			fullReplace = false,
			currentDbReady = dbReady,
			currentApiUrl = dynamicBaseURL,
		) => {
			console.log("[Sync] Starting sync, fullReplace:", fullReplace);
			console.log(
				"[Sync] dbReady:",
				currentDbReady,
				"dynamicBaseURL:",
				currentApiUrl,
			);

			if (!currentDbReady || !currentApiUrl) {
				console.log(
					"[Sync] Skipping sync - dbReady:",
					currentDbReady,
					"dynamicBaseURL:",
					currentApiUrl,
				);
				return;
			}

			setSyncing(true);
			setSyncError(null);

			try {
				let resp;
				let fetchUrl;

				if (fullReplace) {
					// Full replace: get all shortcuts
					fetchUrl = `${currentApiUrl}/api/trpc/shortcuts.list`;
					console.log("[Sync] Full replace fetch URL:", fetchUrl);
					resp = await fetch(fetchUrl, {
						method: "GET",
						credentials: "include",
						headers: {
							"content-type": "application/json",
						},
					});
				} else {
					// Partial update: get only updated shortcuts
					const lastSync =
						(await browser.storage.local.get(["lastSyncTimestamp"]))
							.lastSyncTimestamp || new Date(0).toISOString();
					console.log("[Sync] Last sync timestamp:", lastSync);
					const input = encodeURIComponent(
						JSON.stringify({ json: { since: lastSync } }),
					);
					fetchUrl = `${currentApiUrl}/api/trpc/shortcuts.updatedSince?input=${input}`;
					console.log("[Sync] Partial update fetch URL:", fetchUrl);
					resp = await fetch(fetchUrl, {
						method: "GET",
						credentials: "include",
						headers: {
							"content-type": "application/json",
						},
					});
				}

				console.log("[Sync] Fetch response status:", resp.status);
				if (!resp.ok) {
					console.error("[Sync] Fetch failed with status:", resp.status);
					throw new Error(`Sync failed with status ${resp.status}`);
				}

				const data = await resp.json();
				console.log("[Sync] Raw response data:", data);
				const items = data?.result?.data?.json ?? [];
				console.log("[Sync] Parsed items:", items);

				if (fullReplace) {
					// Clear existing shortcuts to replace with fresh data
					console.log("[Sync] Clearing existing shortcuts for full replace");
					await cutfastDb.clearShortcuts();
					if (items.length > 0) {
						console.log("[Sync] Bulk upserting", items.length, "shortcuts");
						await cutfastDb.bulkUpsertShortcuts(items);
					}
				} else {
					// Partial update: only upsert changed items
					if (items.length > 0) {
						console.log(
							"[Sync] Bulk upserting",
							items.length,
							"updated shortcuts",
						);
						await cutfastDb.bulkUpsertShortcuts(items);
					} else {
						console.log("[Sync] No updated shortcuts to sync");
					}
				}

				// Update last sync timestamp for partial updates
				if (!fullReplace) {
					const newTimestamp = new Date().toISOString();
					console.log("[Sync] Updating last sync timestamp to:", newTimestamp);
					await browser.storage.local.set({
						lastSyncTimestamp: newTimestamp,
					});
				}

				// Refresh shortcuts list
				console.log("[Sync] Refreshing shortcuts list");
				const updatedShortcuts = await cutfastDb.getAllShortcuts();
				console.log("[Sync] Updated shortcuts count:", updatedShortcuts.length);
				setShortcuts(updatedShortcuts);

				console.log("[Sync] Sync completed successfully");
			} catch (e) {
				console.error("[Sync] Sync failed with error:", e);
				setSyncError((e as Error).message);
			} finally {
				setSyncing(false);
			}
		},
		[],
	); // Remove dependencies to prevent infinite loops

	// Auto sync after login - only when fully initialized
	useEffect(() => {
		if (
			isAuthenticated &&
			!prevAuthenticated.current &&
			dbReady &&
			dynamicBaseURL
		) {
			console.log("[AutoSync] Conditions met, starting auto-sync after login");
			syncShortcuts(true, dbReady, dynamicBaseURL); // Pass current values
		}
		prevAuthenticated.current = isAuthenticated;
	}, [isAuthenticated, dbReady, dynamicBaseURL]); // Include dynamicBaseURL dependency

	if (isLoading || shortcutsLoading) {
		return (
			<div className="w-80 p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
					Loading...
				</div>
			</div>
		);
	}

	return (
		<div className="w-80 p-4 bg-white">
			<div className="text-center mb-4">
				<h1 className="text-xl font-bold text-gray-800">CutFast</h1>
				<p className="text-sm text-gray-600">Text Shortcuts</p>
			</div>

			{isAuthenticated ? (
				<div className="space-y-3">
					{/* Database Status */}
					<div className="text-xs text-gray-500 text-center">
						Database: {dbReady ? "✅ Ready" : "⏳ Initializing"}
					</div>

					{/* Shortcuts Count */}
					<div className="text-xs text-gray-500 text-center">
						{shortcuts.length} shortcuts loaded
					</div>

					<Button onClick={handleOpenDashboard} className="w-full">
						Open Dashboard
					</Button>

					<Button
						onClick={() => syncShortcuts(false, dbReady, dynamicBaseURL)}
						className="w-full"
						disabled={!dbReady || syncing}
					>
						{syncing ? "Syncing..." : "Sync Shortcuts"}
					</Button>
					{syncError && (
						<div className="text-xs text-red-600 text-center">{syncError}</div>
					)}

					<div className="border-t pt-3">
						<h3 className="text-sm font-medium mb-2">Quick Actions</h3>
						<div className="space-y-2">
							<Button
								variant="ghost"
								className="w-full justify-start text-sm"
								onClick={() => {
									browser.tabs.create({
										url: `${dynamicBaseURL}/dashboard`,
									});
									window.close();
								}}
							>
								Manage Shortcuts
							</Button>
							<Button
								variant="ghost"
								className="w-full justify-start text-sm"
								onClick={() => {
									browser.tabs.create({
										url: `${dynamicBaseURL}/dashboard`,
									});
									window.close();
								}}
							>
								Settings
							</Button>
						</div>
					</div>

					<Button onClick={handleLogout} variant="outline" className="w-full">
						Logout
					</Button>
				</div>
			) : (
				<div className="space-y-3">
					<p className="text-sm text-gray-600 text-center">
						Please log in to use CutFast text shortcuts
					</p>

					{/* API Endpoint Configuration */}
					{!showApiConfig ? (
						<div className="space-y-2">
							<Button
								variant="outline"
								className="w-full text-xs"
								onClick={() => setShowApiConfig(true)}
							>
								Configure API Endpoint
							</Button>
							<p className="text-xs text-gray-500 text-center underline">
								<span className="text-red-500 underline">{` | `}</span> After
								changing URL, close and reopen extension
							</p>
						</div>
					) : (
						<div className="space-y-2 p-3 border rounded">
							<div className="text-xs font-medium">Custom API Endpoint</div>
							<Input
								type="url"
								placeholder="https://your-api.com"
								value={customApiUrl}
								onChange={(e) => setCustomApiUrl(e.target.value)}
								className="text-xs"
							/>
							{apiConfigError && (
								<div className="text-xs text-red-600">{apiConfigError}</div>
							)}
							<div className="flex gap-2">
								<Button
									size="sm"
									className="flex-1 text-xs"
									onClick={handleSaveApiUrl}
									disabled={apiConfigLoading}
								>
									{apiConfigLoading ? "Saving..." : "Save"}
								</Button>
								<Button
									size="sm"
									variant="outline"
									className="flex-1 text-xs"
									onClick={() => setShowApiConfig(false)}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}

					{/* Only show login form when not configuring API */}
					{!showApiConfig && <LoginForm onSuccess={handleLoginSuccess} />}

					{/* Register link */}
					{!showApiConfig && (
						<div className="text-center">
							<Button
								variant="link"
								className="text-xs text-blue-600 hover:text-blue-800"
								onClick={() => {
									browser.tabs.create({
										url: "https://cutfast-extension.vercel.app/",
									});
									window.close();
								}}
							>
								Don't have an account? Register here
							</Button>
						</div>
					)}
				</div>
			)}

			<div className="mt-4 pt-3 border-t text-xs text-gray-500 text-center">
				Press Ctrl+Shift+Space to trigger autocomplete
			</div>
		</div>
	);
}

// Render the popup
const container = document.getElementById("popup-root");
if (container) {
	const root = createRoot(container);
	root.render(<Popup />);
}
