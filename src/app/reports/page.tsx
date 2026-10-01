'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, wsRes] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/workshops'),
        ]);

        if (repRes.ok) {
          const repJson = await repRes.json();
          setReportData(repJson);
        }

        if (wsRes.ok) {
          const wsJson = await wsRes.json();
          setWorkshops(wsJson.workshops || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const allCategories = Array.from(
    new Set(
      workshops
        .map((w) => w.subject || w.categoryName)
        .filter(Boolean)
    )
  );

  const categoryBreakdown = React.useMemo(() => {
    if (reportData?.categoryBreakdown && reportData.categoryBreakdown.length > 0) {
      return reportData.categoryBreakdown;
    }
    const map = new Map<string, number>();
    workshops.forEach((w) => {
      const cat = w.subject || w.categoryName || 'General';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [reportData, workshops]);

  const statusBreakdown = React.useMemo(() => {
    if (reportData?.statusBreakdown && reportData.statusBreakdown.length > 0) {
      return reportData.statusBreakdown;
    }
    const map = new Map<string, number>();
    workshops.forEach((w) => {
      const st = w.status || w.statusName || 'Scheduled';
      map.set(st, (map.get(st) || 0) + 1);
    });
    const colors: Record<string, string> = {
      Scheduled: '#00534E',
      'In Progress': '#EB7400',
      Ongoing: '#EB7400',
      Completed: '#8D153A',
    };
    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
      color: colors[name] || '#616161',
    }));
  }, [reportData, workshops]);

  const filteredWorkshops = workshops.filter((ws) => {
    const statusNormalized = `status-${(ws.status || ws.statusName || '').toLowerCase().replace(/\s+/g, '-')}`;
    const matchesStatus =
      selectedStatus === 'all' ||
      ws.statusId === selectedStatus ||
      statusNormalized === selectedStatus;
    const cat = ws.subject || ws.categoryName;
    const matchesCategory =
      selectedCategory === 'all' ||
      ws.categoryId === selectedCategory ||
      cat === selectedCategory;
    return matchesStatus && matchesCategory;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!filteredWorkshops.length) return;

    const headers = [
      'Workshop ID',
      'Title',
      'Category',
      'Organizing Unit',
      'Target Organization',
      'Start Date',
      'End Date',
      'Venue',
      'Expected Trainees',
      'Actual Trainees',
      'Status',
    ];

    const rows = filteredWorkshops.map((ws) => [
      `"${ws.workshopNumber}"`,
      `"${ws.title.replace(/"/g, '""')}"`,
      `"${(ws.subject || ws.categoryName || '').replace(/"/g, '""')}"`,
      `"${ws.organizingOrgName}"`,
      `"${ws.targetOrgName}"`,
      `"${ws.startDate}"`,
      `"${ws.endDate}"`,
      `"${(ws.venue || '').replace(/"/g, '""')}"`,
      ws.expectedTrainees || 0,
      ws.actualTrainees || 0,
      `"${ws.statusName}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `workshops_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell>
      <div className="page-container">
        {/* Header with Print & Export */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Workshop Analytics & Reports</h1>
            <p className="page-subtitle">
              Comprehensive planning metrics, status audits, and trainee capacity utilization
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
              📥 Export CSV
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
              🖨️ Print Report
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              📚
            </div>
            <div className="stat-value">{reportData?.metrics.totalWorkshops || 0}</div>
            <div className="stat-label">Total Planned Workshops</div>
          </div>

          <div className="stat-card gold">
            <div className="stat-icon gold">
              👥
            </div>
            <div className="stat-value" style={{ color: 'var(--gold-dark)' }}>
              {reportData?.metrics.totalExpectedTrainees || 0}
            </div>
            <div className="stat-label">Target Trainees Capacity</div>
          </div>

          <div className="stat-card teal">
            <div className="stat-icon teal">
              🎯
            </div>
            <div className="stat-value" style={{ color: 'var(--teal)' }}>
              {reportData?.metrics.totalActualTrainees || 0}
            </div>
            <div className="stat-label">Completed Workshop Attendees</div>
          </div>

          <div className="stat-card accent">
            <div className="stat-icon accent">
              ✅
            </div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>
              {reportData?.metrics.completedWorkshops || 0}
            </div>
            <div className="stat-label">Completed Workshops</div>
          </div>
        </div>

        {/* Breakdown Charts Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Status Breakdown */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Status Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {statusBreakdown && statusBreakdown.length > 0 ? (
                statusBreakdown.map((s: any) => {
                  const total = reportData?.metrics?.totalWorkshops || workshops.length || 1;
                  const pct = Math.round((s.count / total) * 100);
                  return (
                    <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                          {s.name}
                        </span>
                        <span style={{ fontWeight: 600 }}>{s.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 'var(--radius-full)' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '1rem 0', textAlign: 'center' }}>
                  No workshop statuses recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Categories (Subjects) Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {categoryBreakdown && categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((c: any, idx: number) => {
                  const total = reportData?.metrics?.totalWorkshops || workshops.length || 1;
                  const pct = Math.round((c.count / total) * 100);
                  const palette = ['var(--accent)', 'var(--teal)', 'var(--primary)', '#2563EB', '#7C3AED'];
                  const barColor = palette[idx % palette.length];
                  return (
                    <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</span>
                        <span style={{ fontWeight: 600 }}>{c.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 'var(--radius-full)' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '1rem 0', textAlign: 'center' }}>
                  No workshop categories recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Workshop Detailed Audit Report</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {filteredWorkshops.length} records matching current hierarchy scope
              </p>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ fontSize: '0.8rem', width: 'auto' }}
              >
                <option value="all">All Categories (Subjects)</option>
                {allCategories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ fontSize: '0.8rem', width: 'auto' }}
              >
                <option value="all">All Statuses</option>
                {reportData?.statusBreakdown?.map((s: any) => (
                  <option key={s.name} value={`status-${s.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Workshop ID</th>
                  <th>Title</th>
                  <th>Category (Subject)</th>
                  <th>Organizing Unit</th>
                  <th>Target Organization</th>
                  <th>Dates</th>
                  <th>Planned Trainees</th>
                  <th>Actual Attended</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkshops.map((ws) => (
                  <tr key={ws.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {ws.workshopNumber}
                    </td>
                    <td style={{ fontWeight: 600 }}>{ws.title}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--teal-10)',
                          color: 'var(--teal)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          border: '1px solid var(--teal-20)',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                        }}
                      >
                        {ws.subject || ws.categoryName || 'General'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{ws.organizingOrgName}</td>
                    <td style={{ fontSize: '0.85rem' }}>{ws.targetOrgName}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {ws.startDate} to {ws.endDate}
                    </td>
                    <td style={{ textAlign: 'center' }}>{ws.expectedTrainees}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: ws.actualTrainees ? 'var(--teal)' : 'inherit' }}>
                      {ws.actualTrainees || '—'}
                    </td>
                    <td>
                      <span className={`status-badge status-${(ws.statusName || ws.status || 'scheduled').toLowerCase().replace(/\s+/g, '-')}`}>
                        {ws.statusName || ws.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
