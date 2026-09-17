import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Eye,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle,
  Building,
  Printer,
  Edit3,
  Flame,
  ShieldAlert,
  Download,
  History,
} from 'lucide-react';

export default function MasterDataGrid({
  records,
  onSelectRecord,
  onGenerateNotice,
  onUpdateRecordStatus,
  onBulkAction,
  onOpenTinHistory,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [officeFilter, setOfficeFilter] = useState('ALL');
  const [exceptionOnly, setExceptionOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Sorting
  const [sortField, setSortField] = useState('totalTurnover');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        r.name.toLowerCase().includes(searchLower) ||
        r.nic.toLowerCase().includes(searchLower) ||
        (r.tin && r.tin.toLowerCase().includes(searchLower)) ||
        (r.brn && r.brn.toLowerCase().includes(searchLower)) ||
        r.address.toLowerCase().includes(searchLower) ||
        r.district.toLowerCase().includes(searchLower) ||
        r.id.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Risk Filter
      if (riskFilter !== 'ALL' && r.riskLevel !== riskFilter) return false;

      // Action Filter
      if (actionFilter !== 'ALL') {
        if (actionFilter === 'FORCED_TIN' && r.hasTIN) return false;
        if (actionFilter === 'FORCED_VAT' && !r.isVatBreached) return false;
        if (actionFilter === 'INVESTIGATION' && !r.actionRecommendations.includes('AUDIT_INVESTIGATION_REQUIRED')) return false;
      }

      // Regional Office
      if (officeFilter !== 'ALL' && r.district !== officeFilter) return false;

      // Exception only
      if (exceptionOnly && (r.nicDetails.isValid || !r.nic)) return false;

      return true;
    });
  }, [records, searchTerm, riskFilter, actionFilter, officeFilter, exceptionOnly]);

  // Sort logic
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'nic') {
        aVal = a.nic || '';
        bVal = b.nic || '';
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [filteredRecords, sortField, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedRecords.length && paginatedRecords.length > 0) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(selectedIds);
      paginatedRecords.forEach((r) => newSet.add(r.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelectOne = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Distinct districts for dropdown
  const distinctDistricts = useMemo(() => {
    const set = new Set(records.map((r) => r.district).filter(Boolean));
    return Array.from(set).sort();
  }, [records]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Search & Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by NIC, Name, Address, TIN, BRN, District..."
                className="form-control"
                style={{ paddingLeft: '36px' }}
              />
            </div>

            {/* Risk Filter */}
            <div style={{ minWidth: '150px' }}>
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">🔴 Critical Priority</option>
                <option value="HIGH">🟠 High Priority</option>
                <option value="MEDIUM">🔵 Medium Priority</option>
                <option value="LOW">🟢 Low Priority</option>
              </select>
            </div>

            {/* Action Filter */}
            <div style={{ minWidth: '160px' }}>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select"
              >
                <option value="ALL">All Statutory Actions</option>
                <option value="FORCED_TIN">Forced TIN Required</option>
                <option value="FORCED_VAT">Forced VAT Liable</option>
                <option value="INVESTIGATION">Field Investigation</option>
              </select>
            </div>

            {/* District Filter */}
            <div style={{ minWidth: '160px' }}>
              <select
                value={officeFilter}
                onChange={(e) => {
                  setOfficeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select"
              >
                <option value="ALL">All Regional Offices</option>
                {distinctDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Exception Toggle */}
            <button
              onClick={() => {
                setExceptionOnly(!exceptionOnly);
                setCurrentPage(1);
              }}
              className={`btn btn-sm ${exceptionOnly ? 'btn-primary' : 'btn-outline'}`}
            >
              <AlertCircle size={14} />
              <span>Invalid NICs Only</span>
            </button>
          </div>

          {/* Bulk Action Bar if items selected */}
          {selectedIds.size > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                {selectedIds.size} Taxpayers Selected for Batch Operations
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onBulkAction('APPROVED_FOR_NOTICE', Array.from(selectedIds))}
                  className="btn btn-primary btn-sm"
                >
                  <CheckCircle size={13} /> Approve for Section 102 Notice
                </button>
                <button
                  onClick={() => onBulkAction('INVESTIGATED', Array.from(selectedIds))}
                  className="btn btn-outline btn-sm"
                >
                  Mark as Investigated
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="btn btn-ghost btn-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Master Data Table */}
      <div className="table-wrapper glass-card">
        <table className="master-table">
          <thead>
            <tr>
              <th style={{ width: '36px' }}>
                <button
                  onClick={toggleSelectAll}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                  {paginatedRecords.length > 0 && selectedIds.size >= paginatedRecords.length ? (
                    <CheckSquare size={16} color="var(--accent-gold)" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                Ref ID <ArrowUpDown size={12} />
              </th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Taxpayer / Entity Name <ArrowUpDown size={12} />
              </th>
              <th onClick={() => handleSort('nic')} style={{ cursor: 'pointer' }}>
                NIC / BRN <ArrowUpDown size={12} />
              </th>
              <th>DOB / Age / Gender</th>
              <th onClick={() => handleSort('totalTurnover')} style={{ cursor: 'pointer' }}>
                Turnover (LKR) <ArrowUpDown size={12} />
              </th>
              <th>TIN Status</th>
              <th onClick={() => handleSort('riskScore')} style={{ cursor: 'pointer' }}>
                Risk & Priority <ArrowUpDown size={12} />
              </th>
              <th>Assigned Regional Office</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No taxpayer records matching the current filters.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r) => {
                const isSelected = selectedIds.has(r.id);
                const isCritical = r.riskLevel === 'CRITICAL';
                const isHigh = r.riskLevel === 'HIGH';

                return (
                  <tr key={r.id} className={isSelected ? 'row-selected' : ''}>
                    {/* Checkbox */}
                    <td>
                      <button
                        onClick={() => toggleSelectOne(r.id)}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                      >
                        {isSelected ? <CheckSquare size={16} color="var(--accent-gold)" /> : <Square size={16} />}
                      </button>
                    </td>

                    {/* Ref ID */}
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px' }}>
                        {r.id}
                      </span>
                    </td>

                    {/* Taxpayer Name */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {r.address ? r.address.substring(0, 35) + (r.address.length > 35 ? '...' : '') : 'No Address Provided'}
                      </div>
                    </td>

                    {/* NIC / BRN */}
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {r.nic || r.brn || 'MISSING'}
                      </div>
                      {r.nic && (
                        <div style={{ marginTop: '2px' }}>
                          {r.nicDetails.isValid ? (
                            <span className="badge badge-low" style={{ fontSize: '9px', padding: '1px 5px' }}>
                              {r.nicDetails.format === 'OLD_9_DIGIT' ? '9-Digit (Old)' : '12-Digit (New)'}
                            </span>
                          ) : (
                            <span className="badge badge-critical" style={{ fontSize: '9px', padding: '1px 5px' }}>
                              Invalid NIC
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* DOB / Age / Gender */}
                    <td>
                      {r.nicDetails.isValid ? (
                        <div style={{ fontSize: '12px' }}>
                          <div>{r.nicDetails.gender}, {r.nicDetails.age} Yrs</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{r.nicDetails.dob}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>N/A</span>
                      )}
                    </td>

                    {/* Turnover (LKR) */}
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {r.totalTurnover.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {r.transactionCount} transaction{r.transactionCount > 1 ? 's' : ''} ({r.primaryAgency})
                      </div>
                    </td>

                    {/* TIN Status */}
                    <td>
                      {r.hasTIN ? (
                        <div>
                          <span className="badge badge-low" style={{ fontSize: '10px' }}>Active TIN</span>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '2px' }}>
                            {r.tin}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="badge badge-critical" style={{ fontSize: '10px' }}>
                            UNREGISTERED
                          </span>
                          <div style={{ fontSize: '10px', color: '#f87171', marginTop: '2px', fontWeight: 600 }}>
                            Forced Reg Liable
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Risk & Priority */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className={`badge ${
                            isCritical ? 'badge-critical' : isHigh ? 'badge-high' : r.riskLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low'
                          }`}
                        >
                          {r.riskLevel} ({r.riskScore})
                        </span>
                      </div>
                      {r.isVatBreached && (
                        <span className="badge badge-purple" style={{ fontSize: '9px', marginTop: '3px' }}>
                          VAT Breached
                        </span>
                      )}
                    </td>

                    {/* Assigned Regional Office */}
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{r.district}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {r.regionalCode}
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => onSelectRecord(r)}
                          className="btn btn-outline btn-sm"
                          title="View 360 Degree Taxpayer Profile"
                          style={{ padding: '5px 8px' }}
                        >
                          <Eye size={14} />
                        </button>
                        {onOpenTinHistory && (
                          <button
                            onClick={() => onOpenTinHistory(r.tin || r.nic || r.id)}
                            className="btn btn-outline btn-sm"
                            title="View 6-Month Historical Audit Investigation"
                            style={{
                              padding: '5px 8px',
                              borderColor: 'rgba(212, 175, 55, 0.45)',
                              color: '#fde047',
                            }}
                          >
                            <History size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => onGenerateNotice(r)}
                          className="btn btn-primary btn-sm"
                          title="Generate Official Section 102 Forced Notice PDF"
                          style={{ padding: '5px 8px' }}
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, sortedRecords.length)} of {sortedRecords.length} records
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-outline btn-sm"
          >
            ← Previous
          </button>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-outline btn-sm"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
