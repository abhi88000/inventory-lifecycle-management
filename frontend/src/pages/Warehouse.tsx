import React, { useEffect, useState } from 'react'
import { fetchLots, moveLot } from '../api'
import LotDetail from './LotDetail'

export default function Warehouse() {
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<any | null>(null)
  const [activeLot, setActiveLot] = useState<any | null>(null)
  const [moving, setMoving] = useState(false)

  async function load() {
    setLoading(true); setError(null)
    try {
      const all = await fetchLots()
      // Show all lots that have completed production: FINISHING, WAREHOUSE, PACKING, COMPLETED, DISPATCHED
      setLots(all.filter((l: any) => ['FINISHING', 'WAREHOUSE', 'PACKING', 'COMPLETED', 'DISPATCHED'].includes(l.currentStage?.name || '')))
    } catch (e: any) { setError(String(e)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = lots.filter(l =>
    !search || l.lotNumber?.toLowerCase().includes(search.toLowerCase()) || l.brand?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPcs = lots.reduce((s, l) => s + (l.currentQuantity || 0), 0)

  async function handleDispatch() {
    if (!activeLot) return
    setMoving(true); setError(null)
    try {
      await moveLot(activeLot.id, { toStage: 'DISPATCHED', quantity: activeLot.currentQuantity })
      setActiveLot(null); await load()
    } catch (e: any) { setError(String(e)) }
    finally { setMoving(false) }
  }

  if (detail) return <LotDetail lot={detail} onBack={() => { setDetail(null); load() }} />

  return (
    <div>
      <div className="page-header"><h1>Warehouse</h1></div>
      <div className="page-content">
        {error && <div className="alert-error">{error}</div>}

        <div className="card" style={{ background: 'linear-gradient(135deg,#0e9f6e,#065f46)', color: '#fff', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, opacity: .8, marginBottom: 4 }}>Finished Lots</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{lots.length}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, opacity: .8, marginBottom: 4 }}>Finished Pieces</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{totalPcs.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <input className="form-control" placeholder="Search lots…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />

        {loading ? <div className="loading">Loading…</div> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏬</div>
            <p>{search ? 'No results' : 'No finished lots yet'}</p>
          </div>
        ) : (
          filtered.map(l => (
            <div key={l.id} className="lot-item" onClick={() => setActiveLot(l)}>
              <div className="lot-item-left">
                <div className="lot-item-title">{l.lotNumber}</div>
                <div className="lot-item-sub">{[l.brand, l.fitType, l.finisher].filter(Boolean).join(' · ')}</div>
              </div>
              <div className="lot-item-right">
                <div className="lot-item-pcs" style={{ color: '#0e9f6e' }}>{l.currentQuantity}</div>
                <div className="lot-item-stage">pcs</div>
              </div>
            </div>
          ))
        )}
      </div>

      {activeLot && (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) setActiveLot(null) }}>
          <div className="sheet">
            <div className="sheet-handle" />
            <p className="sheet-title">{activeLot.lotNumber}</p>
            <div className="card" style={{ background: 'var(--bg)', marginBottom: 16 }}>
              {[
                ['Brand', activeLot.brand],
                ['Pieces', activeLot.currentQuantity],
                ['Fit', activeLot.fitType],
                ['Fabricator', activeLot.fabricator],
                ['Washer', activeLot.washer],
                ['Finisher', activeLot.finisher],
              ].filter(([,v]) => v).map(([k, v]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>{k}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                </div>
              ))}
            </div>
            {error && <div className="alert-error">{error}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={() => { setDetail(activeLot); setActiveLot(null) }}>View History</button>
              <button className="btn btn-primary btn-full" onClick={handleDispatch} disabled={moving}>{moving ? '…' : 'Dispatch ↗'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
