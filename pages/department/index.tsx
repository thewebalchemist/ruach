import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { mockDepartments } from '@/data';

export default function DepartmentSelectPage() {
  const router = useRouter();
  const [selectedDept, setSelectedDept] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    router.push(`/department/${selectedDept}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#BF0A30] to-[#8B0000] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
          <img 
                src="/images/ruaach.png" 
                alt="RUACH CHURCH Logo" 
                className="w-10 h-10 rounded-full" />
          </div>
          <span className="text-white text-2xl font-bold">RuachConnect</span>
        </div>
        
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">Department Portal</h1>
          <p className="text-white/80 text-lg">
            Manage your department members, resources, schedules, and communications all in one place.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{mockDepartments.length}</p>
              <p className="text-white/70 text-sm">Departments</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-3xl font-bold">{mockDepartments.reduce((s, d) => s + d.memberCount, 0)}</p>
              <p className="text-white/70 text-sm">Total Serving</p>
            </div>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          © 2026 Ruach Assemblies. Department Management System.
        </div>
      </div>

      {/* Right side - Selection */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center">
            <img 
                src="/images/ruaach.png" 
                alt="RUACH CHURCH Logo" 
                className="w-10 h-10 rounded-full" />
            </div>
            <span className="text-gray-900 dark:text-white text-2xl font-bold">RuachConnect</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Department Login</h2>
            <p className="text-gray-500 mt-2">Select your department to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Department</label>
              <select 
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#BF0A30]"
              >
                <option value="">Choose your department...</option>
                {mockDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.icon} {dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter department password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#1A1A1A] focus:ring-2 focus:ring-[#BF0A30]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedDept}
              className="w-full py-3 bg-[#BF0A30] text-white font-medium rounded-lg hover:bg-[#B00325] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Access Department Portal'}
            </button>
          </form>

          {/* Quick Access Grid */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 text-center mb-4">Or quick access:</p>
            <div className="grid grid-cols-4 gap-2">
              {mockDepartments.slice(0, 8).map(dept => (
                <button
                  key={dept.id}
                  onClick={() => router.push(`/department/${dept.id}`)}
                  className="p-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] rounded-lg hover:border-[#BF0A30] transition-colors text-center"
                  title={dept.name}
                >
                  <span className="text-2xl">{dept.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-[#BF0A30]">
              ← Back to main login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
