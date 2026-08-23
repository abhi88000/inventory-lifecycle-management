import React, { useEffect, useState } from 'react'
import { fetchLots, moveLot } from '../api'
import LotDetail from './LotDetail'

type StageSectionProps = {
  title: string
  fromStage: string
  toStage: string
  actionLabel: string
  extraField?: { key: string; label: string; placeholder: string }
  stageColor?: string
}

export default function StageSection({ title, fromStage, toStage, actionLabel, extraField, stageColor = 'var(--primary)' }: StageSectionProps) {
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLot, setActiveLot] = useState<any | null>(null)
  const [detail, setDetail] = useState<any | null>(null)
  const [extraValue, setExtraValue] = useState('')
  const [moving, setMoving] = useState(false)

  async function load() {
    setLoading(true); setError(null)
    try {
      const all = await fetchLots()
      setLots(all.filter((l: any) => (l.currentStage?.name || '') === fromStage))
    } catch (e: any) { setError(String(e)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [fromStage])

  async function handleMove() {
    if (!activeLot) return
    setMoving(true); setError(null)
    const payload: any = { toStage, quantity: activeLot.currentQuantity }
    if (extraField) payload[extraField.key] = extraValue
    try {
      await moveLot(activeLot.id, payload)
      setActiveLot(null); setExtraValue(''); await load()
    } catch (e: any) { setError(String(e)) }
    finally { setMoving(false) }
  }

  if (detail) return <LotDetail lot={detail} onBack={() => { setDetail(null); load() }} />

  return (
    <div>
      <div className="page-header"><h1>{title}</h1></div>
      <div className="page-content">
        {error && <div className="alert-error">{error}</div>}
        {loading ? <div className="loading">Loading…</div> : lots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No lots at {title} stage</p>
          </div>
        ) : (
          <>
            <p className="section-title">{lots.length} Lot{lots.length !== 1 ? 's' : ''}</p>
            {lots.map(l => (
              <div key={l.id} className="lot-item" onClick={() => setActiveLot(l)}>
                <div className="lot-item-left">
                  <div className="lot-item-title">{l.lotNumber}</div>
                  <div className="lot-item-sub">{l.brand}{l.fabricator ? ` · ${l.fabricator}` : ''}</div>
                </div>
                <div className="lot-item-right">
                  <div className="lot-item-pcs" style={{ color: stageColor }}>{l.currentQuantity}</div>
                  <div className="lot-item-stage">pcs</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Action sheet */}
      {activeLot && (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) { setActiveLot(null); setExtraValue('') } }}>
          <div className="sheet">
            <div className="sheet-handle" />
            <p className="sheet-title">{activeLot.lotNumber}</p>

            {/* Lot summary */}
            <div className="card" style={{ background: 'var(--bg)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Brand</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{activeLot.brand || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Pieces</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: stageColor }}>{activeLot.currentQuantity}</span>
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
              {activeLot.washer && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Washer</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{activeLot.washer}</span>
                </div>
              )}
            </div>

            {/* Extra data entry */}
            {extraField && (
              <div className="form-group">
                <label className="form-label">{extraField.label}</label>
                <input className="form-control" placeholder={extraField.placeholder} value={extraValue} onChange={e => setExtraValue(e.target.value)} />
              </div>
            )}

            {error && <div className="alert-error">{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setDetail(activeLot); setActiveLot(null) }}>View History</button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={() => { setActiveLot(null); setExtraValue('') }}>Cancel</button>
              <button className="btn btn-success btn-full" onClick={handleMove} disabled={moving}>{moving ? 'Moving…' : actionLabel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
