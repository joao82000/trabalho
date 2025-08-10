interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "Analyzing NASA POWER Data..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-nasa-dark border border-nasa-gold/30 rounded-lg p-8 text-center glow-effect">
        <div className="animate-spin w-12 h-12 border-4 border-nasa-gold/30 border-t-nasa-gold rounded-full mx-auto mb-4"></div>
        <p className="text-nasa-gold font-medium">{message}</p>
        <p className="text-gray-300 text-sm mt-2">Processing satellite observations</p>
      </div>
    </div>
  );
}
