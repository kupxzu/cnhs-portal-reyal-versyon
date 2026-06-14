import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui';
import type { UserType, UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedUserTypes?: UserType[];
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedUserTypes, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, userType, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-amber-50/40 p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-blue-100 bg-white p-4">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check user type restrictions
  if (allowedUserTypes && !allowedUserTypes.includes(userType!)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check role restrictions (for user type)
  if (allowedRoles && userType === 'user') {
    const userRole = (user as { role?: UserRole })?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#041B6E] via-[#0A2D8F] to-[#0C3EA5] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/95 p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
