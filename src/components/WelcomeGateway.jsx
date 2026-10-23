import React from 'react';
import { ArrowRight, Globe } from 'lucide-react';
import { IRDCrest } from './OfficialEmblem';
import { getTranslation } from '../utils/translations';

export default function WelcomeGateway({
  onProceed,
  language = 'si',
  onLanguageChange,
}) {
  const t = getTranslation(language);

  return (
    <div className="welcome-gateway-page">
      {/* 1. Official Government Top Utility Ribbon */}
      <div className="gov-top-bar">
        <div className="container gov-top-bar-inner">
          <div className="gov-identity">
            <span className="gov-crest-mini">🇱🇰</span>
            <span className="gov-state-text">
              {t.govTrilingual}
            </span>
          </div>

          <div className="gov-meta-links">
            <a
              href="https://www.ird.gov.lk/en/sitepages/default.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="gov-link-pill active-portal-pill"
              title="Official IRD Portal (ird.gov.lk)"
            >
              <Globe size={12} />
              <span>ird.gov.lk</span>
            </a>

            {/* Language Switcher */}
            <div className="gov-lang-badges" title="Switch Language">
              <button
                type="button"
                onClick={() => onLanguageChange('si')}
                className={`lang-tag-btn ${language === 'si' ? 'active' : ''}`}
              >
                සිං
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('ta')}
                className={`lang-tag-btn ${language === 'ta' ? 'active' : ''}`}
              >
                த
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`lang-tag-btn ${language === 'en' ? 'active' : ''}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full-Screen Open Canvas (No Enclosing Box / Card) */}
      <div className="welcome-fullscreen-canvas">
        {/* Large Prominent IRD Logo */}
        <div className="welcome-logo-grand" title="Department of Inland Revenue Sri Lanka">
          <IRDCrest size={190} />
        </div>

        {/* Department Name: Stacked in 3 distinct lines (Sinhala, Tamil, English) */}
        <div className="welcome-dept-block">
          <div className="welcome-name-sinhala">
            දේශීය ආදායම් දෙපාර්තමේන්තුව
          </div>
          <div className="welcome-name-tamil">
            உள்நாட்டு இறைவரித் திணைக்களம்
          </div>
          <div className="welcome-dept-title">
            DEPARTMENT OF INLAND REVENUE • SRI LANKA
          </div>
        </div>

        {/* Branch / Unit Name: Stacked lines */}
        <div className="welcome-branch-block">
          <h1 className="welcome-branch-title">
            FORCED REGISTRATION UNIT (FRU)
          </h1>
          <div className="welcome-branch-sinhala">
            බලයලත් ලියාපදිංචි කිරීමේ ඒකකය
          </div>
          <div className="welcome-branch-tamil">
            கட்டாயப் பதிவுப் பிரிவு
          </div>
        </div>

        {/* Compact Access Officer Login Button */}
        <div className="welcome-action-wrap">
          <button
            onClick={onProceed}
            className="welcome-btn-compact"
            title={t.welcomeEnterBtn}
          >
            <span>{t.welcomeEnterBtn}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 3. Minimal Clean Footer */}
      <div className="welcome-minimal-footer">
        <span>Department of Inland Revenue • Sri Lanka • Sir Chittampalam A. Gardiner Mawatha, Colombo 02</span>
      </div>
    </div>
  );
}
