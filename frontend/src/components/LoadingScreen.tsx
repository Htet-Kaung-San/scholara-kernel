import loadingVideo from "@/assets/journal-man-runs-and-draws-his-path-with-a-pencil.webm";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-xl">
          <video
            src={loadingVideo}
            autoPlay
            muted
            loop
            playsInline
            className="h-64 w-full object-contain"
          />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}
