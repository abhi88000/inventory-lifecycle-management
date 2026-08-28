import React, { useState } from 'react'
import { ChevronIcon } from '../icons'

type Props = { title: string; count: number; defaultOpen?: boolean; children: React.ReactNode }

export default function CollapsibleSection({ title, count, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="production-section">
      <button type="button" className="production-header collapsible-header" onClick={() => setOpen(o => !o)}>
        <span className="section-title">{title}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="section-count">{count}</span>
          <span className={`chevron${open ? ' open' : ''}`}><ChevronIcon /></span>
        </span>
      </button>
      {open && <div className="collapsible-content">{children}</div>}
    </div>
  )
}
