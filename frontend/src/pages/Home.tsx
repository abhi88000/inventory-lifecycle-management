import React, { useEffect, useState } from 'react'
import { fetchLots, fetchRolls } from '../api'
import { ScissorsIcon, NeedleThreadIcon, WashingMachineIcon, IronIcon, WarehouseIcon } from '../icons'

function InventoryBrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8.5 12 3l8 5.5v7L12 21l-8-5.5v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8 11.5h8M8 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const stageCards = [
  { key: 'CUTTING', label: 'Cutting', icon: <ScissorsIcon />, page: 'cutting', color: '#8a4b12', bg: '#f6e4b5' },
  { key: 'STITCHING', label: 'Stitching', icon: <NeedleThreadIcon />, page: 'stitching', color: '#3341a1', bg: '#e1e8ff' },
  { key: 'WASHING', label: 'Washing', icon: <WashingMachineIcon />, page: 'washing', color: '#0c7d6a', bg: '#d9f2eb' },
  { key: 'FINISHING', label: 'Finishing', icon: <IronIcon />, page: 'finishing', color: '#b34062', bg: '#fbe0eb' },
]

type Props = { onNavigate: (page: string) => void }

export default function Home({ onNavigate }: Props) {
  const [lots, setLots] = useState<any[]>([])
  const [rolls, setRolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [l, r] = await Promise.all([fetchLots(), fetchRolls()])
        setLots(l)
        setRolls(r)
      } catch (e: any) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const byStage = (name: string) => lots.filter(l => (l.currentStage?.name || 'RECEIVED') === name)
  const pcsInStage = (name: string) => byStage(name).reduce((s: number, l: any) => s + (l.currentQuantity || 0), 0)

  const availRolls = rolls.length
  const totalMeters = rolls.reduce((s: number, r: any) => s + (r.length || 0), 0)
  // Count all finished-goods lots: FINISHING, WAREHOUSE, COMPLETED, PACKING, and DISPATCHED
  const warehouseStages = ['FINISHING', 'WAREHOUSE', 'COMPLETED', 'PACKING', 'DISPATCHED']
  const warehouseLots = warehouseStages.reduce((n, s) => n + byStage(s).length, 0)
  const warehousePcs = warehouseStages.reduce((n, s) => n + pcsInStage(s), 0)

  return (
    <div>
      <div className="page-header">
        <div className="header-brand">
          <span className="brand-mark"><InventoryBrandMark /></span>
          <h1>Stock Monitoring</h1>
        </div>
        <span className="status-pill">Live</span>
      </div>

      <div className="page-content">
        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading production data…</div>
        ) : (
          <>
            <div className="welcome-row">
              <div>
                <p className="greeting">{greeting()}</p>
                <p className="greeting-sub">Inventory lifecycle overview</p>
              </div>
              <div className="mini-badge">{lots.length} lots</div>
            </div>

            <div className="card feature-card card-clickable" onClick={() => onNavigate('rolls')}>
              <div className="feature-card-head">
                <span className="feature-icon"><WarehouseIcon /></span>
                <span>Roll Inventory</span>
              </div>
              <div className="feature-count">{availRolls}</div>
              <div className="feature-meta">{totalMeters.toLocaleString()} meters available</div>
            </div>

            <div className="summary-grid">
              {stageCards.map(({ key, label, icon, page, color, bg }) => (
                <div key={key} className="summary-card" style={{ background: bg }} onClick={() => onNavigate(page)}>
                  <div className="sc-label" style={{ color }}>
                    <span className="mini-icon">{icon}</span>
                    {label}
                  </div>
                  <div className="sc-value" style={{ color }}>{byStage(key).length}</div>
                  <div className="sc-sub" style={{ color: color + 'aa' }}>{pcsInStage(key).toLocaleString()} pcs</div>
                </div>
              ))}

              <div className="summary-card summary-full warehouse-card" onClick={() => onNavigate('warehouse')}>
                <div className="sc-label warehouse-label">
                  <span className="mini-icon"><WarehouseIcon /></span>
                  Warehouse
                </div>
                <div className="warehouse-row">
                  <div className="sc-value warehouse-value">{warehouseLots} Lots</div>
                  <div className="warehouse-pcs">{warehousePcs.toLocaleString()} pcs</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
