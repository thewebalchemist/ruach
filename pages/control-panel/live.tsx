import { useEffect, useState } from 'react';
import { Radio, Save, ExternalLink, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import CPLayout from '@/components/control-panel/CPLayout';
import { supabase } from '@/lib/supabase';

interface StreamSettings {
  id?: number;
  is_live: boolean;
  stream_url: string;
  default_youtube_url: string;
}

export default function LiveControlPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<StreamSettings>({ is_live: false, stream_url: '', default_youtube_url: '' });
  const [error, setError] = useState('');

  // Auth + role gating handled centrally by CPLayout.
  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    const { data } = await supabase.from('stream_settings').select('*').single() as any;
    if (data) {
      setSettings({ id: data.id, is_live: data.is_live, stream_url: data.stream_url || '', default_youtube_url: data.default_youtube_url || '' });
    }
    setLoading(false);
  }

  async function toggleLive() {
    setToggling(true); setError('');
    const newState = !settings.is_live;
    const { error: e } = await (supabase.from('stream_settings') as any).update({ is_live: newState }).eq('id', settings.id);
    if (e) { setError(e.message); setToggling(false); return; }
    setSettings(s => ({ ...s, is_live: newState }));
    setToggling(false);
  }

  async function saveUrls() {
    setSaving(true); setError('');
    const { error: e } = await (supabase.from('stream_settings') as any)
      .update({ stream_url: settings.stream_url, default_youtube_url: settings.default_youtube_url })
      .eq('id', settings.id);
    if (e) { setError(e.message); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function getYouTubeId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return match?.[1] || null;
  }

  const previewId = getYouTubeId(settings.is_live ? settings.stream_url : settings.default_youtube_url);

  return (
    <CPLayout title="Live Stream" subtitle="Control your live stream and set default video">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          {/* Live toggle */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Stream Status</h2>
                <p className="text-sm text-gray-500 mt-0.5">Toggle to go live or end the stream</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                settings.is_live ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-[#222] dark:text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${settings.is_live ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                {settings.is_live ? 'LIVE' : 'OFFLINE'}
              </div>
            </div>

            <button
              onClick={toggleLive}
              disabled={toggling}
              className={`w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all ${
                settings.is_live
                  ? 'bg-gray-800 hover:bg-gray-900 dark:bg-[#333] dark:hover:bg-[#444]'
                  : 'bg-[#BF0A30] hover:bg-[#A00828]'
              }`}
            >
              {toggling ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Radio className="w-5 h-5" />
              )}
              {settings.is_live ? 'End Stream' : 'Go Live'}
            </button>

            {settings.is_live && (
              <div className="mt-4 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  Stream is live. Viewers are seeing the live stream URL below.
                </p>
              </div>
            )}
          </div>

          {/* URLs */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Stream URLs</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Live Stream URL <span className="text-[#BF0A30]">*</span>
              </label>
              <input
                type="url"
                value={settings.stream_url}
                onChange={e => setSettings(s => ({ ...s, stream_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=LIVE_VIDEO_ID"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
              />
              <p className="text-xs text-gray-400 mt-1.5">Used when the stream is live. Paste the YouTube live URL.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Default YouTube URL (when not live)
              </label>
              <input
                type="url"
                value={settings.default_youtube_url}
                onChange={e => setSettings(s => ({ ...s, default_youtube_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=LATEST_SERMON_ID"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
              />
              <p className="text-xs text-gray-400 mt-1.5">Shown to visitors when stream is offline (usually latest sermon).</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={saveUrls}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save URLs
              </button>
              {saved && (
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Saved
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {previewId && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Preview — {settings.is_live ? 'Live Stream' : 'Default Video'}
                </h2>
                <a
                  href={settings.is_live ? settings.stream_url : settings.default_youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#BF0A30] font-medium hover:underline"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${previewId}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      )}
    </CPLayout>
  );
}
