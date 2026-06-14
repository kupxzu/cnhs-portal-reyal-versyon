import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import type { BreadcrumbItem } from './Breadcrumb';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function DashboardLayout({ children, title = 'Dashboard', breadcrumbs }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-amber-50/40">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header title={title} onMenuClick={() => setIsSidebarOpen(true)} />
      
      <main className="pt-(--header-height) min-h-screen lg:ml-(--sidebar-width)">
        <div className="p-4 sm:p-6">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb items={breadcrumbs} />
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
