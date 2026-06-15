import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  PersonIcon,
  GearIcon,
  ExitIcon,
  ReaderIcon,
  CubeIcon,
  LayersIcon,
  StackIcon,
  IdCardIcon,
  FileTextIcon,
  BarChartIcon,
} from '@radix-ui/react-icons';
import { useAuth } from '@/contexts/AuthContext';
import type { UserType, UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const getNavItems = (userType: UserType | null, role?: UserRole): NavItem[] => {
  const baseItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon className="w-5 h-5" /> },
  ];

  if (userType === 'admin') {
    return [
      ...baseItems,
      { label: 'Tracks', href: '/tracks', icon: <ReaderIcon className="w-5 h-5" /> },
      { label: 'Strands', href: '/strands', icon: <LayersIcon className="w-5 h-5" /> },
      { label: 'Track-Strands', href: '/track-strands', icon: <StackIcon className="w-5 h-5" /> },
      { label: 'Buildings & Rooms', href: '/rooms', icon: <CubeIcon className="w-5 h-5" /> },
      { label: 'TSBSR', href: '/tsbsrs', icon: <FileTextIcon className="w-5 h-5" /> },
      { label: 'Students', href: '/students', icon: <PersonIcon className="w-5 h-5" /> },
      { label: 'Enrollments', href: '/enrollments', icon: <IdCardIcon className="w-5 h-5" /> },
      { label: 'Account Settings', href: '/settings', icon: <GearIcon className="w-5 h-5" /> },
    ];
  }

  if (userType === 'user' && role === 'registrar') {
    return [
      ...baseItems,
      { label: 'Students', href: '/students', icon: <PersonIcon className="w-5 h-5" /> },
      { label: 'Enrollments', href: '/enrollments', icon: <IdCardIcon className="w-5 h-5" /> },
      { label: 'Track-Strands', href: '/track-strands', icon: <StackIcon className="w-5 h-5" /> },
    ];
  }

  if (userType === 'user' && role === 'teacher') {
    return [
      ...baseItems,
      { label: 'Students', href: '/students', icon: <PersonIcon className="w-5 h-5" /> },
      { label: 'Track-Strands', href: '/track-strands', icon: <StackIcon className="w-5 h-5" /> },
    ];
  }

  if (userType === 'student') {
    return [
      ...baseItems,
      { label: 'My Profile', href: '/profile', icon: <PersonIcon className="w-5 h-5" /> },
      { label: 'My Enrollments', href: '/my-enrollments', icon: <IdCardIcon className="w-5 h-5" /> },
      { label: 'My Grades', href: '/my-grades', icon: <BarChartIcon className="w-5 h-5" /> },
    ];
  }

  return baseItems;
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, userType, logout } = useAuth();
  
  const role = userType === 'user' ? (user as { role?: UserRole })?.role : undefined;
  const navItems = getNavItems(userType, role);

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if ('name' in user) return user.name;
    if ('username' in user) return user.username;
    return 'User';
  };

  const getUserRole = () => {
    if (userType === 'admin') return 'Administrator';
    if (userType === 'student') return 'Student';
    if (userType === 'user' && role) {
      return role.charAt(0).toUpperCase() + role.slice(1);
    }
    return 'User';
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-[1px] z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white/95 backdrop-blur-md border-r border-blue-100 shadow-[0_8px_30px_-16px_rgba(2,6,23,.35)] transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 'var(--sidebar-width)' }}
      >
        <div className="p-5 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white border-2 border-amber-300 shadow-sm flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="School logo" className="w-9 h-9 rounded-full object-cover" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-blue-900 leading-tight">SHS Portal</h1>
              <p className="text-xs text-blue-600/80">Student Information System</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4 mb-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-700 to-amber-500 flex items-center justify-center text-white font-semibold">
              {getUserDisplayName().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-800 truncate">{getUserDisplayName()}</p>
              <p className="text-xs text-slate-500">{getUserRole()}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-1.5 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border text-sm font-medium ${isActive
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : 'text-slate-600 border-transparent hover:bg-blue-50/70 hover:text-blue-700 hover:border-blue-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-100">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
          >
            <ExitIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
