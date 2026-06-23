import { useState, ReactNode } from 'react';
import Head from 'next/head';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{title} | Ruach Admin</title>
        {description && <meta name="description" content={description} />}
      </Head>

      <div className="min-h-screen bg-[#0A0C10] text-white">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
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
    <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="w-11 h-11 rounded-xl bg-[#BF0A30]/10 flex items-center justify-center text-[#BF0A30]">
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
