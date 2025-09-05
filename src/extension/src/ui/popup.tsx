import { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import { LoginForm } from "../components/shared/LoginForm";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/use-auth";
import "../index.css";
import { signOut } from "../lib/auth-client";
import { cutfastDb } from "../lib/database";

// Popup component for CutFast extension
function Popup() {
    const { session, isPending: sessionLoading, refetch } = useAuth();
    const [dbReady, setDbReady] = useState(false);
    const [shortcuts, setShortcuts] = useState<any[]>([]);
    const [shortcutsLoading, setShortcutsLoading] = useState(true);

    // Initialize database and load shortcuts
    useEffect(() => {
        const initDb = async () => {
            try {
                await cutfastDb.initialize();
                setDbReady(true);
                const loadedShortcuts = await cutfastDb.getAllShortcuts();
                setShortcuts(loadedShortcuts);
            } catch (error) {
                console.error("Failed to initialize database:", error);
            } finally {
                setShortcutsLoading(false);
            }
        };

        initDb();
    }, []);

    const isAuthenticated = !!session;
    const isLoading = sessionLoading || shortcutsLoading;

    const baseURL = useMemo(() => {
        return (process.env.NEXT_PUBLIC_BASE_URL as string) || "http://localhost:3000";
    }, []);

    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    const handleLogout = async () => {
        try {
            await signOut();
            await refetch();
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    const handleOpenDashboard = () => {
        browser.tabs.create({
            url: `${baseURL}/dashboard`,
        });
        window.close();
    };

    type TrpcShortcut = {
        id: string;
        userId: string;
        shortcutKey: string;
        content: string;
        categoryId?: string | null;
    };

    const syncShortcuts = useCallback(async () => {
        if (!dbReady) return;
        setSyncing(true);
        setSyncError(null);
        try {
            const resp = await fetch(`${baseURL}/api/trpc/shortcuts.list`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "content-type": "application/json",
                },
            });
            if (!resp.ok) throw new Error(`Sync failed with status ${resp.status}`);
            const data = (await resp.json()) as { result?: { data?: { json?: TrpcShortcut[] } } };
            const items = data?.result?.data?.json ?? [];
            if (items.length > 0) {
                await cutfastDb.bulkUpsertShortcuts(items);
                // Refresh shortcuts list
                const updatedShortcuts = await cutfastDb.getAllShortcuts();
                setShortcuts(updatedShortcuts);
            }
        } catch (e) {
            setSyncError((e as Error).message);
        } finally {
            setSyncing(false);
        }
    }, [baseURL, dbReady]);

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

                    <Button onClick={syncShortcuts} className="w-full" disabled={!dbReady || syncing}>
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
                                        url: `${baseURL}/dashboard`,
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
                                        url: `${baseURL}/dashboard`,
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
                    <div className="text-sm text-red-600 text-center">Not authenticated</div>
                    <p className="text-sm text-gray-600 text-center">Please log in to use CutFast text shortcuts</p>
                    <LoginForm onSuccess={refetch} />
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
