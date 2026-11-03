import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Moon,
  Sun,
  LogOut,
  ExternalLink,
  PhoneCall,
  Calendar,
  Globe,
  History,
  Share2,
} from 'lucide-react';
import { IRDCrest } from './OfficialEmblem';
import { getTranslation } from '../utils/translations';

export default function Header({
  darkMode,
  setDarkMode,
  onOpenRules,
  onOpenTinHistory,
  onOpenSharedFolder,
  activeOfficer,
  onOpenUserProfiles,
  onLogout,
  language = 'en',
  onLanguageChange,
}) {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const t = getTranslation(language);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentDateTime(now.toLocaleString('en-US', options) + ' (SLST)');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const initials = activeOfficer?.name
    ? activeOfficer.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'IR';

  // Extract concise display name for the compact side DP
  const shortName = activeOfficer?.name
    ? activeOfficer.name.split(' ')[0]
    : t.officerDefault;

  return (
    <header className="app-header-official">
      {/* 1. Official Government of Sri Lanka Top Utility Ribbon */}
      <div className="gov-top-bar">
        <div className="container gov-top-bar-inner">
          <div className="gov-identity">
            <div className="gov-flag-emblem">
              <span className="gov-crest-mini">🇱🇰</span>
            </div>
            <span className="gov-state-text">
              {t.govTrilingual}
            </span>
          </div>

          <div className="gov-meta-links">
            {/* IRD Hotline 1944 */}
            <a
              href="tel:1944"
              className="gov-link-pill"
              title="Inland Revenue Department Call Centre Hotline"
            >
              <PhoneCall size={12} className="text-gold" />
              <span>{t.hotlineLabel}</span>
            </a>

            {/* Official ird.gov.lk Direct Portal Link */}
            <a
              href="https://www.ird.gov.lk/en/sitepages/default.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="gov-link-pill active-portal-pill"
              title="Official Inland Revenue Department Web Portal (ird.gov.lk)"
            >
              <Globe size={12} />
              <span>{t.portalLink}</span>
              <ExternalLink size={11} style={{ opacity: 0.7 }} />
            </a>

            {/* RAMIS e-Services */}
            <a
              href="https://www.ird.gov.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="gov-link-pill"
              title="Access IRD RAMIS e-Services"
            >
              <span>{t.ramisLink}</span>
            </a>

            {/* Live Sri Lanka Standard Time */}
            <div className="gov-datetime">
              <Calendar size={12} className="text-gold" />
              <span>{currentDateTime || t.timeZone}</span>
            </div>

            {/* Trilingual Selector Buttons */}
            <div className="gov-lang-badges" title="Switch Language / භාෂාව තෝරන්න / மொழியை மாற்றவும்">
              <button
                type="button"
                onClick={() => onLanguageChange('si')}
                className={`lang-tag-btn ${language === 'si' ? 'active' : ''}`}
                title="සිංහල"
              >
                සිං
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('ta')}
                className={`lang-tag-btn ${language === 'ta' ? 'active' : ''}`}
                title="தமிழ்"
              >
                த
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`lang-tag-btn ${language === 'en' ? 'active' : ''}`}
                title="English"
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Official IRD Branding Banner */}
      <div className="header-main-banner">
        <div className="container header-container">
          <div className="header-brand-official">
            {/* Official IRD Department Logo (Enlarged) */}
            <div className="header-brand-logo" title="Department of Inland Revenue Sri Lanka">
              <IRDCrest size={68} />
            </div>

            <div className="brand-text-official">
              {/* Trilingual Department Title */}
              <div className="trilingual-titles">
                <span className="title-sinhala">දේශීය ආදායම් දෙපාර්තමේන්තුව</span>
                <span className="title-divider">•</span>
                <span className="title-tamil">உள்நாட்டு இறைவரித் திணைக்களம்</span>
                <span className="title-divider">•</span>
                <span className="title-english">Department of Inland Revenue Sri Lanka</span>
              </div>

              {/* Master System Title */}
              <div className="system-identity">
                <h1 className="system-main-title">
                  {t.fruTitle}
                </h1>
                <span className="system-badge-fru">
                  {t.fruUnitBadge}
                </span>
                <span className="sec-law-tag">
                  {t.actReference}
                </span>
              </div>
            </div>
          </div>

          {/* Clean & Compact Action Controls */}
          <div className="header-actions">
            {/* Shared Folder / LAN Historical Repository */}
            {onOpenSharedFolder && (
              <button
                type="button"
                onClick={onOpenSharedFolder}
                className="btn btn-outline btn-sm"
                style={{
                  fontSize: '11.5px',
                  borderColor: 'rgba(59, 130, 246, 0.45)',
                  color: '#93c5fd',
                  gap: '5px',
                  fontWeight: 700,
                }}
                title="Shared Network Folder & 6-Month Historical Repository (LAN Sync)"
              >
                <Share2 size={13} />
                <span>{language === 'si' ? 'Shared Folder' : language === 'ta' ? 'பகிர்வு கோப்புறை' : 'Shared Folder'}</span>
              </button>
            )}

            {/* TIN 6-Month History & Audit Investigation Tracker */}
            {onOpenTinHistory && (
              <button
                type="button"
                onClick={onOpenTinHistory}
                className="btn btn-outline btn-sm"
                style={{
                  fontSize: '11.5px',
                  borderColor: 'rgba(212, 175, 55, 0.45)',
                  color: '#fde047',
                  gap: '5px',
                  fontWeight: 700,
                }}
                title={t.tinHistoryBtn}
              >
                <History size={13} />
                <span>{t.tinHistoryBtn}</span>
              </button>
            )}

            {/* Tax Rules & Thresholds Config */}
            <button
              onClick={onOpenRules}
              className="btn btn-ird-maroon btn-sm"
              title={t.taxRulesBtn}
            >
              <Sliders size={13} />
              <span>{t.taxRulesBtn}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle-btn"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#ffd700" />}
            </button>

            {/* Compact Officer Profile on the Side (Avatar + Name) */}
            <div
              onClick={onOpenUserProfiles}
              className="officer-compact-chip"
              title={`${t.switchProfile} (${activeOfficer?.name || t.officerDefault})`}
            >
              <div
                className="officer-mini-dp"
                style={{
                  background: activeOfficer?.badgeColor || '#d4af37',
                }}
              >
                {initials}
              </div>
              <span className="officer-compact-name">
                {shortName}
              </span>
            </div>

            {/* Lock / Logout Button */}
            <button
              onClick={onLogout}
              className="btn btn-outline-danger btn-sm compact-exit-btn"
              title={t.lockExitBtn}
            >
              <LogOut size={13} />
              <span>{t.lockExitBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Official IRD Gazette & Compliance Marquee Banner */}
      <div className="gov-alert-ticker">
        <div className="container gov-alert-inner">
          <div className="ticker-badge">
            <span className="ticker-pulse"></span>
            <span className="ticker-badge-text">
              {language === 'si' ? 'නිල නිවේදනය' : language === 'ta' ? 'அறிவிப்பு' : 'OFFICIAL NOTICE'}
            </span>
          </div>
          <div className="ticker-text-wrapper">
            <div className="ticker-content">
              <span>{t.marqueeText}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
