import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ExtensionDownload } from "@/components/ExtensionDownload";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/server";
import { Database, Shield, Smartphone, Zap } from "lucide-react";

export default async function Home() {
  const signUpStatus = await api.admin.getConfig();
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="text-center flex flex-col justify-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="mr-1 h-3 w-3" />
              Local-First Text Shortcuts
            </Badge>
            <h1 className="mb-6 font-bold text-4xl text-foreground sm:text-6xl">
              CutFast
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
              Instantaneous, offline-capable text expansion platform. Transform
              how you write with intelligent shortcuts that work everywhere.
            </p>
<p className="text-lg lg:text-xl">
            Want to self host your own backend and dashboard ? We have one click deploy to vercel.

</p>
            <a
              className="mx-auto max-w-2xl"
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHimanshuKumarDutt094%2Fcutfast%2Ftree%2Fmain%2Fsrc%2Fweb
&project-name=cutfast-dashboard
&repository-name=cutfast-dashboard
&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%5D
&env=BETTER_AUTH_SECRET,ADMIN_EMAIL,ADMIN_PASSWORD,MAX_USERS
&envDescription=Secret+used+by+Better+Auth;Admin+email+for+seeding;Admin+password+for+seeding;Maximum+number+of+users+allowed
&skippable-integrations=0"
            >
              <img src="https://vercel.com/button" alt="Deploy with Vercel" />
            </a>
          </div>
        </div>
      </div>

      {/* Extension Download Section */}
      <ExtensionDownload />

      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Instant text expansion with zero network latency. Works offline.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your shortcuts stay local. No data sent to external servers.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Real-time Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Seamless synchronization across all your devices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Cross-Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Works on any website, any app, any platform.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Auth Section */}
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>
                Sign in or create an account to manage your shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList
                  className={`grid w-full ${signUpStatus?.enableSignup ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  <TabsTrigger value="login">Login</TabsTrigger>
                  {signUpStatus?.enableSignup && (
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  )}{" "}
                </TabsList>
                <TabsContent value="login" className="mt-4">
                  <LoginForm />
                </TabsContent>
                {signUpStatus?.enableSignup && (
                  <TabsContent value="signup" className="mt-4">
                    <SignupForm />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
