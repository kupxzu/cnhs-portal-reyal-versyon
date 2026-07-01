import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getNavigationLinks = () => {
    if (!user) {
      return [
        { label: 'Go to Login', path: '/login' },
        { label: 'Go to Home', path: '/' },
      ];
    }

    // Return different links based on user role
    const baseLinks = [
      { label: 'Go to Dashboard', path: '/dashboard' },
      { label: 'Go to Profile', path: '/profile' },
    ];

    if (user && 'role' in user && (user as any).role === 'admin') {
      baseLinks.push(
        { label: 'Manage Tracks', path: '/tracks' },
        { label: 'Manage Rooms', path: '/rooms' }
      );
    }

    return baseLinks;
  };

  const navigationLinks = getNavigationLinks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Animated 404 */}
          <div className="mb-8">
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              404
            </h1>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-2">
            Oops! We couldn't find what you're looking for.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {location.pathname}
          </p>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            The page you're trying to access doesn't exist or may have been moved. Don't worry, you can navigate back to safety.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-3">
            {navigationLinks.map((link, index) => (
              <Link key={index} to={link.path}>
                <Button className="w-full">
                  {link.label}
                </Button>
              </Link>
            ))}
            
            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Footer Help Text */}
        <div className="mt-12 p-4 bg-white rounded-lg border border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact support or{' '}
            <Link to="/settings" className="text-indigo-600 hover:underline font-semibold">
              visit settings
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
