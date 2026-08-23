import React, { useEffect, useState } from 'react'
import { fetchLots, fetchRolls } from '../api'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const stageCards = [
  { key: 'CUTTING', label: 'Cutting', icon: '✂️', page: 'cutting', color: '#92400e', bg: '#fef3c7' },
  { key: 'STITCHING', label: 'Stitching', icon: '🧵', page: 'stitching', color: '#3730a3', bg: '#e0e7ff' },
  { key: 'WASHING', label: 'Washing', icon: '💧', page: 'washing', color: '#065f46', bg: '#d1fae5' },
  { key: 'FINISHING', label: 'Finishing', icon: '👖', page: 'finishing', color: '#9d174d', bg: '#fce7f3' },
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
          <span className="brand-mark">🏭</span>
          <h1>Inventory Lifecycle Management</h1>
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
                <span className="feature-icon">🧵</span>
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

              <div className="summary-card summary-full" style={{ background: '#d5f5e3' }} onClick={() => onNavigate('warehouse')}>
                <div className="sc-label" style={{ color: '#065f46' }}>
                  <span className="mini-icon">📦</span>
                  Warehouse
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div className="sc-value" style={{ color: '#065f46' }}>{warehouseLots} Lots</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#065f46' }}>{warehousePcs.toLocaleString()} pcs</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
