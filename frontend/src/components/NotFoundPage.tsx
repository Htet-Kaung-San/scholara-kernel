import { Link } from "react-router";
import { Button } from "./ui/button";
import notFoundIllustration from "@/assets/journal-text-404-error-page-not-found-1.svg";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center space-y-6">
        <img
          src={notFoundIllustration}
          alt="404 page not found"
          className="mx-auto w-full max-w-xl"
        />
        <p className="text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <div className="flex justify-center">
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
