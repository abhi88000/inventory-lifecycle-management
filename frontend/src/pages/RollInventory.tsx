import React, { useEffect, useState } from 'react'
import { fetchRolls, createRoll } from '../api'
import { formatAge, formatDate, ageBadgeClass } from '../dateUtils'
import { FabricIcon, BrandTagIcon, CalendarIcon, RulerIcon } from '../icons'
import CreateLotSheet from './CreateLotSheet'

type Props = { onSelectRoll?: (roll: any) => void; selectMode?: boolean }

export default function RollInventory({ onSelectRoll, selectMode = false }: Props) {
  const [rolls, setRolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ rollNumber: '', fabric: '', brand: '', length: '' })
  const [moveRoll, setMoveRoll] = useState<any | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try { setRolls(await fetchRolls()) }
    catch (e: any) { setError(String(e)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      await createRoll({ rollNumber: form.rollNumber, fabric: form.fabric, brand: form.brand, length: Number(form.length) })
      setShowAdd(false); setForm({ rollNumber: '', fabric: '', brand: '', length: '' }); await load()
    } catch (e: any) { setError(String(e)) }
    finally { setSaving(false) }
  }

  const filtered = rolls.filter(r =>
    !search || r.rollNumber?.toLowerCase().includes(search.toLowerCase()) || r.fabric?.toLowerCase().includes(search.toLowerCase()) || r.brand?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {!selectMode && (
        <div className="page-header">
          <h1>Roll Inventory</h1>
        </div>
      )}

      <div className="page-content" style={selectMode ? { padding: 0, paddingBottom: 0 } : {}}>
        {error && <div className="alert-error">{error}</div>}

        {!selectMode && (
          <div className="card" style={{ padding: '12px 16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{rolls.length} Rolls</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {rolls.reduce((s, r) => s + (r.length || 0), 0).toLocaleString()} m available
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Roll</button>
            </div>
          </div>
        )}

        <input className="form-control" placeholder="Search rolls…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />

        {loading ? <div className="loading">Loading…</div> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FabricIcon /></div>
            <p>{search ? 'No rolls match your search' : 'No rolls yet — add your first roll'}</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="roll-item card-clickable"
              onClick={() => selectMode ? (onSelectRoll && onSelectRoll(r)) : setMoveRoll(r)}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 15 }}>
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
                  {r.fabric && (
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>{r.fabric}</span>
                  )}
                </div>
                {r.createdAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: 'var(--muted)', fontSize: 12 }}>
                    <span className="mini-icon" style={{ width: 16, height: 16 }}><CalendarIcon /></span>
                    {formatDate(r.createdAt)}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, fontWeight: 800, fontSize: 16 }}>
                  <span className="mini-icon" style={{ width: 16, height: 16 }}><RulerIcon /></span>
                  {r.length} m
                </div>
                <span className={`badge ${ageBadgeClass(r.createdAt)}`} style={{ fontSize: 11 }}>{formatAge(r.createdAt) || 'Available'}</span>
                {!selectMode && <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4 }}>Move to Cutting →</div>}
              </div>
            </div>
          ))
        )}

        {!selectMode && (
          <button className="fab" onClick={() => setShowAdd(true)}>+</button>
        )}
      </div>

      {moveRoll && (
        <CreateLotSheet
          roll={moveRoll}
          onClose={() => setMoveRoll(null)}
          onCreated={() => { setMoveRoll(null); load() }}
        />
      )}

      {showAdd && (
        <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div className="sheet">
            <div className="sheet-handle" />
            <p className="sheet-title">Add Fabric Roll</p>
            {error && <div className="alert-error">{error}</div>}
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input className="form-control" placeholder="e.g. R-001" value={form.rollNumber} onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fabric</label>
                <input className="form-control" placeholder="e.g. Denim Blue" value={form.fabric} onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input className="form-control" placeholder="e.g. FutureZ" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Length (metres)</label>
                <input className="form-control" type="number" placeholder="120" value={form.length} onChange={e => setForm(f => ({ ...f, length: e.target.value }))} required min="0" step="0.1" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={saving}>{saving ? 'Saving…' : 'Save Roll'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
