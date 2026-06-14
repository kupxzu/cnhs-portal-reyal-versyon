import { HamburgerMenuIcon, BellIcon } from '@radix-ui/react-icons';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = 'Dashboard', onMenuClick }: HeaderProps) {
  return (
    <header 
      className="fixed top-0 right-0 left-0 lg:left-(--sidebar-width) bg-white/90 backdrop-blur-md border-b border-blue-100 flex items-center justify-between px-4 sm:px-6 z-20"
      style={{ 
        height: 'var(--header-height)',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-blue-50 rounded-lg"
          aria-label="Open menu"
        >
          <HamburgerMenuIcon className="w-5 h-5 text-blue-800" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-blue-50 rounded-lg relative" aria-label="Notifications">
          <BellIcon className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
