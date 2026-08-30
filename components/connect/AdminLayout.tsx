import { useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Loader2, ShieldOff } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  /** Optional finer-grained gate, e.g. { moduleKey: 'members', action: 'view' } —
   * on top of the coarse admin/pastor check every admin page gets by default. */
  requirePermission?: { moduleKey: string; action: string };
}

export function AdminLayout({ children, title, description, requirePermission }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, isAdmin, hasPermission } = useAuth();
  const router = useRouter();

  // Coarse gate: middleware only guarantees *a* session for /admin/**, not
  // role — this closes that gap for every page that renders through here
  // (see AUDIT_REPORT.md finding: "30 of 32 admin pages have no role check").
  // Finer per-module checks are opt-in via requirePermission, added module
  // by module as each is wired to real data (Batches 4-8).
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F0F]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F0F] p-6">
        <div className="text-center max-w-sm">
          <ShieldOff className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Not authorized</h1>
          <p className="text-sm text-gray-500 mb-6">You don't have access to the admin portal.</p>
          <button onClick={() => router.push('/auth/login')} className="btn btn-primary">Sign in</button>
        </div>
      </div>
    );
  }

  if (requirePermission && !hasPermission(requirePermission.moduleKey, requirePermission.action)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F0F] p-6">
        <div className="text-center max-w-sm">
          <ShieldOff className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No access</h1>
          <p className="text-sm text-gray-500">You don't have permission to view this module. Ask a super admin to grant it.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} | Ruach Admin</title>
        {description && <meta name="description" content={description} />}
      </Head>

      <div className="min-h-screen bg-gray-100 dark:bg-[#08090C]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-[288px]">
          <Header title={title} onMenuClick={() => setSidebarOpen(true)} />

          <main className="px-4 lg:px-6 pb-8">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; isPositive: boolean };
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="w-11 h-11 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center text-[#BF0A30] flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-white/40 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      {icon && <div className="text-white/20 mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-base font-medium text-white/70">{title}</h3>
      {description && <p className="text-sm text-white/40 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
