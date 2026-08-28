import React, { useEffect, useState } from 'react'
import { fetchStageHistory } from '../api'

const STAGE_LABELS: Record<string, string> = {
  RECEIVED: 'Received', CUTTING: 'Cutting', STITCHING: 'Stitching',
  WASHING: 'Washing', FINISHING: 'Finishing', PACKING: 'Packing',
  COMPLETED: 'Completed', DISPATCHED: 'Dispatched', WAREHOUSE: 'Warehouse'
}

type Props = { stageName: string; onClose: () => void }

export default function StageHistorySheet({ stageName, onClose }: Props) {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStageHistory(stageName)
      .then(setEntries)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [stageName])

  return (
    <div className="sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <div className="sheet-handle" />
        <p className="sheet-title">{STAGE_LABELS[stageName] || stageName} \u2014 History</p>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading\u2026</div>
        ) : entries.length === 0 ? (
          <div className="empty-state compact"><p>No history yet</p></div>
        ) : (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {entries.map((h: any) => (
              <div key={h.id} className="card" style={{ padding: '10px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{h.lot?.lotNumber}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{h.quantity} pcs</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {h.fromStage?.name ? `${STAGE_LABELS[h.fromStage.name] || h.fromStage.name} \u2192 ` : ''}
                  {STAGE_LABELS[h.toStage?.name] || h.toStage?.name} \u00b7 {new Date(h.changedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-ghost btn-full" style={{ marginTop: 12 }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
