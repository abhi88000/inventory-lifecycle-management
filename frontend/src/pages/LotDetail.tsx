import React, { useEffect, useState } from 'react'
import { fetchHistory, updateLot } from '../api'
import { EditIcon } from '../icons'

const STAGE_LABELS: Record<string, string> = {
  RECEIVED: 'Received', CUTTING: 'Cutting', STITCHING: 'Stitching',
  WASHING: 'Washing', FINISHING: 'Finishing', PACKING: 'Packing',
  COMPLETED: 'Completed', DISPATCHED: 'Dispatched', WAREHOUSE: 'Warehouse'
}

const FIT_TYPES = ['Ankle', 'Regular', 'Comfort', 'Straight', 'Baggy']

type Props = { lot: any; onBack: () => void }

// Read-only lot detail view — history, size breakdown, and core metadata.
// Includes an Edit action to correct mistakes made during a stage move (wrong
// fabricator/washer/finisher name, wrong fit type, wrong piece count) without
// changing the lot's stage or history.
export default function LotDetail({ lot, onBack }: Props) {
  const [currentLot, setCurrentLot] = useState(lot)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    brand: lot.brand || '', fitType: lot.fitType || '', fabricator: lot.fabricator || '',
    washer: lot.washer || '', finisher: lot.finisher || '', currentQuantity: String(lot.currentQuantity ?? '')
  })

  useEffect(() => {
    fetchHistory(currentLot.id).then(setHistory).catch(() => setHistory([])).finally(() => setLoading(false))
  }, [currentLot.id])

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      const updated = await updateLot(currentLot.id, {
        brand: form.brand, fitType: form.fitType, fabricator: form.fabricator,
        washer: form.washer, finisher: form.finisher,
        currentQuantity: form.currentQuantity === '' ? null : Number(form.currentQuantity)
      })
      setCurrentLot(updated)
      setShowEdit(false)
    } catch (e: any) { setError(String(e)) }
    finally { setSaving(false) }
  }

  const sizeQty: Record<string, number> = currentLot.sizeQuantitiesJson ? (() => { try { return JSON.parse(currentLot.sizeQuantitiesJson) } catch { return {} } })() : {}

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>{currentLot.lotNumber}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge badge badge-blue`}>{STAGE_LABELS[currentLot.currentStage?.name] || currentLot.currentStage?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 14, height: 14 }}><EditIcon /></span> Edit
            </span>
          </button>
        </div>
      </div>

      <div className="page-content">
        {error && <div className="alert-error">{error}</div>}

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

      {/* Edit sheet — corrects metadata without moving stage or touching history */}
      {showEdit && (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) setShowEdit(false) }}>
          <div className="sheet">
            <div className="sheet-handle" />
            <p className="sheet-title">Edit {currentLot.lotNumber}</p>
            {error && <div className="alert-error">{error}</div>}
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input className="form-control" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Fit Type</label>
                <select className="form-control" value={form.fitType} onChange={e => setForm(f => ({ ...f, fitType: e.target.value }))}>
                  <option value="">—</option>
                  {FIT_TYPES.map(ft => <option key={ft}>{ft}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Pieces</label>
                <input className="form-control" type="number" min="0" value={form.currentQuantity} onChange={e => setForm(f => ({ ...f, currentQuantity: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Fabricator</label>
                <input className="form-control" value={form.fabricator} onChange={e => setForm(f => ({ ...f, fabricator: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Washer</label>
                <input className="form-control" value={form.washer} onChange={e => setForm(f => ({ ...f, washer: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Finisher</label>
                <input className="form-control" value={form.finisher} onChange={e => setForm(f => ({ ...f, finisher: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowEdit(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
