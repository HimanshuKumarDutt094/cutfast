import browser from "webextension-polyfill";
import { getBaseUrl } from "../lib/api-url";
import { cutfastDb } from "../lib/database";

class CutFastBackground {
	private isAuthenticated = false;
	private syncInterval: NodeJS.Timeout | null = null;
	private isInitialized = false;
	private initializationPromise: Promise<void> | null = null;

	constructor() {
		this.init();
	}

	private async init() {
		// Prevent multiple initializations
		if (this.initializationPromise) {
			return this.initializationPromise;
		}

		this.initializationPromise = this.performInit();
		return this.initializationPromise;
	}

	private async performInit() {
		console.log("CutFast background service worker initialized");

		try {
			// Initialize database first
			await cutfastDb.initialize();
			this.isInitialized = true;

			// Set up message listeners
			this.setupMessageListeners();

			// Set up command listeners
			this.setupCommandListeners();

			// Check for existing authentication
			await this.checkAuthentication();

			// Start periodic sync
			this.startPeriodicSync();

			console.log("Background service worker initialization complete");
		} catch (error) {
			console.error("Failed to initialize background service:", error);
			this.isInitialized = false;
			this.initializationPromise = null; // Allow retry
			throw error;
		}
	}

	private setupMessageListeners() {
		browser.runtime.onMessage.addListener(async (message: any, sender: any) => {
			console.log("Received message:", message);

			try {
				// Ensure we're initialized before handling any messages
				await this.ensureInitialized();

				switch (message.type) {
					case "QUERY_SHORTCUT":
						return await this.handleShortcutQuery(message.payload);
					case "TRIGGER_AUTOCOMPLETE":
						return await this.handleAutocompleteTrigger(sender);
					default:
						console.warn("Unknown message type:", message.type);
						return { success: false, error: "Unknown message type" };
				}
			} catch (error) {
				console.error("Error handling message:", error);
				return {
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		});
	}

	private setupCommandListeners() {
		browser.commands.onCommand.addListener(async (command: string) => {
			console.log("Command received:", command);

			if (command === "trigger-autocomplete") {
				await this.handleAutocompleteCommand();
			}
		});
	}

	private async ensureInitialized(): Promise<void> {
		if (this.isInitialized) {
			return;
		}

		console.log("Service worker not initialized, initializing...");
		await this.init();
	}

	private async checkAuthentication() {
		try {
			const result = await browser.storage.local.get([
				"accessToken",
				"refreshToken",
			]);

			if (result.accessToken) {
				this.isAuthenticated = true;
				console.log("User is authenticated");
			} else {
				this.isAuthenticated = false;
				console.log("User is not authenticated");
			}
		} catch (error: unknown) {
			this.isAuthenticated = false;
			console.error("Failed to check authentication:", error);
		}
	}

	private async handleShortcutQuery(payload: { key: string }) {
		try {
			// Ensure we're properly initialized
			await this.ensureInitialized();

			// Ensure database connection is active (critical for service workers)
			await cutfastDb.ensureOpen();

			const shortcut = await cutfastDb.getShortcut(payload.key);

			console.log(
				`Shortcut query for "${payload.key}":`,
				shortcut ? "found" : "not found",
			);

			return { success: true, data: shortcut };
		} catch (error: unknown) {
			console.error("Failed to query shortcut:", error);

			// Try to recover from database connection issues
			if (error instanceof Error && error.message.includes("Database")) {
				try {
					console.log("Attempting database recovery...");
					await cutfastDb.initialize();
					await cutfastDb.ensureOpen();

					const shortcut = await cutfastDb.getShortcut(payload.key);
					console.log("Database recovery successful");

					return { success: true, data: shortcut };
				} catch (recoveryError) {
					console.error("Database recovery failed:", recoveryError);
					return {
						success: false,
						error: "Database connection failed. Please reload the extension.",
					};
				}
			}

			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	private async handleAutocompleteTrigger(sender: any) {
		try {
			await browser.tabs.sendMessage(sender.tab.id, {
				type: "TRIGGER_AUTOCOMPLETE",
			});

			return { success: true };
		} catch (error: unknown) {
			console.error("Failed to trigger autocomplete:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	private async handleAutocompleteCommand() {
		try {
			const tabs = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});

			if (tabs[0]) {
				await browser.tabs.sendMessage(tabs[0].id!, {
					type: "TRIGGER_AUTOCOMPLETE",
				});
			}
		} catch (error: unknown) {
			console.error("Failed to handle autocomplete command:", error);
		}
	}

	public async authenticate(tokens: {
		accessToken: string;
		refreshToken: string;
	}) {
		try {
			await browser.storage.local.set(tokens);
			this.isAuthenticated = true;
			console.log("Authentication successful");
		} catch (error: unknown) {
			console.error("Failed to store authentication tokens:", error);
		}
	}

	public async logout() {
		try {
			await browser.storage.local.remove(["accessToken", "refreshToken"]);
			this.isAuthenticated = false;
			console.log("Logged out successfully");
		} catch (error: unknown) {
			console.error("Failed to logout:", error);
		}
	}

	private startPeriodicSync() {
		// Clear any existing interval
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
		}

		// Sync every 5 minutes
		this.syncInterval = setInterval(
			() => {
				this.syncWithServer();
			},
			5 * 60 * 1000,
		);

		// Initial sync
		this.syncWithServer();
	}

	private async syncWithServer() {
		if (!this.isAuthenticated) {
			console.log("Skipping sync - user not authenticated");
			return;
		}

		try {
			console.log("Starting sync with server...");

			const storage = await browser.storage.local.get(["lastSyncTimestamp"]);
			const lastSync = storage.lastSyncTimestamp
				? new Date(storage.lastSyncTimestamp as string)
				: new Date(0);

			const apiUrl = await getBaseUrl();
			const input = encodeURIComponent(
				JSON.stringify({ json: { since: lastSync.toISOString() } }),
			);
			const response = await fetch(
				`${apiUrl}/api/trpc/shortcuts.updatedSince?input=${input}`,
				{
					method: "GET",
					credentials: "include",
					headers: {
						"content-type": "application/json",
					},
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const updatedShortcuts = data.result.data || [];

			if (updatedShortcuts.length > 0) {
				// Ensure database is ready before bulk upsert
				await this.ensureInitialized();
				await cutfastDb.ensureOpen();

				const upserted = await cutfastDb.bulkUpsertShortcuts(updatedShortcuts);
				console.log(`Synced ${upserted} shortcuts from server`);
			}

			await browser.storage.local.set({
				lastSyncTimestamp: new Date().toISOString(),
			});

			console.log("Sync completed successfully");
		} catch (error) {
			console.error("Failed to sync with server:", error);
		}
	}

	public async forceSync() {
		await this.syncWithServer();
	}
}

// Initialize the background service
const cutfastBackground = new CutFastBackground();

export default cutfastBackground;
