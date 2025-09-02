import { useCallback, useEffect, useState } from "react";
import { cutfastDb } from "../lib/database";

// Hook for PGlite database operations
export function usePGlite() {
	const [isReady, setIsReady] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const initDb = async () => {
			try {
				setIsLoading(true);
				await cutfastDb.initialize();
				setIsReady(true);
				setError(null);
			} catch (err) {
				setError((err as Error).message);
				console.error("Failed to initialize database:", err);
			} finally {
				setIsLoading(false);
			}
		};

		initDb();
	}, []);

	return {
		isReady,
		isLoading,
		error,
		db: cutfastDb,
	};
}

// Hook for querying shortcuts
export function useShortcuts() {
	const [shortcuts, setShortcuts] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { isReady } = usePGlite();

	const loadShortcuts = useCallback(async () => {
		if (!isReady) return;

		try {
			setIsLoading(true);
			const data = await cutfastDb.getAllShortcuts();
			setShortcuts(data);
			setError(null);
		} catch (err) {
			setError((err as Error).message);
			console.error("Failed to load shortcuts:", err);
		} finally {
			setIsLoading(false);
		}
	}, [isReady]);

	useEffect(() => {
		loadShortcuts();
	}, [loadShortcuts]);

	const createShortcut = useCallback(
		async (data: {
			shortcut_key: string;
			content: string;
			category_id?: string;
		}) => {
			if (!isReady) return null;

			try {
				const result = await cutfastDb.createShortcut(data);
				await loadShortcuts(); // Refresh the list
				return result;
			} catch (err) {
				setError((err as Error).message);
				console.error("Failed to create shortcut:", err);
				return null;
			}
		},
		[isReady, loadShortcuts],
	);

	const updateShortcut = useCallback(
		async (
			id: string,
			data: Partial<{
				shortcut_key: string;
				content: string;
				category_id?: string;
			}>,
		) => {
			if (!isReady) return null;

			try {
				const result = await cutfastDb.updateShortcut(id, data);
				await loadShortcuts(); // Refresh the list
				return result;
			} catch (err) {
				setError((err as Error).message);
				console.error("Failed to update shortcut:", err);
				return null;
			}
		},
		[isReady, loadShortcuts],
	);

	const deleteShortcut = useCallback(
		async (id: string) => {
			if (!isReady) return false;

			try {
				await cutfastDb.deleteShortcut(id);
				await loadShortcuts(); // Refresh the list
				return true;
			} catch (err) {
				setError((err as Error).message);
				console.error("Failed to delete shortcut:", err);
				return false;
			}
		},
		[isReady, loadShortcuts],
	);

	return {
		shortcuts,
		isLoading,
		error,
		createShortcut,
		updateShortcut,
		deleteShortcut,
		refresh: loadShortcuts,
	};
}

// Hook for querying a single shortcut by key
export function useShortcut(key: string) {
	const [shortcut, setShortcut] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { isReady } = usePGlite();

	const loadShortcut = useCallback(async () => {
		if (!isReady || !key) return;

		try {
			setIsLoading(true);
			const data = await cutfastDb.getShortcut(key);
			setShortcut(data);
			setError(null);
		} catch (err) {
			setError((err as Error).message);
			console.error("Failed to load shortcut:", err);
		} finally {
			setIsLoading(false);
		}
	}, [isReady, key]);

	useEffect(() => {
		loadShortcut();
	}, [loadShortcut]);

	return {
		shortcut,
		isLoading,
		error,
		refresh: loadShortcut,
	};
}

// Hook for categories
export function useCategories() {
	const [categories, setCategories] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { isReady } = usePGlite();

	const loadCategories = useCallback(async () => {
		if (!isReady) return;

		try {
			setIsLoading(true);
			const data = await cutfastDb.getCategories();
			setCategories(data);
			setError(null);
		} catch (err) {
			setError((err as Error).message);
			console.error("Failed to load categories:", err);
		} finally {
			setIsLoading(false);
		}
	}, [isReady]);

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	return {
		categories,
		isLoading,
		error,
		refresh: loadCategories,
	};
}
