"use client";

import { Chrome, Download, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GitHubRelease {
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

export function ExtensionDownload() {
  const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest release from GitHub
    fetch("https://api.github.com/repos/HimanshuKumarDutt094/cutfast/releases/latest")
      .then((res) => res.json())
      .then((data) => {
        setLatestRelease(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getDownloadUrl = (browser: "firefox" | "chrome") => {
    if (!latestRelease) return "#";

    const asset = latestRelease.assets.find((asset) =>
      asset.name.includes(browser)
    );

    return asset?.browser_download_url || "#";
  };

  const handleDownload = (browser: "firefox" | "chrome", url: string) => {
    if (url !== "#") {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Get the Browser Extension
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Download CutFast for your browser to start using shortcuts instantly.
          No developer account required!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Firefox Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">🦊</span>
            </div>
            <CardTitle className="text-xl">Firefox Extension</CardTitle>
            <CardDescription>
              For Firefox, Thunderbird, and other Mozilla browsers
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button
              onClick={() => handleDownload("firefox", getDownloadUrl("firefox"))}
              disabled={loading || getDownloadUrl("firefox") === "#"}
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Loading..." : "Download for Firefox"}
            </Button>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Installation:</p>
              <ol className="text-left list-decimal list-inside space-y-1">
                <li>Download the extension file</li>
                <li>Open Firefox and go to <code className="bg-muted px-1 py-0.5 rounded text-xs">about:debugging</code></li>
                <li>Click "This Firefox" → "Load Temporary Add-on"</li>
                <li>Select the downloaded zip file</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Chrome Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Chrome className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl">Chrome Extension</CardTitle>
            <CardDescription>
              For Chrome, Edge, and other Chromium browsers
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button
              onClick={() => handleDownload("chrome", getDownloadUrl("chrome"))}
              disabled={loading || getDownloadUrl("chrome") === "#"}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Loading..." : "Download for Chrome"}
            </Button>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Installation:</p>
              <ol className="text-left list-decimal list-inside space-y-1">
                <li>Download and unzip the extension file</li>
                <li>Open Chrome and go to <code className="bg-muted px-1 py-0.5 rounded text-xs">chrome://extensions/</code></li>
                <li>Enable "Developer mode" (top right)</li>
                <li>Click "Load unpacked" and select the unzipped folder</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-3">💡 Pro Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">🔄 Auto Updates</p>
              <p>Check back here for the latest version when new releases are published.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">🔒 Privacy First</p>
              <p>Extensions work offline and never send your data to external servers.</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm">
              <ExternalLink className="inline h-3 w-3 mr-1" />
              <a
                href="https://github.com/HimanshuKumarDutt094/cutfast/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View all releases on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
