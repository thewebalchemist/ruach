import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Save, Loader2, CheckCircle, AlertCircle, ExternalLink, Shield } from 'lucide-react';
import CPLayout from '@/components/control-panel/CPLayout';
import { supabase } from '@/lib/supabase';

const inp = "w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";
const lbl = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

export default function ControlPanelSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    siteTitle: 'Ruach Tabernacle Assembly',
    siteTagline: 'God | Work | Community',
    twitterHandle: '@ruachtabernacle',
    googleVerification: 'chk8boBGW8ULmGORL1lTISWXoh6x1Kf5OUELQ8bxxeY',
    facebookAppId: '',
    ogImageUrl: '',
    maintenanceMode: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { router.push('/auth/login?redirectTo=/control-panel/settings'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single() as any;
    if (!profile || !['admin', 'pastor'].includes(profile.role)) { router.push('/'); return; }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    // In production: save to a site_settings table in Supabase
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  const ENV_VARS = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', desc: 'Supabase project URL' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase anonymous key' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase service role key (server-only)' },
    { name: 'GROQ_API_KEY', desc: 'Groq API key for Ask Ruach AI' },
    { name: 'NEXT_PUBLIC_R2_PUBLIC_URL', desc: 'Cloudflare R2 public URL for audio files' },
    { name: 'R2_ACCOUNT_ID', desc: 'Cloudflare R2 account ID' },
    { name: 'R2_ACCESS_KEY_ID', desc: 'Cloudflare R2 access key' },
    { name: 'R2_SECRET_ACCESS_KEY', desc: 'Cloudflare R2 secret key' },
    { name: 'R2_BUCKET_NAME', desc: 'Cloudflare R2 bucket name' },
    { name: 'EMAIL_HOST', desc: 'SMTP host for system emails' },
    { name: 'EMAIL_USER', desc: 'SMTP username' },
    { name: 'EMAIL_PASS', desc: 'SMTP password' },
    { name: 'EMAIL_FROM', desc: 'From address for system emails' },
    { name: 'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION', desc: 'Google Search Console verification' },
  ];

  return (
    <CPLayout title="Settings" subtitle="Site-wide configuration">
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="max-w-2xl space-y-6">
          {/* SEO & Metadata */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">SEO & Sharing</h2>
            <div><label className={lbl}>Site Title</label><input value={form.siteTitle} onChange={e => set('siteTitle', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Tagline</label><input value={form.siteTagline} onChange={e => set('siteTagline', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Twitter / X Handle</label><input value={form.twitterHandle} onChange={e => set('twitterHandle', e.target.value)} placeholder="@ruachtabernacle" className={inp} /></div>
            <div>
              <label className={lbl}>Default OG Image URL</label>
              <input type="url" value={form.ogImageUrl} onChange={e => set('ogImageUrl', e.target.value)} placeholder="https://ruachtabernacle.org/brand/og-image.jpg" className={inp} />
              <p className="text-xs text-gray-400 mt-1.5">
                The image shown when your site link is shared on WhatsApp, Twitter, etc. Recommended: 1200×630px JPG.
                Place it at <code className="bg-gray-100 dark:bg-[#222] px-1 rounded">/public/brand/og-image.jpg</code>.
              </p>
            </div>
            <div><label className={lbl}>Google Site Verification (Search Console)</label><input value={form.googleVerification} onChange={e => set('googleVerification', e.target.value)} placeholder="google123abc…" className={inp} /></div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-60 text-white text-sm font-semibold rounded-xl">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>

          {/* Environment Variables reference */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Environment Variables</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">Set these in your <code className="bg-gray-100 dark:bg-[#222] px-1.5 py-0.5 rounded">.env.local</code> file or your hosting provider's environment settings.</p>
            <div className="space-y-2">
              {ENV_VARS.map(v => (
                <div key={v.name} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-[#222] last:border-0">
                  <code className="text-xs bg-gray-100 dark:bg-[#222] px-2 py-1 rounded font-mono text-gray-800 dark:text-gray-200 flex-shrink-0 mt-0.5">{v.name}</code>
                  <p className="text-xs text-gray-500 pt-1">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </CPLayout>
  );
}
