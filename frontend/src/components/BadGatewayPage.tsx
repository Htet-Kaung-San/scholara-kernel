import { Link } from "react-router";
import { Button } from "./ui/button";
import badGatewayIllustration from "@/assets/error-502-bad-gateway-with-magnifier.svg";

export function BadGatewayPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center space-y-6">
        <img
          src={badGatewayIllustration}
          alt="502 bad gateway"
          className="mx-auto w-full max-w-xl"
        />
        <p className="text-muted-foreground">
          The server is temporarily unavailable. Please try again shortly.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
