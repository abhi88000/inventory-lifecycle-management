import React, { useEffect, useState } from 'react'
import { fetchRolls, fetchLots, createLot } from '../api'
import LotDetail from './LotDetail'
import StageHistorySheet from './StageHistorySheet'
import CollapsibleSection from './CollapsibleSection'
import { formatAge, formatDate, ageBadgeClass, sortByOldest, stageSince } from '../dateUtils'
import { FabricIcon, BrandTagIcon, CalendarIcon, RulerIcon, SearchIcon } from '../icons'
import { matchesLotSearch, matchesRollSearch } from '../search'

const SIZES = ['30', '32', '34', '36']

export default function Cutting() {
  const [rolls, setRolls] = useState<any[]>([])
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLot, setSelectedLot] = useState<any | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [search, setSearch] = useState('')

  // Lot creation flow
  const [selectedRoll, setSelectedRoll] = useState<any | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ lotNumber: '', brand: '', pcs: '100', fitType: 'Regular', ratios: { '30': '1', '32': '2', '34': '1', '36': '1' } })

  async function load() {
    setLoading(true); setError(null)
    try {
      const [r, l] = await Promise.all([fetchRolls(), fetchLots()])
      setRolls(r)
      setLots(sortByOldest(l.filter((x: any) => (x.currentStage?.name || '') === 'CUTTING')))
    } catch (e: any) { setError(String(e)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const totalRatio = SIZES.reduce((s, sz) => s + (Number(form.ratios[sz]) || 0), 0)
  const pcs = Number(form.pcs) || 0
  const sizeQty = (sz: string) => totalRatio > 0 ? Math.round(pcs * (Number(form.ratios[sz]) || 0) / totalRatio) : 0

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const ratios: Record<string, number> = {}
    SIZES.forEach(sz => { ratios[sz] = Number(form.ratios[sz]) || 0 })
    try {
      await createLot({
        lotNumber: form.lotNumber, brand: form.brand || selectedRoll?.brand || selectedRoll?.fabric, pcs,
        fitType: form.fitType, initialStage: 'CUTTING',
        sourceRollNumber: selectedRoll?.rollNumber || '',
        sizeRatiosJson: JSON.stringify(ratios)
      })
      setShowCreate(false); setSelectedRoll(null)
      setForm({ lotNumber: '', brand: '', pcs: '100', fitType: 'Regular', ratios: { '30': '1', '32': '2', '34': '1', '36': '1' } })
      await load()
    } catch (e: any) { setError(String(e)) }
    finally { setSaving(false) }
  }

  if (selectedLot) return <LotDetail lot={selectedLot} onBack={() => { setSelectedLot(null); load() }} />

  const filteredLots = lots.filter(l => matchesLotSearch(l, search))
  const filteredRolls = rolls.filter(r => matchesRollSearch(r, search))

  return (
    <div>
      <div className="page-header">
        <h1>Cutting</h1>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowHistory(true)}>History</button>
      </div>
      <div className="page-content">
        {error && <div className="alert-error">{error}</div>}
        {(lots.length > 0 || rolls.length > 0) && (
          <div className="search-box">
            <span className="search-icon"><SearchIcon /></span>
            <input className="form-control" placeholder="Search by lot/roll number, brand, fabric…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}
        {loading ? <div className="loading">Loading…</div> : (
          <>
            {/* Lots in cutting */}
            {lots.length > 0 && (
              <CollapsibleSection title="In Progress" count={filteredLots.length}>
                {filteredLots.length === 0 ? (
                  <div className="empty-state compact"><p>No matches</p></div>
                ) : (
                  filteredLots.map(l => (
                    <div key={l.id} className="lot-item" onClick={() => setSelectedLot(l)}>
                      <div className="lot-item-left">
                        <div className="lot-item-title">{l.lotNumber}</div>
                        <div className="lot-item-sub">{l.brand} · {l.fitType} · {formatDate(stageSince(l))}</div>
                      </div>
                      <div className="lot-item-right">
                        <div className="lot-item-pcs">{l.currentQuantity}</div>
                        <span className={`badge ${ageBadgeClass(stageSince(l))}`}>{formatAge(stageSince(l))}</span>
                      </div>
                    </div>
                  ))
                )}
              </CollapsibleSection>
            )}

            {/* Available rolls */}
            <CollapsibleSection title="Available Rolls" count={filteredRolls.length}>
              {rolls.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><FabricIcon /></div><p>No rolls yet — add rolls in Roll Inventory</p></div>
              ) : filteredRolls.length === 0 ? (
                <div className="empty-state compact"><p>No matches</p></div>
              ) : (
                filteredRolls.map(r => (
                <div key={r.id} className="roll-item card-clickable" onClick={() => { setSelectedRoll(r); setForm(f => ({ ...f, brand: r.brand || r.fabric || '' })); setShowCreate(true) }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                      <span className="mini-icon"><FabricIcon /></span>
                      {r.rollNumber}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                      {r.brand && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)', fontSize: 13 }}>
                          <span className="mini-icon" style={{ width: 16, height: 16 }}><BrandTagIcon /></span>
                          {r.brand}
                        </span>
                      )}
                      {r.fabric && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{r.fabric}</span>}
                    </div>
                    {r.createdAt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: 'var(--muted)', fontSize: 12 }}>
                        <span className="mini-icon" style={{ width: 16, height: 16 }}><CalendarIcon /></span>
                        {formatDate(r.createdAt)}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontWeight: 800, fontSize: 15 }}>
                      <span className="mini-icon" style={{ width: 16, height: 16 }}><RulerIcon /></span>
                      {r.length} m
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--primary)' }}>Tap to cut →</div>
                  </div>
                </div>
                ))
              )}
            </CollapsibleSection>
          </>
        )}
      </div>

      {showHistory && <StageHistorySheet stageName="CUTTING" onClose={() => setShowHistory(false)} />}

      {/* Create lot sheet */}
      {showCreate && (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <div className="sheet">
            <div className="sheet-handle" />
            <p className="sheet-title">Create Cutting Lot</p>
            {selectedRoll && (
              <div className="card" style={{ background: 'var(--primary-light)', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedRoll.rollNumber}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{selectedRoll.fabric} · {selectedRoll.length} m</div>
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
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={saving}>{saving ? 'Saving…' : 'Create Lot'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
