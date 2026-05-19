import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/utils';
import { User as UserType } from '@/types';
import Link from 'next/link';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Sign up
        const passwordHash = await hashPassword(formData.password);
        
        const { data, error: signupError } = await supabase
          .from('users')
          .insert([{
            name: formData.name,
            email: formData.email.toLowerCase(),
            password_hash: passwordHash,
          }])
          .select()
          .single();

        if (signupError) {
          if (signupError.code === '23505') {
            throw new Error('An account with this email already exists');
          }
          throw signupError;
        }

        // Create session
        const session = {
          user: {
            id: data.id,
            name: data.name,
            email: data.email,
            image_url: data.image_url,
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
          token: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        };
        
        localStorage.setItem('ruachstream_session', JSON.stringify(session));
        onSuccess(session.user);
      } else {
        // Sign in
        const passwordHash = await hashPassword(formData.password);
        
        const { data, error: signinError } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email.toLowerCase())
          .eq('password_hash', passwordHash)
          .single();

        if (signinError || !data) {
          throw new Error('Invalid email or password');
        }

        // Create session
        const session = {
          user: {
            id: data.id,
            name: data.name,
            email: data.email,
            image_url: data.image_url,
            created_at: data.created_at,
            updated_at: data.updated_at,
          },
          token: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        localStorage.setItem('ruachstream_session', JSON.stringify(session));
        onSuccess(session.user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1e28] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
              <Link href="/" className="flex items-center gap-2 sm:gap-3 justify-center mx-auto mb-4">
                <div className="flex items-center space-x-2">
                  <img
                    src="/images/ruaach.png"
                    alt="RUACH CHURCH Logo"
                    className="w-10 h-10 rounded-full" />
                </div>
              </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {mode === 'signin'
              ? 'Sign in to access your watchlist'
              : 'Join RuachOnline to save your favorite sermons'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12151c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12151c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12151c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="ml-2 text-[#BF0A30] hover:text-[#9a0826] font-semibold"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}