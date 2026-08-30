import { useRouter } from 'next/router';
import Link from 'next/link';
import { ClipboardList, Loader2 } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { useDepartment } from '@/hooks/useDepartment';

export default function DepartmentAssignmentsPage() {
  const router = useRouter();
  const { deptId } = router.query as { deptId?: string };
  const { department, loading } = useDepartment(deptId);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  return (
    <DepartmentLayout department={department} title="Assignments">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Duty Assignments</h1>
        <p className="text-gray-500">Manage member assignments and duties</p>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
        <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Duty assignments aren't available yet</p>
        <p className="text-sm text-gray-400 mt-1">Use the <Link href={`/department/${deptId}/schedule`} className="text-[#BF0A30] hover:underline">Schedule</Link> page to coordinate services and events in the meantime.</p>
      </div>
    </DepartmentLayout>
  );
}
