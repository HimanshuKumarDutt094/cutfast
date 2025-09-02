import browser from "webextension-polyfill";
import { cutfastDb } from "../lib/database";

// Background service worker for CutFast extension
// Handles PGlite, ElectricSQL sync, authentication, and message handling

class CutFastBackground {
	private isAuthenticated = false;

	constructor() {
		this.init();
	}

	private async init() {
		console.log("CutFast background service worker initialized");

		// Initialize PGlite database
		await this.initDatabase();

		// Set up message listeners
		this.setupMessageListeners();

		// Set up command listeners
		this.setupCommandListeners();

		// Check for existing authentication
		await this.checkAuthentication();
	}

	private async initDatabase() {
		try {
			await cutfastDb.initialize();
			console.log("Database initialized successfully");
		} catch (error) {
			console.error("Failed to initialize database:", error);
		}
	}

	private setupMessageListeners() {
		browser.runtime.onMessage.addListener(
			async (message: any, sender: any) => {
				console.log("Received message:", message);

				switch (message.type) {
					case "QUERY_SHORTCUT":
						return await this.handleShortcutQuery(message.payload);
					case "TRIGGER_AUTOCOMPLETE":
						return await this.handleAutocompleteTrigger(sender);
					default:
						console.warn("Unknown message type:", message.type);
				}
			}
		);
	}

	private setupCommandListeners() {
		browser.commands.onCommand.addListener(async (command: string) => {
			console.log("Command received:", command);

			if (command === "trigger-autocomplete") {
				await this.handleAutocompleteCommand();
			}
		});
	}

	private async checkAuthentication() {
		try {
			// Check for stored tokens
			const result = await browser.storage.local.get(["accessToken", "refreshToken"]);

			if (result.accessToken) {
				this.isAuthenticated = true;
				// TODO: Validate token and refresh if needed
				console.log("User is authenticated");
			} else {
				console.log("User is not authenticated");
			}
		} catch (error) {
			console.error("Failed to check authentication:", error);
		}
	}

	private async handleShortcutQuery(payload: { key: string }) {
		try {
			if (!this.isAuthenticated) {
				return { success: false, error: "Not authenticated" };
			}

			if (!cutfastDb.isReady) {
				return { success: false, error: "Database not ready" };
			}

			console.log("Querying shortcut:", payload.key);

			// Query the database for the shortcut
			const shortcut = await cutfastDb.getShortcut(payload.key);

			if (shortcut) {
				return {
					success: true,
					data: {
						key: payload.key,
						content: shortcut.content,
						id: shortcut.id,
					},
				};
			} else {
				return {
					success: true,
					data: null, // No shortcut found
				};
			}
		} catch (error) {
			console.error("Failed to query shortcut:", error);
			return { success: false, error: (error as Error).message };
		}
	}

	private async handleAutocompleteTrigger(sender: any) {
		try {
			// Send message to content script to trigger autocomplete
			await browser.tabs.sendMessage(sender.tab.id, {
				type: "TRIGGER_AUTOCOMPLETE",
			});

			return { success: true };
		} catch (error) {
			console.error("Failed to trigger autocomplete:", error);
			return { success: false, error: error.message };
		}
	}

	private async handleAutocompleteCommand() {
		try {
			// Get active tab
			const tabs = await browser.tabs.query({ active: true, currentWindow: true });

			if (tabs[0]) {
				await browser.tabs.sendMessage(tabs[0].id!, {
					type: "TRIGGER_AUTOCOMPLETE",
				});
			}
		} catch (error) {
			console.error("Failed to handle autocomplete command:", error);
		}
	}

	// Public methods for external access
	public async authenticate(tokens: { accessToken: string; refreshToken: string }) {
		try {
			await browser.storage.local.set(tokens);
			this.isAuthenticated = true;
			console.log("Authentication successful");
		} catch (error) {
			console.error("Failed to store authentication tokens:", error);
		}
	}

	public async logout() {
		try {
			await browser.storage.local.remove(["accessToken", "refreshToken"]);
			this.isAuthenticated = false;
			console.log("Logged out successfully");
		} catch (error) {
			console.error("Failed to logout:", error);
		}
	}
}

// Initialize the background service
const cutfastBackground = new CutFastBackground();

// Export for potential use by other parts of the extension
export default cutfastBackground;
