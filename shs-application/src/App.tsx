import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Theme } from '@radix-ui/themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from '@/components/auth';
import { DashboardPage, NotFoundPage, LandingPage, LoginPage } from '@/pages';
import {
  TracksPage,
  StrandsPage,
  TrackStrandsPage,
  RoomsPage,
  TsbsrsPage,
  StudentsPage,
  EnrollmentsPage,
  SettingsPage,
} from '@/pages/admin';
import { MyEnrollmentsPage, ProfilePage, MyGradesPage } from '@/pages/student';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme accentColor="indigo" radius="medium">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/admin" element={<Navigate to="/login?role=admin" replace />} />
                <Route path="/login/registrar" element={<Navigate to="/login?role=registrar" replace />} />
                <Route path="/login/teacher" element={<Navigate to="/login?role=teacher" replace />} />
                <Route path="/login/student" element={<Navigate to="/login?role=student" replace />} />
                <Route path="/login/faculty" element={<Navigate to="/login?role=registrar" replace />} />
              </Route>

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Admin CRUD routes */}
                <Route path="/tracks" element={<TracksPage />} />
                <Route path="/strands" element={<StrandsPage />} />
                <Route path="/track-strands" element={<TrackStrandsPage />} />
                <Route path="/buildings" element={<Navigate to="/rooms" replace />} />
                <Route path="/sections" element={<Navigate to="/rooms" replace />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/building-sections" element={<Navigate to="/rooms" replace />} />
                <Route path="/tsbsrs" element={<TsbsrsPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/enrollments" element={<EnrollmentsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Student routes */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my-enrollments" element={<MyEnrollmentsPage />} />
                <Route path="/my-grades" element={<MyGradesPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              gutter={10}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#00003c',
                  color: '#ffffff',
                  border: '1px solid rgba(255,224,136,0.25)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  boxShadow: '0 8px 32px -8px rgba(0,0,60,0.45)',
                  maxWidth: '360px',
                },
                success: {
                  iconTheme: {
                    primary: '#ffe088',
                    secondary: '#00003c',
                  },
                  style: {
                    background: '#00003c',
                    border: '1px solid rgba(255,224,136,0.35)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#fca5a5',
                    secondary: '#00003c',
                  },
                  style: {
                    background: '#00003c',
                    border: '1px solid rgba(252,165,165,0.35)',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#ffe088',
                    secondary: '#00003c',
                  },
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </Theme>
    </QueryClientProvider>
  );
}

export default App;

