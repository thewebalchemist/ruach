import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, FileText, Download, Upload, Folder, File, Image, Video, Music, Trash2, Eye } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { mockDepartments } from '@/data';

// Mock resources data
const mockResources = [
  { id: 'r1', name: 'Training Manual 2026', type: 'pdf', size: '2.4 MB', category: 'Training', uploadedAt: '2026-01-15', uploadedBy: 'Dept. Leader' },
  { id: 'r2', name: 'Service Guidelines', type: 'pdf', size: '1.1 MB', category: 'Guidelines', uploadedAt: '2026-01-10', uploadedBy: 'Dept. Leader' },
  { id: 'r3', name: 'Equipment List', type: 'xlsx', size: '245 KB', category: 'Inventory', uploadedAt: '2026-01-08', uploadedBy: 'Admin' },
  { id: 'r4', name: 'Team Photos 2025', type: 'folder', size: '45 items', category: 'Media', uploadedAt: '2026-01-05', uploadedBy: 'Dept. Leader' },
  { id: 'r5', name: 'Welcome Video', type: 'video', size: '125 MB', category: 'Media', uploadedAt: '2025-12-20', uploadedBy: 'Media Team' },
  { id: 'r6', name: 'Contact List', type: 'xlsx', size: '89 KB', category: 'Admin', uploadedAt: '2025-12-15', uploadedBy: 'Dept. Leader' },
];

const categories = ['All', 'Training', 'Guidelines', 'Inventory', 'Media', 'Admin'];

export default function DepartmentResourcesPage() {
  const router = useRouter();
  const { deptId } = router.query;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  
  const department = mockDepartments.find(d => d.id === deptId);
  
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  const filtered = mockResources.filter(r => {
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'xlsx': return <FileText className="w-6 h-6 text-green-500" />;
      case 'folder': return <Folder className="w-6 h-6 text-amber-500" />;
      case 'video': return <Video className="w-6 h-6 text-blue-500" />;
      case 'image': return <Image className="w-6 h-6 text-purple-500" />;
      case 'audio': return <Music className="w-6 h-6 text-pink-500" />;
      default: return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <DepartmentLayout department={department} title="Resources">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Resources</h1>
          <p className="text-gray-500">Training materials, documents, and media</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium">
          <Upload className="w-4 h-4" />Upload Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Total Resources</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockResources.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Documents</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockResources.filter(r => ['pdf', 'xlsx'].includes(r.type)).length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Media</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockResources.filter(r => ['video', 'image', 'audio', 'folder'].includes(r.type)).length}</p>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length - 1}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Search resources..." 
              className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#BF0A30] text-white'
                    : 'bg-gray-100 dark:bg-[#252525] text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(resource => (
          <div key={resource.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#252525] flex items-center justify-center">
                {getFileIcon(resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{resource.name}</h3>
                <p className="text-sm text-gray-500">{resource.size}</p>
                <p className="text-xs text-gray-400 mt-1">{resource.category} • {new Date(resource.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-[#2D2D2D]">
              <span className="text-xs text-gray-500">By {resource.uploadedBy}</span>
              <div className="flex gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-600" title="View"><Eye className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-[#BF0A30]" title="Download"><Download className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No resources found</p>
        </div>
      )}
    </DepartmentLayout>
  );
}
