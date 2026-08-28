import React, { useEffect, useState } from 'react'
import { fetchLots, moveLot } from '../api'
import LotDetail from './LotDetail'
import StageHistorySheet from './StageHistorySheet'
import CollapsibleSection from './CollapsibleSection'
import { formatAge, formatDate, ageBadgeClass, sortByOldest, stageSince } from '../dateUtils'
import { matchesLotSearch } from '../search'
import { SearchIcon } from '../icons'

export default function Stitching() {
  const [inProgress, setInProgress] = useState<any[]>([])
  const [available, setAvailable] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLot, setActiveLot] = useState<any | null>(null)
  const [fabricator, setFabricator] = useState('')
  const [detail, setDetail] = useState<any | null>(null)
  const [moving, setMoving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const all = await fetchLots()
      setInProgress(sortByOldest(all.filter((l: any) => (l.currentStage?.name || '') === 'STITCHING')))
      setAvailable(sortByOldest(all.filter((l: any) => (l.currentStage?.name || '') === 'CUTTING')))
    } catch (e: any) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleMove() {
    if (!activeLot) return

    setMoving(true)
    setError(null)

    try {
      await moveLot(activeLot.id, {
        toStage: 'STITCHING',
        quantity: activeLot.currentQuantity,
        fabricator: fabricator.trim() || undefined
      })
      setActiveLot(null)
      setFabricator('')
      await load()
    } catch (e: any) {
      setError(String(e))
    } finally {
      setMoving(false)
    }
  }

  if (detail) return <LotDetail lot={detail} onBack={() => { setDetail(null); load() }} />

  const filteredInProgress = inProgress.filter(l => matchesLotSearch(l, search))
  const filteredAvailable = available.filter(l => matchesLotSearch(l, search))

  return (
    <div>
      <div className="page-header">
        <div className="header-brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5v11A2.5 2.5 0 0 1 14.5 20h-5A2.5 2.5 0 0 1 7 17.5v-11Z"/>
              <path d="M9 8h6M9 12h6M9 16h4"/>
            </svg>
          </div>
          <h1>Stitching</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="status-pill">{inProgress.length + available.length} lots</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowHistory(true)}>History</button>
        </div>
      </div>

      <div className="page-content">
        {error && <div className="alert-error">{error}</div>}

        {(inProgress.length > 0 || available.length > 0) && (
          <div className="search-box">
            <span className="search-icon"><SearchIcon /></span>
            <input className="form-control" placeholder="Search by lot number, brand, fabricator…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <>
            <div className="production-summary">
              <div className="production-summary-top">
                <span className="section-label">Production flow</span>
                <span className="section-count">{inProgress.length + available.length} total</span>
              </div>
              <div className="production-balance">
                <div className="production-metric">
                  <span className="metric-label">In progress</span>
                  <strong>{inProgress.length}</strong>
                </div>
                <div className="production-metric muted">
                  <span className="metric-label">Available</span>
                  <strong>{available.length}</strong>
                </div>
              </div>
            </div>

            <CollapsibleSection title="In Progress" count={filteredInProgress.length}>
              {filteredInProgress.length === 0 ? (
                <div className="empty-state compact">
                  <div className="empty-icon">🧵</div>
                  <p>{search ? 'No matches' : 'No active stitching lots'}</p>
                </div>
              ) : (
                filteredInProgress.map((lot: any) => (
                  <div key={lot.id} className="production-card" onClick={() => setDetail(lot)}>
                    <div className="production-card-top">
                      <div>
                        <div className="production-lot-number">{lot.lotNumber}</div>
                        <div className="production-subtext">{lot.brand || 'Brand'} · {lot.fitType || 'Standard'}</div>
                      </div>
                      <span className={`badge ${ageBadgeClass(stageSince(lot))}`}>{formatAge(stageSince(lot))}</span>
                    </div>

                    <div className="production-meta">
                      <span>{lot.fabricator || formatDate(stageSince(lot))}</span>
                      <strong>{lot.currentQuantity} pcs</strong>
                    </div>
                  </div>
                ))
              )}
            </CollapsibleSection>

            <CollapsibleSection title="Available in Cutting" count={filteredAvailable.length}>
              {filteredAvailable.length === 0 ? (
                <div className="empty-state compact">
                  <div className="empty-icon">📦</div>
                  <p>{search ? 'No matches' : 'No cutting lots ready'}</p>
                </div>
              ) : (
                filteredAvailable.map((lot: any) => (
                  <div key={lot.id} className="production-card available" onClick={() => setActiveLot(lot)}>
                    <div className="production-card-top">
                      <div>
                        <div className="production-lot-number">{lot.lotNumber}</div>
                        <div className="production-subtext">{lot.brand || 'Brand'} · {lot.fitType || 'Standard'}</div>
                      </div>
                      <span className={`badge ${ageBadgeClass(stageSince(lot))}`}>{formatAge(stageSince(lot))}</span>
                    </div>

                    <div className="production-meta">
                      <span>{formatDate(stageSince(lot))}</span>
                      <strong>{lot.currentQuantity} pcs</strong>
                    </div>
                  </div>
                ))
              )}
            </CollapsibleSection>
          </>
        )}
      </div>

      {showHistory && <StageHistorySheet stageName="STITCHING" onClose={() => setShowHistory(false)} />}

      {activeLot && (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) { setActiveLot(null); setFabricator('') } }}>
          <div className="sheet">
            <div className="sheet-handle" />
            <p className="sheet-title">{activeLot.lotNumber}</p>

            <div className="card" style={{ background: 'var(--bg)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Brand</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{activeLot.brand || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Pieces</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#3730a3' }}>{activeLot.currentQuantity}</span>
              </div>
              {activeLot.fitType && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Fit</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{activeLot.fitType}</span>
                </div>
              )}
              {activeLot.fabricator && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Fabricator</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{activeLot.fabricator}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Fabricator Name</label>
              <input
                className="form-control"
                placeholder="e.g. ABC Fabricators"
                value={fabricator}
                onChange={e => setFabricator(e.target.value)}
              />
            </div>

            {error && <div className="alert-error">{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setDetail(activeLot); setActiveLot(null) }}>View History</button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={() => { setActiveLot(null); setFabricator('') }}>Cancel</button>
              <button className="btn btn-success btn-full" onClick={handleMove} disabled={moving}>{moving ? 'Moving…' : 'Complete Stitching →'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
