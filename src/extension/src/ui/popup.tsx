import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import { Button } from "../components/ui/button";
import { usePGlite, useShortcuts } from "../hooks/use-pglite";
import { signOut, useSession } from "../lib/auth-client";

// Popup component for CutFast extension
function Popup() {
	const { data: session, isPending: sessionLoading } = useSession();
	const { isReady: dbReady } = usePGlite();
	const { shortcuts, isLoading: shortcutsLoading } = useShortcuts();

	const isAuthenticated = !!session;
	const isLoading = sessionLoading || shortcutsLoading;

	const handleLogin = () => {
		// Open login page in new tab
		browser.tabs.create({
			url: "http://localhost:3000",
		});
		window.close();
	};

	const handleLogout = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Failed to logout:", error);
		}
	};

	const handleOpenDashboard = () => {
		browser.tabs.create({
			url: "http://localhost:3000/dashboard",
		});
		window.close();
	};

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
					<div className="text-sm text-green-600 text-center">
						✓ Authenticated
					</div>

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

					<div className="border-t pt-3">
						<h3 className="text-sm font-medium mb-2">Quick Actions</h3>
						<div className="space-y-2">
							<Button
								variant="ghost"
								className="w-full justify-start text-sm"
								onClick={() => {
									browser.tabs.create({
										url: "http://localhost:3000/dashboard",
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
										url: "http://localhost:3000/dashboard",
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
					<div className="text-sm text-red-600 text-center">
						Not authenticated
					</div>

					<p className="text-sm text-gray-600 text-center">
						Please log in to use CutFast text shortcuts
					</p>

					<Button onClick={handleLogin} className="w-full">
						Login
					</Button>
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
