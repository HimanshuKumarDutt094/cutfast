import { signIn, signOut, signUp, useSession } from "../lib/auth-client";
import { cutfastDb } from "../lib/database";

// Hook for authentication operations
export function useAuth() {
	const { data: session, isPending, error, refetch } = useSession();

	const logout = async () => {
		const result = await signOut();
		await cutfastDb.clearShortcuts();
		await cutfastDb.clearCategories();
		return result;
	};

	const login = async (email: string, password: string) => {
		console.log("[useAuth] Login called with email:", email);
		if (session) {
			console.log("[useAuth] Session exists, logging out first...");
			await logout();
		}
		console.log("[useAuth] Calling signIn.email...");
		const result = await signIn.email({
			email,
			password,
		});
		console.log("[useAuth] signIn.email result:", result);
		if (result.data) {
			console.log("[useAuth] Login successful, clearing local database...");
			await cutfastDb.clearShortcuts();
			await cutfastDb.clearCategories();
		}
		return result;
	};

	const register = async (email: string, password: string, name: string = "User") => {
		const result = await signUp.email({
			email,
			password,
			name,
		});
		if (result.data) {
			await cutfastDb.clearShortcuts();
			await cutfastDb.clearCategories();
		}
		return result;
	};

	const socialLogin = async (provider: "github" | "google" | "discord") => {
		const result = await signIn.social({
			provider,
		});
		if (result.data) {
			await cutfastDb.clearShortcuts();
			await cutfastDb.clearCategories();
		}
		return result;
	};

	return {
		session,
		isPending,
		error,
		isAuthenticated: !!session,
		login,
		register,
		logout,
		socialLogin,
		refetch,
	};
}
