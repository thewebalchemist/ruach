import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface Option { id: string; name: string }

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [crosspoints, setCrosspoints] = useState<Option[]>([]);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'church-wide', departmentId: '', crosspointId: '',
    event_date: '', end_date: '', start_time: '', end_time: '', location: '',
    capacity: '', requiresRegistration: false,
    image_url: '', is_public: true, chatbot_enabled: true,
  });

  useEffect(() => {
    supabase.from('departments').select('id, name').order('name').then(({ data }) => setDepartments(data ?? []));
    supabase.from('crosspoints').select('id, name').eq('status', 'active').order('name').then(({ data }) => setCrosspoints(data ?? []));
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
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
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    const { error: insertError } = await supabase.from('events').insert({
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      category: formData.type,
      department_id: formData.type === 'department' ? (formData.departmentId || null) : null,
      crosspoint_id: formData.type === 'crosspoint' ? (formData.crosspointId || null) : null,
      event_date: formData.event_date,
      end_date: formData.end_date || null,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      location: formData.location || null,
      capacity: formData.requiresRegistration && formData.capacity ? parseInt(formData.capacity, 10) : null,
      requires_registration: formData.requiresRegistration,
      image_url: formData.image_url || null,
      is_public: formData.is_public,
      chatbot_enabled: formData.chatbot_enabled,
      status: 'upcoming',
      created_by: session?.user.id ?? null,
    });
    setLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push('/admin/events');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  return (
    <AdminLayout title="Create Event">
      <div className="max-w-3xl">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Events
        </Link>

        <PageHeader title="Create Event" subtitle="Add a new church event" />

        {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-700 dark:text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Event Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                    <option value="church-wide">Church-wide</option>
                    <option value="department">Department</option>
                    <option value="crosspoint">Crosspoint</option>
                  </select>
                </div>
                {formData.type === 'department' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                      <option value="">Select department...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
                {formData.type === 'crosspoint' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crosspoint</label>
                    <select name="crosspointId" value={formData.crosspointId} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
                      <option value="">Select crosspoint...</option>
                      {crosspoints.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Event Image</h2>
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
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-[#2D2D2D] rounded-lg cursor-pointer hover:border-[#BF0A30]/50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload event image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Date & Time</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Location & Registration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue *</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                <input type="checkbox" name="requiresRegistration" checked={formData.requiresRegistration} onChange={handleChange} className="w-4 h-4 text-[#BF0A30] rounded" />
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">Requires Registration</label>
                  <p className="text-sm text-gray-500">Attendees must register to attend</p>
                </div>
              </div>
              {formData.requiresRegistration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="Maximum attendees" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} className="w-4 h-4 text-[#BF0A30] rounded" />
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">Publicly Visible</label>
                  <p className="text-sm text-gray-500">Show this event on the public site</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                <input type="checkbox" name="chatbot_enabled" checked={formData.chatbot_enabled} onChange={handleChange} className="w-4 h-4 text-[#BF0A30] rounded" />
                <div>
                  <label className="font-medium text-gray-900 dark:text-white">Include in AI Assistant</label>
                  <p className="text-sm text-gray-500">Let the chatbot answer questions about this event</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/events" className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-50">
              <Save className="w-4 h-4" />{loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
