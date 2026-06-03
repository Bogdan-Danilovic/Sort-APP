'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Layers, Mail, Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface RegisterFormProps {
  locale: string;
}

export default function RegisterForm({ locale }: RegisterFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordLongEnough = password.length >= 8;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !passwordsMatch || !passwordLongEnough) return;

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/callback`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError(t('errors.emailInUse'));
        } else {
          setError(t('errors.generic'));
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--bg-0)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(16, 185, 129, 0.15)' }}
          >
            <Check size={24} style={{ color: '#10b981' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-1)' }}>
            Nalog kreiran!
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>
            {t('success.registered')}
          </p>
          <Link
            href={`/${locale}/auth/login`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {t('login')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-0)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <Layers size={16} strokeWidth={2.5} className="text-white" />
          </div>
          <span
            className="font-mono font-semibold text-base"
            style={{ color: 'var(--text-1)' }}
          >
            MergeKit
          </span>
        </div>

        <h1
          className="text-2xl font-semibold mb-1"
          style={{ color: 'var(--text-1)' }}
        >
          {t('register')}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>
          {t('hasAccount')}{' '}
          <Link
            href={`/${locale}/auth/login`}
            className="font-medium"
            style={{ color: '#818cf8' }}
          >
            {t('login')}
          </Link>
        </p>

        <form onSubmit={handleRegister} className="space-y-3">
          {/* Email */}
          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-2)' }}
            >
              {t('email')}
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-3)' }}
              />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="reg-password"
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-2)' }}
            >
              {t('password')}
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-3)' }}
              />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                style={{
                  background: 'var(--bg-2)',
                  border: `1px solid ${password && !passwordLongEnough ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                  color: 'var(--text-1)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    password && !passwordLongEnough
                      ? 'rgba(239,68,68,0.5)'
                      : 'var(--border)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-3)' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {password && !passwordLongEnough && (
              <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>
                {t('errors.shortPassword')}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="reg-confirm"
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--text-2)' }}
            >
              {t('confirmPassword')}
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-3)' }}
              />
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                style={{
                  background: 'var(--bg-2)',
                  border: `1px solid ${confirmPassword && !passwordsMatch ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                  color: 'var(--text-1)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    confirmPassword && !passwordsMatch
                      ? 'rgba(239,68,68,0.5)'
                      : 'var(--border)';
                }}
              />
              {confirmPassword && passwordsMatch && (
                <Check
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#10b981' }}
                />
              )}
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>
                {t('errors.passwordMismatch')}
              </p>
            )}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
              }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !email ||
              !passwordLongEnough ||
              !passwordsMatch
            }
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 mt-2"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Kreiranje...' : t('register')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
