import React from 'react'
import StageSection from './StageSection'

export default function Finishing() {
  return (
    <StageSection
      title="Finishing"
      fromStage="WASHING"
      toStage="FINISHING"
      nextStage="DISPATCHED"
      nextLabel="Dispatch to Warehouse"
      actionLabel="Complete Finishing →"
      extraField={{ key: 'finisher', label: 'Finisher Name', placeholder: 'e.g. DEF Finishers' }}
      stageColor="#9d174d"
    />
  )
}
