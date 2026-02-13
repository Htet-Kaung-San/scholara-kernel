import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    if (requiredRole && user && !requiredRole.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
