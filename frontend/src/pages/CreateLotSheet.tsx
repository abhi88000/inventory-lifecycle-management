import React, { useState } from 'react'
import { createLot } from '../api'

const SIZES = ['30', '32', '34', '36']

// Shared lot creation form used by both the Cutting page and Roll Inventory.
// Creates a lot at the CUTTING stage from a fabric roll.
// The roll is deleted from inventory once the lot is created (fully consumed).

type Props = { roll: any; onClose: () => void; onCreated: () => void; title?: string; actionLabel?: string }

export default function CreateLotSheet({ roll, onClose, onCreated, title = 'Create Cutting Lot', actionLabel = 'Create Lot' }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    lotNumber: '', brand: roll?.brand || roll?.fabric || '', pcs: '100', fitType: 'Regular',
    ratios: { '30': '1', '32': '2', '34': '1', '36': '1' }
  })

  const totalRatio = SIZES.reduce((s, sz) => s + (Number(form.ratios[sz]) || 0), 0)
  const pcs = Number(form.pcs) || 0
  const sizeQty = (sz: string) => totalRatio > 0 ? Math.round(pcs * (Number(form.ratios[sz]) || 0) / totalRatio) : 0

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const ratios: Record<string, number> = {}
    SIZES.forEach(sz => { ratios[sz] = Number(form.ratios[sz]) || 0 })
    try {
      await createLot({
        lotNumber: form.lotNumber, brand: form.brand || roll?.brand || roll?.fabric, pcs,
        fitType: form.fitType, initialStage: 'CUTTING',
        sourceRollNumber: roll?.rollNumber || '',
        sizeRatiosJson: JSON.stringify(ratios)
      })
      onCreated()
    } catch (e: any) { setError(String(e)) }
    finally { setSaving(false) }
  }

  return (
    <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <div className="sheet-handle" />
        <p className="sheet-title">{title}</p>
        {roll && (
          <div className="card" style={{ background: 'var(--primary-light)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{roll.rollNumber}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{roll.fabric} · {roll.length} m</div>
          </div>
        )}
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Lot Number</label>
            <input className="form-control" placeholder="e.g. A-101" value={form.lotNumber} onChange={e => setForm(f => ({ ...f, lotNumber: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Brand</label>
            <input className="form-control" placeholder="e.g. ZARA" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Total Pieces</label>
            <input className="form-control" type="number" min="1" value={form.pcs} onChange={e => setForm(f => ({ ...f, pcs: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Size Ratios</label>
            <div className="ratio-grid">
              {SIZES.map(sz => (
                <div key={sz} className="ratio-item">
                  <div className="ratio-size">Size {sz}</div>
                  <input className="form-control" type="number" min="0" value={form.ratios[sz]} onChange={e => setForm(f => ({ ...f, ratios: { ...f.ratios, [sz]: e.target.value } }))} style={{ textAlign: 'center', padding: '0 4px' }} />
                  <div className="ratio-result">{sizeQty(sz)} pcs</div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Fit Type</label>
            <select className="form-control" value={form.fitType} onChange={e => setForm(f => ({ ...f, fitType: e.target.value }))}>
              {['Slim', 'Regular', 'Relaxed', 'Skinny'].map(ft => <option key={ft}>{ft}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>{saving ? 'Saving…' : actionLabel}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
