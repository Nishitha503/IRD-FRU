import React from 'react';
import {
  Users,
  Coins,
  UserX,
  AlertOctagon,
  Building,
  TrendingUp,
  Flame,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export default function AnalyticsDashboard({ summary, onFilterRisk, onFilterAction }) {
  if (!summary) return null;

  const formatLKR = (num) => {
    if (num >= 1000000000) return `LKR ${(num / 1000000000).toFixed(2)} Billion`;
    if (num >= 1000000) return `LKR ${(num / 1000000).toFixed(1)} Million`;
    return `LKR ${Math.round(num).toLocaleString()}`;
  };

  const total = summary.totalRecords || 1;
  const criticalPct = Math.round((summary.criticalRiskCount / total) * 100);
  const highPct = Math.round((summary.highRiskCount / total) * 100);
  const medPct = Math.round((summary.mediumRiskCount / total) * 100);
  const lowPct = Math.round((summary.lowRiskCount / total) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 6 Executive KPIs */}
      <div className="metric-grid">
        {/* Metric 1 */}
        <div className="metric-card" style={{ '--card-accent': '#3b82f6' }}>
          <div className="metric-header">
            <span className="metric-title">Total Entities</span>
            <div className="metric-icon-wrap" style={{ color: '#3b82f6' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value">{summary.totalRecords}</div>
          <div className="metric-subtitle">
            {summary.registeredCount} Registered • {summary.unregisteredCount} Unregistered
          </div>
        </div>

        {/* Metric 2 */}
        <div className="metric-card" style={{ '--card-accent': '#f59e0b' }}>
          <div className="metric-header">
            <span className="metric-title">Aggregated Turnover</span>
            <div className="metric-icon-wrap" style={{ color: '#f59e0b' }}>
              <Coins size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '20px' }}>
            {formatLKR(summary.totalTurnoverSum)}
          </div>
          <div className="metric-subtitle">Total economic turnover analyzed</div>
        </div>

        {/* Metric 3 */}
        <div className="metric-card" style={{ '--card-accent': '#ef4444' }}>
          <div className="metric-header">
            <span className="metric-title">Forced TIN Required</span>
            <div className="metric-icon-wrap" style={{ color: '#ef4444' }}>
              <UserX size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#f87171' }}>
            {summary.unregisteredCount}
          </div>
          <div className="metric-subtitle">Unregistered active entities</div>
        </div>

        {/* Metric 4 */}
        <div className="metric-card" style={{ '--card-accent': '#a855f7' }}>
          <div className="metric-header">
            <span className="metric-title">VAT Threshold Breach</span>
            <div className="metric-icon-wrap" style={{ color: '#a855f7' }}>
              <AlertOctagon size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#c084fc' }}>
            {summary.vatBreachCount}
          </div>
          <div className="metric-subtitle">Turnover ≥ LKR 60M (Liable for VAT)</div>
        </div>

        {/* Metric 5 */}
        <div className="metric-card" style={{ '--card-accent': '#10b981' }}>
          <div className="metric-header">
            <span className="metric-title">Est. Tax Exposure</span>
            <div className="metric-icon-wrap" style={{ color: '#10b981' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '20px', color: '#34d399' }}>
            {formatLKR(summary.totalEstimatedTaxExposure)}
          </div>
          <div className="metric-subtitle">Indicative potential revenue yield</div>
        </div>

        {/* Metric 6 */}
        <div className="metric-card" style={{ '--card-accent': '#f43f5e' }}>
          <div className="metric-header">
            <span className="metric-title">High Priority Cases</span>
            <div className="metric-icon-wrap" style={{ color: '#f43f5e' }}>
              <Flame size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#fb7185' }}>
            {summary.criticalRiskCount + summary.highRiskCount}
          </div>
          <div className="metric-subtitle">
            {summary.criticalRiskCount} Critical • {summary.highRiskCount} High Risk
          </div>
        </div>
      </div>

      {/* Visual Analysis Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Risk Distribution Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--accent-gold)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Risk Priority Distribution</h4>
            </div>
            <span className="badge badge-neutral">{summary.totalRecords} Cases</span>
          </div>

          {/* Progress Multi-Bar */}
          <div
            style={{
              height: '14px',
              borderRadius: '7px',
              background: '#1e293b',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            <div style={{ width: `${criticalPct}%`, background: '#ef4444' }} title={`Critical: ${criticalPct}%`} />
            <div style={{ width: `${highPct}%`, background: '#f59e0b' }} title={`High: ${highPct}%`} />
            <div style={{ width: `${medPct}%`, background: '#3b82f6' }} title={`Medium: ${medPct}%`} />
            <div style={{ width: `${lowPct}%`, background: '#10b981' }} title={`Low: ${lowPct}%`} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => onFilterRisk && onFilterRisk('CRITICAL')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Critical Priority (Score 75+)</span>
              </div>
              <span className="badge badge-critical">{summary.criticalRiskCount} ({criticalPct}%)</span>
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => onFilterRisk && onFilterRisk('HIGH')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>High Priority (Score 50-74)</span>
              </div>
              <span className="badge badge-high">{summary.highRiskCount} ({highPct}%)</span>
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => onFilterRisk && onFilterRisk('MEDIUM')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Medium Priority (Score 25-49)</span>
              </div>
              <span className="badge badge-medium">{summary.mediumRiskCount} ({medPct}%)</span>
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => onFilterRisk && onFilterRisk('LOW')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Low Priority / Compliant</span>
              </div>
              <span className="badge badge-low">{summary.lowRiskCount} ({lowPct}%)</span>
            </div>
          </div>
        </div>

        {/* Regional Office Allocation */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="var(--accent-blue)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Regional Office Allocation</h4>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {Object.entries(summary.districtDistribution || {}).map(([district, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={district} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontWeight: 600 }}>{district}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="var(--accent-emerald)" />
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Forced Statutory Action</h4>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(summary.actionDistribution || {}).map(([action, count]) => {
              const isVat = action.includes('VAT');
              const isTin = action.includes('TIN');
              const isAudit = action.includes('INVESTIGATION');
              return (
                <div
                  key={action}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>
                    {action.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`badge ${isVat ? 'badge-critical' : isTin ? 'badge-high' : isAudit ? 'badge-purple' : 'badge-low'}`}
                  >
                    {count} Cases
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
