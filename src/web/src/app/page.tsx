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
import { Database, Globe, Shield, Zap, } from "lucide-react";

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
              Smart Text Shortcuts
            </Badge>
            <h1 className="mb-6 font-bold text-4xl text-foreground sm:text-6xl">
              CutFast
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
              Create text shortcuts on our website, sync them to your browser extension,
              and use them anywhere by typing your shortcut and pressing Ctrl+Shift+Space.
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
                Instant text expansion with local processing. No network delay once loaded.
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
                Shortcuts are stored on our servers and synced locally. Use our service or self-host your own.
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
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Cross-Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Works in any browser on desktop and laptop computers.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Current Features & Future Plans */}
        <div className="mb-16 mx-auto max-w-4xl">
          <div className="bg-muted/30 rounded-lg p-6 border">
            <h3 className="text-xl font-semibold mb-4 text-center">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">✅ Current Features</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Create shortcuts on our website</li>
                  <li>• Sync to browser extension automatically</li>
                  <li>• Use shortcuts with Ctrl+Shift+Space</li>
                  <li>• Local storage in browser (IndexedDB)</li>
                  <li>• Self-host option available</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">🚀 Coming Soon</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Custom keyboard shortcuts</li>
                  <li>• Website blacklists/whitelists</li>
                  <li>• Advanced sync options</li>
                  <li>• Mobile browser support</li>
                </ul>
              </div>
            </div>
          </div>
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
