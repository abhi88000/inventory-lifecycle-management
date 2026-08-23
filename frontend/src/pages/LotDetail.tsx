import React, { useEffect, useState } from 'react'
import { fetchHistory } from '../api'

const STAGE_LABELS: Record<string, string> = {
  RECEIVED: 'Received', CUTTING: 'Cutting', STITCHING: 'Stitching',
  WASHING: 'Washing', FINISHING: 'Finishing', PACKING: 'Packing',
  COMPLETED: 'Completed', DISPATCHED: 'Dispatched', WAREHOUSE: 'Warehouse'
}

type Props = { lot: any; onBack: () => void }

export default function LotDetail({ lot, onBack }: Props) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory(lot.id).then(setHistory).catch(() => setHistory([])).finally(() => setLoading(false))
  }, [lot.id])

  const sizeQty: Record<string, number> = lot.sizeQuantitiesJson ? (() => { try { return JSON.parse(lot.sizeQuantitiesJson) } catch { return {} } })() : {}

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>{lot.lotNumber}</h1>
        <span className={`badge badge badge-blue`}>{STAGE_LABELS[lot.currentStage?.name] || lot.currentStage?.name}</span>
      </div>

      <div className="page-content">
        {/* Core info */}
        <div className="card" style={{ marginBottom: 12 }}>
          {[
            ['Brand', lot.brand],
            ['Total Pieces', lot.currentQuantity],
            ['Fit Type', lot.fitType],
            ['Source Roll', lot.sourceRollNumber],
            ['Roll Length', lot.rollLength ? `${lot.rollLength} m` : null],
            ['Fabricator', lot.fabricator],
            ['Washer', lot.washer],
            ['Finisher', lot.finisher],
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
    </div>
  )
}
