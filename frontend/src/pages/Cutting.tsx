import React, { useEffect, useState } from 'react'
import { fetchRolls, fetchLots } from '../api'
import LotDetail from './LotDetail'
import StageHistorySheet from './StageHistorySheet'
import CollapsibleSection from './CollapsibleSection'
import CreateLotSheet from './CreateLotSheet'
import { formatAge, formatDate, ageBadgeClass, sortByOldest, stageSince } from '../dateUtils'
import { FabricIcon, BrandTagIcon, CalendarIcon, RulerIcon, SearchIcon } from '../icons'
import { matchesLotSearch, matchesRollSearch } from '../search'

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
                <div key={r.id} className="roll-item card-clickable" onClick={() => { setSelectedRoll(r); setShowCreate(true) }}>
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

      {showCreate && (
        <CreateLotSheet
          roll={selectedRoll}
          onClose={() => { setShowCreate(false); setSelectedRoll(null) }}
          onCreated={() => { setShowCreate(false); setSelectedRoll(null); load() }}
        />
      )}
    </div>
  )
}
