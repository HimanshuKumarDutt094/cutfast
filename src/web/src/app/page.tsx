import { LoginForm } from "@/components/auth/LoginForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">CutFast</h1>
          <p className="mt-2 text-muted-foreground">
            Local-first text shortcut platform
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
