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
      await supabase.from('merge_sessions').delete().eq('user_id', userId);
      await supabase.auth.signOut();
      router.push(`/${locale}/auth/login`);
    } finally {
      setDangerLoading(false);
    }
  };

  const inputStyle = {
    background: '#0c0c12',
    border: '1px solid #141420',
    color: '#c8c8d8',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    transition: 'border-color 150ms ease',
  } as const;

  return (
    <div className="space-y-4" style={{ maxWidth: 640 }}>

      {/* ── Company ───────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0c0c12', border: '1px solid #141420' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #101018' }}>
          <p style={{ color: '#252535', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('company.title')}
          </p>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Company name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div style={{ flex: 1 }}>
              <p style={{ color: '#a0a0b8', fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{t('company.name')}</p>
              <p style={{ color: '#252535', fontSize: 12, lineHeight: 1.4 }}>{t('company.nameHint')}</p>
            </div>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder={t('company.namePlaceholder')}
              style={{ ...inputStyle, maxWidth: '100%' }}
              className="sm:w-52"
              onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#141420'; }}
            />
          </div>
          {/* Currency */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div style={{ flex: 1 }}>
              <p style={{ color: '#a0a0b8', fontWeight: 500, fontSize: 14 }}>{t('company.currency')}</p>
            </div>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => update('defaultCurrency', e.target.value as 'din' | 'eur' | 'usd')}
              style={inputStyle}
              className="sm:w-52 cursor-pointer"
              onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#141420'; }}
            >
              <option value="din">{t('company.currencies.din')}</option>
              <option value="eur">{t('company.currencies.eur')}</option>
              <option value="usd">{t('company.currencies.usd')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Preferences ───────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0c0c12', border: '1px solid #141420' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #101018' }}>
          <p style={{ color: '#252535', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('preferences.title')}
          </p>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Language */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div style={{ flex: 1 }}>
              <p style={{ color: '#a0a0b8', fontWeight: 500, fontSize: 14 }}>{t('preferences.language')}</p>
            </div>
            <select
              value={settings.locale}
              onChange={(e) => update('locale', e.target.value as 'sr' | 'en')}
              style={inputStyle}
              className="sm:w-52 cursor-pointer"
              onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#141420'; }}
            >
              <option value="sr">{t('preferences.languages.sr')}</option>
              <option value="en">{t('preferences.languages.en')}</option>
            </select>
          </div>
          {/* Theme */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div style={{ flex: 1 }}>
              <p style={{ color: '#a0a0b8', fontWeight: 500, fontSize: 14 }}>{t('preferences.theme')}</p>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => update('theme', e.target.value as 'dark' | 'light' | 'system')}
              style={inputStyle}
              className="sm:w-52 cursor-pointer"
              onFocus={(e) => { e.target.style.borderColor = 'rgba(58,129,246,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#141420'; }}
            >
              <option value="dark">{t('preferences.themes.dark')}</option>
              <option value="light">{t('preferences.themes.light')}</option>
              <option value="system">{t('preferences.themes.system')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Save ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div style={{ minHeight: 20 }}>
          {saveStatus === 'success' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#34d399', fontSize: 13 }}>
              ✓ {t('saveSuccess')}
            </motion.p>
          )}
          {saveStatus === 'error' && (
            <p style={{ color: '#f87171', fontSize: 13 }}>{t('saveError')}</p>
          )}
        </div>
        <motion.button
          type="button"
          onClick={handleSave}
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 rounded-xl disabled:opacity-40 cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#2563ef,#3a81f6)', color: '#fff',
            padding: '13px 24px', fontWeight: 600, fontSize: 14 }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} strokeWidth={2} />}
          {saving ? 'Čuvanje...' : t('save')}
        </motion.button>
      </div>

      {/* ── Danger zone ───────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(231,0,11,0.2)' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(231,0,11,0.15)',
          background: 'rgba(231,0,11,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={13} style={{ color: '#f87171' }} strokeWidth={2} />
          <p style={{ color: '#f87171', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('danger.title')}
          </p>
        </div>
        <div style={{ padding: '20px', background: 'rgba(231,0,11,0.02)', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Clear history */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <p style={{ color: '#c8c8d8', fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
                {t('danger.clearHistory')}
              </p>
              <p style={{ color: '#252535', fontSize: 12, lineHeight: 1.4 }}>
                {t('danger.clearHistoryDescription')}
              </p>
            </div>
            {clearConfirm ? (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setClearConfirm(false)}
                  className="rounded-xl cursor-pointer"
                  style={{ background: '#0c0c12', color: '#555568', border: '1px solid #141420', padding: '8px 14px', fontSize: 13 }}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleClearHistory}
                  disabled={dangerLoading}
                  className="rounded-xl font-medium disabled:opacity-40 cursor-pointer"
                  style={{ background: '#e7000b', color: '#fff', padding: '8px 14px', fontSize: 13 }}
                >
                  {dangerLoading ? 'Brisanje...' : 'Potvrdi'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl font-medium cursor-pointer flex-shrink-0 self-start sm:self-auto"
                style={{ background: 'transparent', border: '1px solid rgba(231,0,11,0.35)',
                  color: '#e7000b', padding: '8px 14px', fontSize: 13 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(231,0,11,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Trash2 size={13} strokeWidth={2} />
                {t('danger.clearHistory')}
              </button>
            )}
          </div>

          <div style={{ height: 1, background: 'rgba(231,0,11,0.1)' }} />

          {/* Delete account */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <p style={{ color: '#c8c8d8', fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
                {t('danger.deleteAccount')}
              </p>
              <p style={{ color: '#252535', fontSize: 12, lineHeight: 1.4 }}>
                {t('danger.deleteAccountDescription')}
              </p>
            </div>
            {deleteConfirm ? (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="rounded-xl cursor-pointer"
                  style={{ background: '#0c0c12', color: '#555568', border: '1px solid #141420', padding: '8px 14px', fontSize: 13 }}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={dangerLoading}
                  className="rounded-xl font-semibold disabled:opacity-40 cursor-pointer"
                  style={{ background: '#7f1d1d', color: '#fca5a5', padding: '8px 14px', fontSize: 13, letterSpacing: '0.02em' }}
                >
                  {dangerLoading ? 'Brisanje...' : 'OBRIŠI NALOG'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl font-medium cursor-pointer flex-shrink-0 self-start sm:self-auto"
                style={{ background: 'transparent', border: '1px solid rgba(231,0,11,0.35)',
                  color: '#e7000b', padding: '8px 14px', fontSize: 13 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(231,0,11,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Trash2 size={13} strokeWidth={2} />
                {t('danger.deleteAccount')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
