interface ErrorDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export default function ErrorDialog({
  open,
  title = "Error",
  message,
  onClose,
}: ErrorDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-2 right-2 text-foreground-accent hover:text-primary"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-2 text-red-600">{title}</h2>
        <p className="mb-4 text-foreground-accent">{message}</p>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
