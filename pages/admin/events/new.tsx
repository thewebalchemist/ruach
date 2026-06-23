import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function NewEventPage() {
  const router = useRouter();
  const { loading: authLoading, authHeaders } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [crosspoints, setCrosspoints] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'church-wide',
    event_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    image_url: '',
    is_public: true,
    chatbot_enabled: true,
  });

  useEffect(() => {
    if (authLoading) return;
    // Fetch departments and crosspoints for dropdowns
    supabase.from('departments').select('id, name').then(({ data }) => {
      if (data) setDepartments(data);
    });
    supabase.from('crosspoints').select('id, name').then(({ data }) => {
      if (data) setCrosspoints(data);
    });
  }, [authLoading]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const headers = authHeaders();
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            file_base64: base64,
            file_name: file.name,
            content_type: file.type,
          }),
        });
        const result = await res.json();
        if (res.ok && result.url) {
          setFormData(prev => ({ ...prev, image_url: result.url }));
          setImagePreview(result.url);
        } else {
          alert(result.error || 'Upload failed');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      alert('Upload failed');
      setUploading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const headers = authHeaders();
    const res = await fetch('/api/control-panel/events', {
      method: 'POST',
      headers,
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push('/admin/events');
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create event');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (authLoading) {
    return (
      <AdminLayout title="Create Event">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Create Event">
      <div className="max-w-3xl">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white/70 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Events
        </Link>

        <PageHeader title="Create Event" subtitle="Add a new church event" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Event Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Event Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C] text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C] text-white" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C] text-white">
                    <option value="church-wide">Church-wide</option>
                    <option value="department">Department</option>
                    <option value="crosspoint">Crosspoint</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Event Image</h2>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Event preview" className="w-full max-h-64 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image_url: '' })); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 dark:border-[#2D2D2D] rounded-lg cursor-pointer hover:border-[#BF0A30]/50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload event image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Date & Time</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Start Date *</label>
                <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C] text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">End Date</label>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C] text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Start Time</label>
                <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C] text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">End Time</label>
                <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C] text-white" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
            <h2 className="font-semibold text-white mb-4">Location</h2>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Venue</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-[#12151C] text-white" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/events" className="px-4 py-2.5 text-sm font-medium text-white/70 border border-white/10 rounded-lg hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
              <Save className="w-4 h-4" />{loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
