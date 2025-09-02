import { signIn, signOut, signUp, useSession } from "../lib/auth-client";

// Hook for authentication operations
export function useAuth() {
	const { data: session, isPending, error, refetch } = useSession();

	const login = async (email: string, password: string) => {
		const result = await signIn.email({
			email,
			password,
		});
		return result;
	};

	const register = async (email: string, password: string, name: string = "User") => {
		const result = await signUp.email({
			email,
			password,
			name,
		});
		return result;
	};

	const logout = async () => {
		const result = await signOut();
		return result;
	};

	const socialLogin = async (provider: "github" | "google" | "discord") => {
		const result = await signIn.social({
			provider,
		});
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
