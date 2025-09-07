"use client";

import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";

interface ImportExportDialogProps {
  children: React.ReactNode;
}

export function ImportExportDialog({ children }: ImportExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportShortcuts = api.shortcuts.export.useQuery(undefined, {
    enabled: false,
  });

  const importShortcuts = api.shortcuts.import.useMutation();

  const handleExport = async () => {
    try {
      const result = await exportShortcuts.refetch();
      if (result.data) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `cutfast-shortcuts-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Shortcuts exported successfully!");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export shortcuts");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error("Please select a JSON file");
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.shortcuts || !Array.isArray(data.shortcuts)) {
        toast.error("Invalid file format. Expected shortcuts array.");
        return;
      }

      await importShortcuts.mutateAsync({
        shortcuts: data.shortcuts,
        version: data.version,
      });

      toast.success(`Successfully imported ${data.shortcuts.length} shortcuts!`);
      setIsOpen(false);

      // Refresh the page to show imported shortcuts
      window.location.reload();
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import shortcuts. Please check the file format.");
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import/Export Shortcuts</DialogTitle>
          <DialogDescription>
            Export your shortcuts to a JSON file or import shortcuts from a previously exported file.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleExport}
            disabled={exportShortcuts.isFetching}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {exportShortcuts.isFetching ? "Exporting..." : "Export Shortcuts"}
          </Button>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              onClick={handleImportClick}
              disabled={isImporting}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Importing..." : "Import Shortcuts"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Import Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Only JSON files exported from CutFast are supported</li>
              <li>Existing shortcuts with the same keys will be duplicated</li>
              <li>Import process may take a few moments for large files</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
