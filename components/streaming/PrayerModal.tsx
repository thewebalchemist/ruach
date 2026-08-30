import { Send, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PrayerModalProps {
  onClose: () => void;
}

export default function PrayerModal({ onClose }: PrayerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // name/phone were never real columns (prayer_requests only has
      // user_id/is_anonymous/category/request) — RLS also requires
      // auth.uid() IS NOT NULL, so this needs the real Supabase session
      // (not the separate localStorage-based getCurrentUser() used
      // elsewhere in this module), matching NotesEditor.tsx's pattern.
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('prayer_requests')
        .insert({
          user_id:      user?.id ?? null,
          is_anonymous: !formData.name.trim(),
          category:     'other',
          request:      formData.message,
        });

      if (error) throw error;

      alert('Prayer request submitted successfully! Our team will reach out to you.');
      setFormData({ name: '', phone: '', message: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      alert('Error submitting prayer request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[2rem] transition-colors"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-[#BF0A30] bg-opacity-10 rounded-[2rem]">
              <Send className="w-6 h-6 text-[#BF0A30]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Prayer Request
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share your prayer request with us
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
              placeholder="+254 700 000000"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Prayer Request *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30] resize-none"
              placeholder="Share your prayer request..."
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
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-[2rem] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}