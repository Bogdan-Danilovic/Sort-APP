'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import MergeKitLogo from '@/components/ui/MergeKitLogo';

interface LoginFormProps {
  locale: string;
}

export default function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('password')) {
          setError(t('errors.invalidCredentials'));
        } else if (msg.includes('confirm') || msg.includes('email') || msg.includes('not confirmed')) {
          setError('Email adresa nije potvrđena. Proverite inbox i kliknite na link za potvrdu.');
        } else if (msg.includes('rate') || msg.includes('limit')) {
          setError('Previše pokušaja. Sačekajte par minuta pa pokušajte ponovo.');
        } else {
          setError(`Greška: ${authError.message}`);
        }
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/callback`,
      },
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0a0a0a' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div style={{ filter: 'drop-shadow(0 0 16px rgba(58,129,246,0.3))' }}>
            <MergeKitLogo locale={locale} />
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: '#111111', border: '1px solid #1f1f1f' }}
        >
          <h1 className="text-xl font-semibold mb-1" style={{ color: '#fafafa' }}>
            {t('login')}
          </h1>
          <p className="text-sm mb-6" style={{ color: '#a1a1a1' }}>
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/auth/register`}
              className="font-medium transition-colors"
              style={{ color: '#91c5ff' }}
            >
              {t('register')}
            </Link>
          </p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-5 cursor-pointer"
            style={{
              background: '#1a1a1a',
              border: '1px solid #262626',
              color: '#fafafa',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3a3a3a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#262626'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('loginWithGoogle')}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: '#1f1f1f' }} />
            <span className="text-xs" style={{ color: '#525252' }}>ili</span>
            <div className="flex-1 h-px" style={{ background: '#1f1f1f' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: '#a1a1a1' }}>
                {t('email')}
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#525252' }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full pl-9 pr-3 py-3 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{ background: '#1a1a1a', border: '1px solid #262626', color: '#fafafa' }}
                  onFocus={(e) => { e.target.style.borderColor = '#3a81f6'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#262626'; }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium mb-1.5" style={{ color: '#a1a1a1' }}>
                {t('password')}
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#525252' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-3 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{ background: '#1a1a1a', border: '1px solid #262626', color: '#fafafa' }}
                  onFocus={(e) => { e.target.style.borderColor = '#3a81f6'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#262626'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: '#525252' }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs px-3 py-2.5 rounded-lg"
                style={{ background: 'rgba(231,0,11,0.08)', color: '#f87171', border: '1px solid rgba(231,0,11,0.2)' }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
                color: '#ffffff',
                height: 48,
              }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Prijavljivanje...' : t('login')}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
