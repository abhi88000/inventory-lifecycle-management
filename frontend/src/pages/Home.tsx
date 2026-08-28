import React, { useEffect, useState } from 'react'
import { fetchLots, fetchRolls } from '../api'

function InventoryBrandMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8.5 12 3l8 5.5v7L12 21l-8-5.5v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8 11.5h8M8 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function CuttingStageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9.5 9.5 15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function StitchingStageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 15.5c2.1-4.1 4.5-6.1 7.5-6.1 2.1 0 4 1.2 6 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 17.5c1.6-2.5 3.2-3.8 5-3.8 2 0 3.7 1.2 5.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 7.5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function WashingStageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15.5c2.2-3 4.5-4.5 7-4.5 2 0 3.7.8 5.5 2.4 2.1 1.8 3.5 3.2 3.5 5.6H4v-3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M7 8.5c0-1.2 1-2.2 2.2-2.2a2.7 2.7 0 0 1 2.6 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M10 12.5c.9-.7 1.9-.9 3-.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function FinishingStageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6.5h12v11H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 10.5h6M9 13.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M5 6.5 3.8 4.5M19 6.5l1.2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function WarehouseStageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5 12 4l8 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 10.5V18h12v-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 18v-4h6v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
  { key: 'CUTTING', label: 'Cutting', icon: <CuttingStageIcon />, page: 'cutting', color: '#8a4b12', bg: '#f6e4b5' },
  { key: 'STITCHING', label: 'Stitching', icon: <StitchingStageIcon />, page: 'stitching', color: '#3341a1', bg: '#e1e8ff' },
  { key: 'WASHING', label: 'Washing', icon: <WashingStageIcon />, page: 'washing', color: '#0c7d6a', bg: '#d9f2eb' },
  { key: 'FINISHING', label: 'Finishing', icon: <FinishingStageIcon />, page: 'finishing', color: '#b34062', bg: '#fbe0eb' },
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
  const warehouseLots = byStage('WAREHOUSE').length + byStage('COMPLETED').length + byStage('PACKING').length
  const warehousePcs = pcsInStage('WAREHOUSE') + pcsInStage('COMPLETED') + pcsInStage('PACKING')

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
                <span className="feature-icon"><WarehouseStageIcon /></span>
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
                  <span className="mini-icon"><WarehouseStageIcon /></span>
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
