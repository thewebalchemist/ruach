import { useState } from 'react';
import Layout from '@/components/shared/Layout';
import { supabase } from '@/lib/supabase';

interface PublicPrayer {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export default function PrayPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [prayers, setPrayers] = useState<PublicPrayer[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const { error: err } = await supabase.from('prayer_requests').insert({
        name: name.trim() || 'Anonymous',
        message: message.trim(),
      });

      if (err) throw err;
      setSubmitted(true);
      setName('');
      setMessage('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Prayer Wall">
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <div className="mb-10 text-center">
          <p className="text-[#BF0A30] text-sm font-bold uppercase tracking-widest mb-3">
            Prayer Wall
          </p>
          <h1 className="text-4xl font-extrabold text-white mb-4">Share Your Request</h1>
          <p className="text-[#8B95A8] leading-relaxed max-w-lg mx-auto">
            We believe in the power of collective prayer. Share your request and know that our
            community is standing with you.
          </p>
        </div>

        {/* Submit form */}
        <div className="glass-card p-8 mb-12">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Request Submitted</h3>
              <p className="text-[#8B95A8] mb-6">
                Thank you for trusting us with your prayer request. We are praying with you.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn btn-secondary">
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Leave blank to submit anonymously"
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Prayer Request <span className="required">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share what you would like prayer for..."
                  className="textarea"
                  required
                />
              </div>
              {error && <p className="form-error mb-4">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="btn btn-primary w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Prayer Request'}
              </button>
            </form>
          )}
        </div>

        {/* Encouragement */}
        {prayers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#BF0A30] text-4xl mb-4">🙏</p>
            <p className="text-[#8B95A8] leading-relaxed">
              &ldquo;The prayer of a righteous person is powerful and effective.&rdquo;
            </p>
            <p className="text-[#4A5568] text-sm mt-2">James 5:16</p>
          </div>
        )}

        {prayers.length > 0 && (
          <div>
            <h2 className="text-white text-xl font-bold mb-6">Community Requests</h2>
            <div className="space-y-4">
              {prayers.map((p) => (
                <div key={p.id} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="avatar avatar-sm">{p.name?.[0] ?? 'A'}</div>
                    <div>
                      <p className="text-white text-sm font-semibold">{p.name}</p>
                      <p className="text-[#4A5568] text-xs">
                        {new Date(p.created_at).toLocaleDateString('en-KE')}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#8B95A8] text-sm leading-relaxed">{p.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
