import React from 'react'
import StageSection from './StageSection'

export default function Stitching() {
  return (
    <StageSection
      title="Stitching"
      fromStage="CUTTING"
      toStage="STITCHING"
      nextStage="WASHING"
      nextLabel="Move to Washing"
      actionLabel="Complete Stitching →"
      extraField={{ key: 'fabricator', label: 'Fabricator Name', placeholder: 'e.g. ABC Fabricators' }}
      stageColor="#3730a3"
    />
  )
}

