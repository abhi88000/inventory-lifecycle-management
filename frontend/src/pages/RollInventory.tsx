import React, { useEffect, useState } from 'react'
import { fetchRolls, createRoll } from '../api'

type Props = { onSelectRoll?: (roll: any) => void; selectMode?: boolean }

export default function RollInventory({ onSelectRoll, selectMode = false }: Props) {
  const [rolls, setRolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ rollNumber: '', fabric: '', length: '' })

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
      await createRoll({ rollNumber: form.rollNumber, fabric: form.fabric, length: Number(form.length) })
      setShowAdd(false); setForm({ rollNumber: '', fabric: '', length: '' }); await load()
    } catch (e: any) { setError(String(e)) }
    finally { setSaving(false) }
  }

  const filtered = rolls.filter(r =>
    !search || r.rollNumber?.toLowerCase().includes(search.toLowerCase()) || r.fabric?.toLowerCase().includes(search.toLowerCase())
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
            <div className="empty-icon">🧵</div>
            <p>{search ? 'No rolls match your search' : 'No rolls yet — add your first roll'}</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className={`roll-item ${selectMode ? 'card-clickable' : ''}`}
              onClick={() => selectMode && onSelectRoll && onSelectRoll(r)}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.rollNumber}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{r.fabric}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{r.length} m</div>
                <span className="badge badge-green" style={{ fontSize: 11 }}>Available</span>
              </div>
            </div>
          ))
        )}

        {!selectMode && (
          <button className="fab" onClick={() => setShowAdd(true)}>+</button>
        )}
      </div>

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
