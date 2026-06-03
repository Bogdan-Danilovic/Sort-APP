'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { AppSettings } from '@/types';

interface SettingsClientProps {
  locale: string;
  userId: string;
  userEmail: string;
  initialSettings: AppSettings;
}

export default function SettingsClient({
  locale,
  userId,
  userEmail,
  initialSettings,
}: SettingsClientProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const supabase = createClient();

  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [clearConfirm, setClearConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [dangerLoading, setDangerLoading] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          company_name: settings.companyName,
          default_currency: settings.defaultCurrency,
          theme: settings.theme,
        },
      });

      if (error) throw error;

      // Promjena locale-a
      if (settings.locale !== locale) {
        router.push(`/${settings.locale}/settings`);
        return;
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    setDangerLoading(true);
    try {
      await supabase.from('merge_sessions').delete().eq('user_id', userId);
      setClearConfirm(false);
    } finally {
      setDangerLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDangerLoading(true);
    try {
      // Note: Full account deletion requires server-side admin client
      // For now, clear data and sign out
      await supabase.from('merge_sessions').delete().eq('user_id', userId);
      await supabase.auth.signOut();
      router.push(`/${locale}/auth/login`);
    } finally {
      setDangerLoading(false);
    }
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="px-5 py-3 text-xs font-semibold uppercase tracking-wider"
        style={{
          background: 'var(--bg-2)',
          borderBottom: '1px solid var(--border)',
          color: 'var(--text-3)',
        }}
      >
        {title}
      </div>
      <div
        className="p-5 space-y-4"
        style={{ background: 'var(--bg-1)' }}
      >
        {children}
      </div>
    </div>
  );

  const Field = ({
    label,
    hint,
    children,
  }: {
    label: string;
    hint?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <label
          className="block text-sm font-medium"
          style={{ color: 'var(--text-2)' }}
        >
          {label}
        </label>
        {hint && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
            {hint}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 w-52">{children}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Company */}
      <Section title={t('company.title')}>
        <Field
          label={t('company.name')}
          hint={t('company.nameHint')}
        >
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            placeholder={t('company.namePlaceholder')}
            className="w-full px-3 py-2 rounded-md text-sm focus:outline-none transition-colors"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
            }}
          />
        </Field>

        <Field label={t('company.currency')}>
          <select
            value={settings.defaultCurrency}
            onChange={(e) =>
              update('defaultCurrency', e.target.value as 'din' | 'eur' | 'usd')
            }
            className="w-full px-3 py-2 rounded-md text-sm focus:outline-none"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            }}
          >
            <option value="din">{t('company.currencies.din')}</option>
            <option value="eur">{t('company.currencies.eur')}</option>
            <option value="usd">{t('company.currencies.usd')}</option>
          </select>
        </Field>
      </Section>

      {/* Preferences */}
      <Section title={t('preferences.title')}>
        <Field label={t('preferences.language')}>
          <select
            value={settings.locale}
            onChange={(e) =>
              update('locale', e.target.value as 'sr' | 'en')
            }
            className="w-full px-3 py-2 rounded-md text-sm focus:outline-none"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            }}
          >
            <option value="sr">{t('preferences.languages.sr')}</option>
            <option value="en">{t('preferences.languages.en')}</option>
          </select>
        </Field>

        <Field label={t('preferences.theme')}>
          <select
            value={settings.theme}
            onChange={(e) =>
              update('theme', e.target.value as 'dark' | 'light' | 'system')
            }
            className="w-full px-3 py-2 rounded-md text-sm focus:outline-none"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            }}
          >
            <option value="dark">{t('preferences.themes.dark')}</option>
            <option value="light">{t('preferences.themes.light')}</option>
            <option value="system">{t('preferences.themes.system')}</option>
          </select>
        </Field>
      </Section>

      {/* Save button */}
      <div className="flex items-center justify-between">
        <div>
          {saveStatus === 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs"
              style={{ color: '#6ee7b7' }}
            >
              ✓ {t('saveSuccess')}
            </motion.p>
          )}
          {saveStatus === 'error' && (
            <p className="text-xs" style={{ color: '#fca5a5' }}>
              {t('saveError')}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} strokeWidth={2} />
          )}
          {saving ? 'Čuvanje...' : t('save')}
        </button>
      </div>

      {/* Danger zone */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
          }}
        >
          <AlertTriangle size={13} strokeWidth={2} />
          {t('danger.title')}
        </div>
        <div
          className="p-5 space-y-4"
          style={{ background: 'var(--bg-1)' }}
        >
          {/* Clear history */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                {t('danger.clearHistory')}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                {t('danger.clearHistoryDescription')}
              </p>
            </div>
            {clearConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setClearConfirm(false)}
                  className="px-3 py-1.5 text-xs rounded-md"
                  style={{ background: 'var(--bg-3)', color: 'var(--text-2)' }}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleClearHistory}
                  disabled={dangerLoading}
                  className="px-3 py-1.5 text-xs rounded-md font-medium disabled:opacity-40"
                  style={{ background: '#ef4444', color: 'white' }}
                >
                  {dangerLoading ? 'Brisanje...' : 'Potvrdi'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-colors"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#fca5a5',
                }}
              >
                <Trash2 size={12} strokeWidth={2} />
                {t('danger.clearHistory')}
              </button>
            )}
          </div>

          {/* Delete account */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                {t('danger.deleteAccount')}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                {t('danger.deleteAccountDescription')}
              </p>
            </div>
            {deleteConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs rounded-md"
                  style={{ background: 'var(--bg-3)', color: 'var(--text-2)' }}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={dangerLoading}
                  className="px-3 py-1.5 text-xs rounded-md font-medium disabled:opacity-40"
                  style={{ background: '#7f1d1d', color: '#fca5a5' }}
                >
                  {dangerLoading ? 'Brisanje...' : 'OBRIŠI NALOG'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-colors"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#fca5a5',
                }}
              >
                <Trash2 size={12} strokeWidth={2} />
                {t('danger.deleteAccount')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
