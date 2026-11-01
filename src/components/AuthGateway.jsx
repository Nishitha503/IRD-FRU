 import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  User,
  BadgeAlert,
  PhoneCall,
  Globe,
  ExternalLink,
  Cloud,
  Database,
  HelpCircle,
  CheckCircle,
  X,
  Server,
} from 'lucide-react';
import {
  hashPassword,
} from '../utils/userManagement';
import {
  authenticateOfficer,
  registerNewOfficer,
  getDatabaseStatus,
  getNetworkMode,
  setNetworkMode,
} from '../services/authDatabaseService';
import { IRDCrest } from './OfficialEmblem';
import { getTranslation } from '../utils/translations';

export default function AuthGateway({
  profiles,
  onSuccessfulLogin,
  onRegisterOfficer,
  language = 'en',
  onLanguageChange,
  onBack,
}) {
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDbGuide, setShowDbGuide] = useState(false);
  const [networkMode, setLocalNetworkMode] = useState(() => getNetworkMode());
  const t = getTranslation(language);
  const dbStatus = getDatabaseStatus();

  const handleToggleNetworkMode = () => {
    const nextMode = networkMode === 'AIRGAP_OFFLINE' ? 'FIREBASE_CLOUD' : 'AIRGAP_OFFLINE';
    setNetworkMode(nextMode);
    setLocalNetworkMode(nextMode);
    setErrorMessage('');
    setSuccessNotice(
      nextMode === 'AIRGAP_OFFLINE'
        ? 'RAMIS Intranet (100% Offline Air-Gapped Mode) සක්‍රීය විය. අන්තර්ජාලය රහිතව දත්ත සුරක්ෂිතව ගබඩා වේ.'
        : 'Firebase Cloud Database Sync Mode සක්‍රීය විය.'
    );
  };

  // Registration Form State
  const [regData, setRegData] = useState({
    username: '',
    name: '',
    serviceNo: '',
    designation: 'Senior Assessor / Assistant Commissioner',
    role: 'SENIOR_ASSESSOR',
    regionalOffice: 'Head Office - Forced Registration Unit, Colombo 02',
    regionalCode: 'HQ-FRU',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    badgeColor: '#f59e0b',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Handle Login with Username/Service ID and Password
  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Username, Service ID or Official Email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await authenticateOfficer(identifier, password, profiles);
      if (result.success) {
        if (result.databaseNotice) {
          setSuccessNotice(result.databaseNotice);
        }
        setTimeout(() => {
          onSuccessfulLogin(result.officer);
        }, result.databaseNotice ? 350 : 0);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setErrorMessage('Verification error: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Officer Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!regData.name.trim()) {
      setErrorMessage('Please enter officer full name.');
      return;
    }
    if (!regData.serviceNo.trim()) {
      setErrorMessage('Please enter Service ID / Staff Number.');
      return;
    }
    if (!regData.password || regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long for Cloud Database security.');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await registerNewOfficer(regData, profiles);
      if (result.success) {
        setSuccessNotice(result.databaseNotice || 'Officer registered successfully!');
        setTimeout(() => {
          onRegisterOfficer(result.officer);
        }, 500);
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch (err) {
      setErrorMessage('Registration error: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="auth-gateway-overlay">
      {/* Ambient glowing backdrop */}
      <div className="auth-ambient-glow" />
      <div className="auth-ambient-glow-2" />

      <div className="auth-gateway-container">
        {/* Official Sri Lanka IRD Portal Gateway Header */}
        <div className="auth-header-animated">
          {/* Top Gov Ribbon Link & Trilingual Selector */}
          <div className="auth-gov-subribbon">
            <span className="gov-dot-gold"></span>
            <span>{t.authGovHeader}</span>
            <a
              href="https://www.ird.gov.lk/en/sitepages/default.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="auth-ird-gov-link"
              title="Official Inland Revenue Department Portal"
            >
              <Globe size={11} />
              <span>ird.gov.lk</span>
              <ExternalLink size={9} />
            </a>

            {/* Language Switcher in Login Gateway */}
            {onLanguageChange && (
              <div className="auth-lang-pills" style={{ display: 'flex', gap: '3px', marginLeft: '6px' }}>
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
            )}
          </div>

          {/* Official IRD Logo */}
          <div className="auth-logo-row">
            <div className="auth-logo-badge" title="Department of Inland Revenue Sri Lanka">
              <IRDCrest size={130} />
            </div>
          </div>

          <div className="auth-title-box">
            <div className="auth-trilingual-header stacked">
              <span className="auth-sinhala-lead">දේශීය ආදායම් දෙපාර්තමේන්තුව</span>
              <span className="auth-tamil-lead">உள்நாட்டு இறைவரித் திணைக்களம்</span>
            </div>
            <div className="auth-department-tag">
              DEPARTMENT OF INLAND REVENUE • SRI LANKA
            </div>
            <h1 className="auth-main-title">
              FORCED REGISTRATION UNIT (FRU)
            </h1>
            <div className="auth-branch-stacked">
              <span className="auth-branch-si">බලයලත් ලියාපදිංචි කිරීමේ ඒකකය</span>
              <span className="auth-branch-ta">கட்டாயப் பதிவுப் பிரிவு</span>
            </div>
            <div className="auth-legal-pill">
              <span>{t.authLegalTag}</span>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="btn btn-outline btn-sm"
            style={{
              alignSelf: 'flex-start',
              marginBottom: '12px',
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              borderColor: 'var(--border-color)',
            }}
          >
            {t.backToHome}
          </button>
        )}

        {/* Auth Card */}
        <div className="glass-card auth-card">
          {/* Cloud / RAMIS Intranet Database Status Bar */}
          <div className="auth-db-status-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className={`auth-db-badge ${networkMode === 'AIRGAP_OFFLINE' ? 'offline-mode' : dbStatus.isCloud ? 'cloud-active' : 'offline-mode'}`}>
                {networkMode === 'AIRGAP_OFFLINE' ? <Server size={13} /> : <Cloud size={13} />}
                <span>
                  {networkMode === 'AIRGAP_OFFLINE'
                    ? '🔒 RAMIS Intranet (100% Offline)'
                    : dbStatus.isCloud
                    ? t.dbStatusCloud
                    : t.dbStatusOffline}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleNetworkMode}
                className="btn btn-outline btn-sm"
                style={{
                  fontSize: '10.5px',
                  padding: '3px 8px',
                  borderColor: networkMode === 'AIRGAP_OFFLINE' ? '#10b981' : '#f59e0b',
                  color: networkMode === 'AIRGAP_OFFLINE' ? '#6ee7b7' : '#fde047',
                  background: 'rgba(0,0,0,0.3)',
                }}
                title="Switch between RAMIS Intranet (Air-Gapped Local) and Firebase Cloud Sync"
              >
                {networkMode === 'AIRGAP_OFFLINE' ? 'Switch to Cloud Mode' : 'Switch to RAMIS Intranet (Offline)'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDbGuide(true)}
              className="auth-db-guide-btn"
              title="View Database & Offline Instructions"
            >
              <Database size={11} />
              <span>{t.dbConfigGuideBtn}</span>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="auth-tab-bar">
            <button
              onClick={() => {
                setAuthMode('LOGIN');
                setErrorMessage('');
              }}
              className={`auth-tab-btn ${authMode === 'LOGIN' ? 'active' : ''}`}
            >
              <KeyRound size={16} />
              <span>{t.authSignInTab}</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('REGISTER');
                setErrorMessage('');
              }}
              className={`auth-tab-btn ${authMode === 'REGISTER' ? 'active' : ''}`}
            >
              <UserPlus size={16} />
              <span>{t.authRegisterTab}</span>
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="auth-success-banner">
              <CheckCircle size={16} />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Tab 1: Clean Username & Password Login Form */}
          {authMode === 'LOGIN' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Username / Service ID / Email Input */}
              <div className="form-group">
                <label className="form-label">
                  {t.authIdentifierLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t.authIdentifierPlaceholder}
                    className="form-control"
                    style={{ paddingLeft: '38px', fontSize: '13px' }}
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {t.authPasswordLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.authPasswordPlaceholder}
                    className="form-control"
                    style={{
                      paddingLeft: '38px',
                      paddingRight: '40px',
                      fontSize: '14px',
                      letterSpacing: showPassword ? 'normal' : '2px',
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="btn btn-primary btn-lg pulse-glow"
                style={{ width: '100%', marginTop: '6px' }}
              >
                <Unlock size={18} />
                <span>{isVerifying ? t.authAuthenticating : t.authSignInBtn}</span>
                <ArrowRight size={18} />
              </button>

              {/* Account Registration Prompt */}
              <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '14px', marginTop: '4px', textAlign: 'center' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  නව නිලධාරී ගිණුමක් සෑදීමට ඉහළින් ඇති{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('REGISTER');
                      setErrorMessage('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fde047',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                      fontSize: '11.5px',
                    }}
                  >
                    {t.authRegisterTab}
                  </button>{' '}
                  තෝරන්න.
                </span>
              </div>
            </form>
          ) : (
            /* Tab 2: Register Form */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Officer Full Name *</label>
                  <input
                    type="text"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="e.g. S. M. Gunasekara"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Service / Staff ID *</label>
                  <input
                    type="text"
                    value={regData.serviceNo}
                    onChange={(e) => setRegData({ ...regData, serviceNo: e.target.value })}
                    placeholder="e.g. IRD-EMP-7782"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Desired Username</label>
                  <input
                    type="text"
                    value={regData.username}
                    onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                    placeholder="e.g. gunasekara"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Designation / Title</label>
                  <input
                    type="text"
                    value={regData.designation}
                    onChange={(e) => setRegData({ ...regData, designation: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assigned IRD Office / Division</label>
                <select
                  value={regData.regionalOffice}
                  onChange={(e) => setRegData({ ...regData, regionalOffice: e.target.value })}
                  className="form-select"
                >
                  <option value="Head Office - Forced Registration Unit, Colombo 02">
                    Head Office - Forced Registration Unit, Colombo 02
                  </option>
                  <option value="Metro Corporate / Colombo Regional Office">
                    Metro Corporate / Colombo Regional Office
                  </option>
                  <option value="Gampaha Regional Office">Gampaha Regional Office</option>
                  <option value="Kalutara Regional Office">Kalutara Regional Office</option>
                  <option value="Kandy Regional Office">Kandy Regional Office</option>
                  <option value="Galle Regional Office">Galle Regional Office</option>
                  <option value="Kurunegala Regional Office">Kurunegala Regional Office</option>
                  <option value="Ratnapura Regional Office">Ratnapura Regional Office</option>
                  <option value="Jaffna Regional Office">Jaffna Regional Office</option>
                  <option value="Anuradhapura Regional Office">Anuradhapura Regional Office</option>
                  <option value="Matara Regional Office">Matara Regional Office</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Create Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="Min 4 characters"
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              {/* Profile Theme Color */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Profile Badge Color</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#06b6d4'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setRegData({ ...regData, badgeColor: color })}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: color,
                        border: regData.badgeColor === color ? '3px solid #ffffff' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="btn btn-emerald btn-lg pulse-glow"
                style={{ width: '100%', marginTop: '6px' }}
              >
                <UserPlus size={18} />
                <span>{isVerifying ? 'Creating Account...' : 'Register Officer & Access System'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Security & Developer Watermark Footer */}
        <div className="auth-footer-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Authorised Official Personnel Only • Section 102 Inland Revenue Act No. 24 of 2017</span>
          </div>

          <div className="novix-footer-brand">
            <span className="novix-dot"></span>
            <span>Powered by <strong>Novix Solutions</strong> • Enterprise Tax Intelligence Division</span>
          </div>
        </div>
      </div>

      {/* Cloud Database Setup Instructions Modal */}
      {showDbGuide && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', color: '#fde047' }}>
                  <Database size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#ffffff' }}>
                    Google Firebase Cloud Database Setup
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    පද්ධතියට Realtime Cloud Database එකක් සම්බන්ධ කිරීම
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDbGuide(false)}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.6 }}>
              <div style={{ background: 'rgba(116, 16, 22, 0.25)', border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '8px', padding: '12px 14px' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#fde047' }}>
                  💡 ඔබගේ Firebase Project Keys ඇතුලත් කිරීමට පියවර:
                </p>
                <ol style={{ margin: '8px 0 0 18px', padding: 0 }}>
                  <li><strong>Firebase Console</strong> (<a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>console.firebase.google.com</a>) වෙත පිවිස නොමිලේ Project එකක් සාදන්න.</li>
                  <li><strong>Authentication</strong> වෙත ගොස් <em>Email/Password</em> සක්‍රීය (Enable) කරන්න.</li>
                  <li><strong>Firestore Database</strong> වෙත ගොස් Database එක Create කරන්න.</li>
                  <li>Project Settings &gt; General &gt; "Your apps" (Web &lt;/&gt;) වෙතින් ලැබෙන Keys පිටපත් කරගන්න.</li>
                  <li>IRD ෆෝල්ඩරයේ ඇති <code>.env</code> ගොනුව (File) Open කර එම Keys Paste කර Save කරන්න.</li>
                </ol>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  File Location: <code>C:\Users\Intel\Desktop\IRD\.env</code>
                </label>
                <pre style={{
                  background: '#090203',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#fef08a',
                  fontSize: '11px',
                  overflowX: 'auto',
                  marginTop: '6px'
                }}>
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ird-fru.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ird-fru
VITE_FIREBASE_STORAGE_BUCKET=ird-fru.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd`}
                </pre>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '10px 12px', fontSize: '11.5px', color: '#6ee7b7' }}>
                <CheckCircle size={16} />
                <span>.env ගොනුව Save කළ පසු System එක ස්වයංක්‍රීයව Firebase Cloud Database සමඟ ක්‍රියාත්මක වේ!</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setShowDbGuide(false)}
                className="btn btn-primary btn-sm"
              >
                තේරුම් ගත්තා (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Database Setup Instructions Modal */}
      {showDbGuide && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '620px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.15)', color: '#fde047' }}>
                  <Database size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#ffffff' }}>
                    Google Firebase Cloud Database Setup
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    පද්ධතියට Realtime Cloud Database එකක් සම්බන්ධ කිරීම
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDbGuide(false)}
                className="btn btn-outline btn-sm"
                style={{ padding: '4px 8px', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.6 }}>
              <div style={{ background: 'rgba(116, 16, 22, 0.25)', border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '8px', padding: '12px 14px' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#fde047' }}>
                  💡 ඔබගේ Firebase Project Keys ඇතුලත් කිරීමට පියවර:
                </p>
                <ol style={{ margin: '8px 0 0 18px', padding: 0 }}>
                  <li><strong>Firebase Console</strong> (<a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>console.firebase.google.com</a>) වෙත පිවිස නොමිලේ Project එකක් සාදන්න.</li>
                  <li><strong>Authentication</strong> වෙත ගොස් <em>Email/Password</em> සක්‍රීය (Enable) කරන්න.</li>
                  <li><strong>Firestore Database</strong> වෙත ගොස් Database එක Create කරන්න.</li>
                  <li>Project Settings &gt; General &gt; "Your apps" (Web &lt;/&gt;) වෙතින් ලැබෙන Keys පිටපත් කරගන්න.</li>
                  <li>IRD ෆෝල්ඩරයේ ඇති <code>.env</code> ගොනුව (File) Open කර එම Keys Paste කර Save කරන්න.</li>
                </ol>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  File Location: <code>C:\Users\Intel\Desktop\IRD\.env</code>
                </label>
                <pre style={{
                  background: '#090203',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#fef08a',
                  fontSize: '11px',
                  overflowX: 'auto',
                  marginTop: '6px'
                }}>
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ird-fru.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ird-fru
VITE_FIREBASE_STORAGE_BUCKET=ird-fru.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd`}
                </pre>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '10px 12px', fontSize: '11.5px', color: '#6ee7b7' }}>
                <CheckCircle size={16} />
                <span>.env ගොනුව Save කළ පසු System එක ස්වයංක්‍රීයව Firebase Cloud Database සමඟ ක්‍රියාත්මක වේ!</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setShowDbGuide(false)}
                className="btn btn-primary btn-sm"
              >
                තේරුම් ගත්තා (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
