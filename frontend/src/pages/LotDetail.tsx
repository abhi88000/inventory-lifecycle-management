import React, { useEffect, useState } from 'react'
import { fetchHistory, fetchLots, moveLot } from '../api'

const STAGE_LABELS: Record<string, string> = {
  RECEIVED: 'Received', CUTTING: 'Cutting', STITCHING: 'Stitching',
  WASHING: 'Washing', FINISHING: 'Finishing', PACKING: 'Packing',
  COMPLETED: 'Completed', DISPATCHED: 'Dispatched', WAREHOUSE: 'Warehouse'
}

const NEXT_STEPS: Record<string, { stage: string; label: string; extra?: { key: string; label: string; placeholder: string } }> = {
  RECEIVED: { stage: 'CUTTING', label: 'Move to Cutting' },
  CUTTING: { stage: 'STITCHING', label: 'Move to Stitching', extra: { key: 'fabricator', label: 'Fabricator Name', placeholder: 'e.g. ABC Fabricators' } },
  STITCHING: { stage: 'WASHING', label: 'Move to Washing', extra: { key: 'washer', label: 'Washer Name', placeholder: 'e.g. XYZ Washing' } },
  WASHING: { stage: 'FINISHING', label: 'Move to Finishing', extra: { key: 'finisher', label: 'Finisher Name', placeholder: 'e.g. DEF Finishers' } },
  FINISHING: { stage: 'DISPATCHED', label: 'Dispatch to Warehouse' },
}

type Props = { lot: any; onBack: () => void }

export default function LotDetail({ lot, onBack }: Props) {
  const [currentLot, setCurrentLot] = useState(lot)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showMove, setShowMove] = useState(false)
  const [extraValue, setExtraValue] = useState('')
  const [moving, setMoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function loadHistory() {
    fetchHistory(currentLot.id).then(setHistory).catch(() => setHistory([])).finally(() => setLoading(false))
  }

  useEffect(() => { loadHistory() }, [currentLot.id])

  const nextStep = NEXT_STEPS[currentLot.currentStage?.name]

  async function handleMoveNext() {
    if (!nextStep) return
    setMoving(true); setError(null)
    const payload: any = { toStage: nextStep.stage, quantity: currentLot.currentQuantity }
    if (nextStep.extra) payload[nextStep.extra.key] = extraValue
    try {
      await moveLot(currentLot.id, payload)
      const all = await fetchLots()
      const updated = all.find((x: any) => x.id === currentLot.id)
      if (updated) setCurrentLot(updated)
      setShowMove(false); setExtraValue('')
      loadHistory()
    } catch (e: any) { setError(String(e)) }
    finally { setMoving(false) }
  }

  const sizeQty: Record<string, number> = currentLot.sizeQuantitiesJson ? (() => { try { return JSON.parse(currentLot.sizeQuantitiesJson) } catch { return {} } })() : {}

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>{currentLot.lotNumber}</h1>
        <span className={`badge badge badge-blue`}>{STAGE_LABELS[currentLot.currentStage?.name] || currentLot.currentStage?.name}</span>
      </div>

      <div className="page-content">
        {error && <div className="alert-error">{error}</div>}

        {nextStep && (
          <button className="btn btn-primary btn-full" style={{ marginBottom: 16 }} onClick={() => setShowMove(true)}>
            {nextStep.label} →
          </button>
        )}

        {/* Core info */}
        <div className="card" style={{ marginBottom: 12 }}>
          {[
            ['Brand', currentLot.brand],
            ['Total Pieces', currentLot.currentQuantity],
            ['Fit Type', currentLot.fitType],
            ['Source Roll', currentLot.sourceRollNumber],
            ['Roll Length', currentLot.rollLength ? `${currentLot.rollLength} m` : null],
            ['Fabricator', currentLot.fabricator],
            ['Washer', currentLot.washer],
            ['Finisher', currentLot.finisher],
          ].filter(([, v]) => v != null && v !== '').map(([k, v]) => (
            <div key={k as string} className="detail-row">
              <span className="detail-key">{k}</span>
              <span className="detail-val">{v}</span>
            </div>
          ))}
        </div>

        {/* Size breakdown */}
        {Object.keys(sizeQty).length > 0 && (
          <>
            <p className="section-title">Size Breakdown</p>
            <div className="summary-grid" style={{ marginBottom: 16 }}>
              {Object.entries(sizeQty).map(([size, qty]) => (
                <div key={size} className="summary-card" style={{ background: 'var(--primary-light)' }}>
                  <div className="sc-label" style={{ color: 'var(--primary)' }}>Size {size}</div>
                  <div className="sc-value" style={{ color: 'var(--primary)' }}>{qty}</div>
                  <div className="sc-sub">pcs</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* History timeline */}
        <p className="section-title">Production Journey</p>
        {loading ? <div className="loading">Loading history…</div> : history.length === 0 ? (
          <div className="empty-state"><p>No history yet</p></div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 8, top: 6, bottom: 6, width: 2, background: 'var(--border)', borderRadius: 2 }} />
            {history.map((h, i) => (
              <div key={h.id} style={{ position: 'relative', marginBottom: 18 }}>
                <div style={{ position: 'absolute', left: -20, top: 4, width: 10, height: 10, borderRadius: '50%', background: i === history.length - 1 ? 'var(--primary)' : 'var(--border)', border: '2px solid var(--surface)' }} />
                <div className="card" style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{h.fromStage?.name ? `${STAGE_LABELS[h.fromStage.name] || h.fromStage.name} → ` : ''}{STAGE_LABELS[h.toStage?.name] || h.toStage?.name}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{h.quantity} pcs</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(h.changedAt).toLocaleString()}</div>
                  {h.notes && <div style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic', color: 'var(--muted)' }}>{h.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showMove && nextStep && (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowMove(false); setExtraValue('') } }}>
          <div className="sheet">
            <div className="sheet-handle" />
            <p className="sheet-title">{nextStep.label}</p>

            <div className="card" style={{ background: 'var(--bg)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Pieces</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>{currentLot.currentQuantity}</span>
              </div>
            </div>

            {nextStep.extra && (
              <div className="form-group">
                <label className="form-label">{nextStep.extra.label}</label>
                <input className="form-control" placeholder={nextStep.extra.placeholder} value={extraValue} onChange={e => setExtraValue(e.target.value)} />
              </div>
            )}

            {error && <div className="alert-error">{error}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={() => { setShowMove(false); setExtraValue('') }}>Cancel</button>
              <button className="btn btn-success btn-full" onClick={handleMoveNext} disabled={moving}>{moving ? 'Moving…' : nextStep.label}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
