import { Calendar, Link as LinkIcon, Lock, Save, Unlock, Youtube, Plus, Trash2, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, ServiceSchedule } from '@/lib/supabase';
import { Sermon } from '@/types';
import { generateSlug, getYouTubeThumbnail } from '@/lib/utils';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [defaultYoutubeUrl, setDefaultYoutubeUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [services, setServices] = useState<ServiceSchedule[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Sermon form state
  const [sermonForm, setSermonForm] = useState({
    title: '',
    preacher: '',
    youtube_url: '',
    service_date: new Date().toISOString().split('T')[0],
    summary: '',
  });
  const [editingSermonId, setEditingSermonId] = useState<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'ruach2025') {
      setIsAuthenticated(true);
      loadSettings();
    } else {
      alert('Invalid credentials');
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load stream settings
      const { data: streamData, error: streamError } = await supabase
        .from('stream_settings')
        .select('*')
        .single();

      if (streamError) throw streamError;

      setLiveStreamUrl(streamData.live_url || '');
      setDefaultYoutubeUrl(streamData.default_youtube_url || '');
      setIsLive(streamData.is_live || false);

      // Load services
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_schedule')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Load sermons
      const { data: sermonsData, error: sermonsError } = await supabase
        .from('sermons')
        .select('*')
        .order('service_date', { ascending: false });

      if (sermonsError) throw sermonsError;
      setSermons(sermonsData || []);

    } catch (error) {
      console.error('Error loading settings:', error);
      alert('Error loading settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStreamSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('stream_settings')
        .update({
          live_url: liveStreamUrl,
          default_youtube_url: defaultYoutubeUrl,
          is_live: isLive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) throw error;

      await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: liveStreamUrl, 
          isLive,
          defaultYoutubeUrl 
        }),
      });

      alert('Stream settings saved successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error saving stream settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServices = async () => {
    setLoading(true);
    try {
      await supabase.from('service_schedule').delete().neq('id', 0);

      const { error } = await supabase
        .from('service_schedule')
        .insert(
          services.map(({ id, created_at, ...service }) => service)
        );

      if (error) throw error;

      alert('Services saved successfully!');
      loadSettings();
    } catch (error) {
      console.error('Error saving services:', error);
      alert('Error saving services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    const newService: ServiceSchedule = {
      id: Date.now(),
      title: 'New Service',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      description: 'Service description',
      created_at: new Date().toISOString(),
    };
    setServices([...services, newService]);
  };

  const updateService = (id: number, field: keyof ServiceSchedule, value: string) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const deleteService = (id: number) => {
    setServices(services.filter((service) => service.id !== id));
  };

  // Sermon Management Functions
  const handleSermonFormChange = (field: string, value: string) => {
    setSermonForm({ ...sermonForm, [field]: value });
  };

  const handleSaveSermon = async () => {
    if (!sermonForm.title || !sermonForm.preacher || !sermonForm.youtube_url || !sermonForm.summary) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const slug = generateSlug(sermonForm.title);
      const thumbnail = getYouTubeThumbnail(sermonForm.youtube_url);

      if (editingSermonId) {
        // Update existing sermon
        const { error } = await supabase
          .from('sermons')
          .update({
            ...sermonForm,
            slug,
            thumbnail_url: thumbnail,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSermonId);

        if (error) throw error;
        alert('Sermon updated successfully!');
      } else {
        // Create new sermon
        const { error } = await supabase
          .from('sermons')
          .insert([{
            ...sermonForm,
            slug,
            thumbnail_url: thumbnail,
          }]);

        if (error) throw error;
        alert('Sermon added successfully!');
      }

      // Reset form
      setSermonForm({
        title: '',
        preacher: '',
        youtube_url: '',
        service_date: new Date().toISOString().split('T')[0],
        summary: '',
      });
      setEditingSermonId(null);
      loadSettings();
    } catch (error) {
      console.error('Error saving sermon:', error);
      alert('Error saving sermon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const editSermon = (sermon: Sermon) => {
    setSermonForm({
      title: sermon.title,
      preacher: sermon.preacher,
      youtube_url: sermon.youtube_url,
      service_date: sermon.service_date,
      summary: sermon.summary,
    });
    setEditingSermonId(sermon.id);
    // Scroll to form
    document.getElementById('sermon-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteSermon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sermon?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Sermon deleted successfully!');
      loadSettings();
    } catch (error) {
      console.error('Error deleting sermon:', error);
      alert('Error deleting sermon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-8 h-8 text-[#BF0A30]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Login
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                placeholder="••••••••"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-[2rem] font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-[2rem] font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Login</span>
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Default: admin / ruach2025
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen p-4 flex items-start justify-center pt-20 pb-20">
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-6xl w-full shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Unlock className="w-8 h-8 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h2>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-[2rem] font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>

          {loading && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-[2rem] text-blue-700 dark:text-blue-200 text-center">
              Loading...
            </div>
          )}

          <div className="space-y-8">
            {/* Stream Settings */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-[2rem] p-6">
              <div className="flex items-center space-x-3 mb-6">
                <LinkIcon className="w-6 h-6 text-[#BF0A30]" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Stream Settings
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Live Stream URL
                  </label>
                  <input
                    type="url"
                    value={liveStreamUrl}
                    onChange={(e) => setLiveStreamUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Youtube className="w-4 h-4 inline mr-2" />
                    Default YouTube Video (Fallback)
                  </label>
                  <input
                    type="url"
                    value={defaultYoutubeUrl}
                    onChange={(e) => setDefaultYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="adminIsLive"
                    checked={isLive}
                    onChange={(e) => setIsLive(e.target.checked)}
                    className="w-5 h-5 text-[#BF0A30] border-gray-300 rounded focus:ring-[#BF0A30]"
                  />
                  <label
                    htmlFor="adminIsLive"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Service is currently LIVE
                  </label>
                </div>

                <button
                  onClick={handleSaveStreamSettings}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-[2rem] font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Stream Settings</span>
                </button>
              </div>
            </div>

            {/* Sermon Management */}
            <div id="sermon-form" className="bg-gray-50 dark:bg-gray-800 rounded-[2rem] p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Youtube className="w-6 h-6 text-[#BF0A30]" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingSermonId ? 'Edit Sermon' : 'Add New Sermon'}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sermon Title *
                    </label>
                    <input
                      type="text"
                      value={sermonForm.title}
                      onChange={(e) => handleSermonFormChange('title', e.target.value)}
                      placeholder="The Power of Faith"
                      className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preacher *
                    </label>
                    <input
                      type="text"
                      value={sermonForm.preacher}
                      onChange={(e) => handleSermonFormChange('preacher', e.target.value)}
                      placeholder="Pastor John Doe"
                      className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      YouTube URL *
                    </label>
                    <input
                      type="url"
                      value={sermonForm.youtube_url}
                      onChange={(e) => handleSermonFormChange('youtube_url', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Date *
                    </label>
                    <input
                      type="date"
                      value={sermonForm.service_date}
                      onChange={(e) => handleSermonFormChange('service_date', e.target.value)}
                      className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Summarized Sermon *
                  </label>
                  <textarea
                    value={sermonForm.summary}
                    onChange={(e) => handleSermonFormChange('summary', e.target.value)}
                    placeholder="Paste your AI-generated sermon summary here..."
                    rows={10}
                    className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30] resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Tip: Use ChatGPT or Claude to generate a summary, then paste it here
                  </p>
                </div>

                <div className="flex space-x-3">
                  {editingSermonId && (
                    <button
                      onClick={() => {
                        setSermonForm({
                          title: '',
                          preacher: '',
                          youtube_url: '',
                          service_date: new Date().toISOString().split('T')[0],
                          summary: '',
                        });
                        setEditingSermonId(null);
                      }}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-[2rem] font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSaveSermon}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-[2rem] font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingSermonId ? 'Update Sermon' : 'Add Sermon'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Sermons List */}
            {sermons.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-[2rem] p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Existing Sermons ({sermons.length})
                </h3>
                <div className="space-y-3">
                  {sermons.map((sermon) => (
                    <div
                      key={sermon.id}
                      className="bg-white dark:bg-gray-900 rounded-[2rem] p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {sermon.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {sermon.preacher} • {new Date(sermon.service_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editSermon(sermon)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-[1rem] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSermon(sermon.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-[1rem] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Schedule (existing code continues...) */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-[#BF0A30]" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Service Schedule
                  </h3>
                </div>
                <button
                  onClick={addService}
                  className="px-4 py-2 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-[2rem] text-sm font-medium transition-colors"
                >
                  + Add Service
                </button>
              </div>

              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-gray-900 rounded-[2rem] p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) =>
                            updateService(service.id, 'title', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-[1.5rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={service.date}
                            onChange={(e) =>
                              updateService(service.id, 'date', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-[1.5rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            value={service.time}
                            onChange={(e) =>
                              updateService(service.id, 'time', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-[1.5rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={service.description}
                        onChange={(e) =>
                          updateService(service.id, 'description', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-[1.5rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
                      />
                    </div>

                    <button
                      onClick={() => deleteService(service.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete Service
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveServices}
                disabled={loading}
                className="w-full mt-4 px-6 py-3 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-[2rem] font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}