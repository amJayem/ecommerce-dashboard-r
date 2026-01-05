import { useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  FileType,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  description: string;
  entityName: string; // e.g., "products", "categories"
  requirements: string[]; // List of requirements to display
  onImport: (file: File) => Promise<any>; // The mutation function
  onDownloadSample?: () => void; // Optional function to download sample CSV
}

export function ImportCSVModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  entityName,
  requirements,
  onImport,
  onDownloadSample,
}: ImportCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type !== "text/csv" &&
        !selectedFile.name.endsWith(".csv")
      ) {
        toast.error("Please select a valid CSV file");
        return;
      }
      setFile(selectedFile);
      setStatus("idle");
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setStatus("uploading");
      const result = await onImport(file);
      setStatus("success");

      // Determine success message from various possible response formats
      let successMsg = result?.message || result?.msg || "Import complete";
      const created = result?.created;
      const updated = result?.updated;
      const errors = result?.errors;

      if (created !== undefined && updated !== undefined) {
        successMsg = `Import result: ${created} created, ${updated} updated`;
        if (errors?.length > 0) {
          successMsg += `. ${errors.length} errors occurred.`;
        }
      } else {
        const count =
          result?.count ??
          result?.importedCount ??
          result?.total ??
          result?.data?.length;
        if (count !== undefined) {
          successMsg = `${successMsg} (${count} ${entityName})`;
        }
      }

      setMessage(successMsg);
      onSuccess();
    } catch (err: any) {
      console.error(`${entityName} import error:`, {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : `Failed to import ${entityName}`
      );
    }
  };

  const handleClose = (open?: boolean) => {
    if (open === true) return; // Ignore opening
    if (status === "uploading") return;
    setFile(null);
    setStatus("idle");
    setMessage("");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Requirements Section */}
          <div className="rounded-lg bg-accent/50 p-3 text-sm space-y-2">
            <h4 className="font-semibold flex items-center gap-1.5">
              <FileType className="h-4 w-4" />
              CSV Requirements
            </h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
            {onDownloadSample && (
              <div className="pt-2 border-t border-accent mt-2">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary hover:text-primary/80 font-medium flex items-center gap-1.5"
                  onClick={onDownloadSample}
                >
                  <Download className="h-4 w-4" />
                  Download Sample CSV
                </Button>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Use this template to prepare your file.
                </p>
              </div>
            )}
          </div>

          {/* File Selection */}
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 space-y-3 bg-background/50 border-muted min-h-[120px]">
            {file ? (
              <div className="relative z-20 flex items-center gap-2 text-primary font-medium bg-background p-2 rounded border shadow-sm">
                <FileType className="h-5 w-5" />
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove file"
                >
                  <AlertCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to select file</p>
                  <p className="text-xs text-muted-foreground">
                    CSV files only
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={status === "uploading"}
            />
          </div>

          {/* Status Messaging */}
          {status === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={status === "uploading"}>
            {status === "success" ? "Close" : "Cancel"}
          </AlertDialogCancel>
          {status !== "success" && (
            <Button
              onClick={handleUpload}
              disabled={!file || status === "uploading"}
            >
              {status === "uploading" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {status === "uploading" ? "Importing..." : "Start Import"}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
