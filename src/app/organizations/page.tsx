'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadOrgs() {
      try {
        const res = await fetch('/api/organizations');
        if (res.ok) {
          const json = await res.json();
          setOrganizations(json.organizations || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrgs();
  }, []);

  const filteredOrgs = organizations.filter((org) => {
    const matchesLevel = selectedLevel === 'all' || org.level === selectedLevel;
    const matchesSearch =
      !search ||
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.code?.toLowerCase().includes(search.toLowerCase()) ||
      org.typeName?.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return { label: 'Level 1: MOE / NIE', color: 'var(--primary)', bg: 'var(--primary-10)', border: 'var(--primary)' };
      case 2:
        return { label: 'Level 2: Province', color: 'var(--accent)', bg: 'var(--accent-10)', border: 'var(--accent)' };
      case 3:
        return { label: 'Level 3: Zone', color: 'var(--teal)', bg: 'var(--teal-10)', border: 'var(--teal)' };
      case 4:
        return { label: 'Level 4: Division / School', color: 'var(--gold-dark)', bg: 'var(--gold-10)', border: 'var(--gold)' };
      default:
        return { label: `Level ${level}`, color: 'var(--text-secondary)', bg: 'var(--gray-100)', border: 'var(--border-default)' };
    }
  };

  return (
    <AppShell>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Educational Organizational Hierarchy</h1>
            <p className="page-subtitle">
              4-Level organizational structure governing workshop planning, target selection, and review permissions
            </p>
          </div>
        </div>

        {/* Hierarchy Clarification Alert Box */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--white)',
            border: '1px solid var(--border-light)',
            borderLeft: '5px solid var(--primary)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🏛️</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
              Organizational Hierarchy Architecture
            </h3>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            • <strong>Level 1 – MOE / NIE</strong>: Each <strong>MOE Branch</strong> (ICT Branch, Planning Branch, Finance Branch, etc.) is treated as one distinct organizational user unit for workshop planning and lifecycle approvals.<br />
            • <strong>Level 2 – Province</strong>: Provincial Departments of Education (e.g. Southern Province, Western Province).<br />
            • <strong>Level 3 – Zone</strong>: Zonal Education Offices (e.g. Galle Zonal Office, Colombo Zonal Office).<br />
            • <strong>Level 4 – Institutions</strong>: Divisional Education Offices and Schools.
          </p>
        </div>

        {/* Level Filters & Search */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Level Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { level: 'all', label: 'All Levels' },
              { level: 1, label: 'Level 1: MOE Branches' },
              { level: 2, label: 'Level 2: Provinces' },
              { level: 3, label: 'Level 3: Zones' },
              { level: 4, label: 'Level 4: Divisions' },
            ].map((tab) => {
              const active = selectedLevel === tab.level;
              return (
                <button
                  key={String(tab.level)}
                  type="button"
                  onClick={() => setSelectedLevel(tab.level as any)}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: active ? 'var(--primary)' : 'var(--border-default)',
                    background: active ? 'var(--primary)' : 'var(--white)',
                    color: active ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    transition: 'all var(--ease)',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ minWidth: '260px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search organizations or codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Organizations Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredOrgs.map((org) => {
            const badge = getLevelBadge(org.level);
            return (
              <div
                key={org.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {badge.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        fontWeight: 600,
                      }}
                    >
                      {org.code}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {org.name}
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {org.typeName}
                    {org.parentName && (
                      <span style={{ display: 'block', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                        ↳ Reports to: {org.parentName}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '0.78rem',
                  }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    Linked Workshops: <strong style={{ color: 'var(--text-primary)' }}>{org.workshopCount}</strong>
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: org.isActive ? 'var(--teal)' : 'var(--error)',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                    {org.isActive ? 'Active Unit' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
