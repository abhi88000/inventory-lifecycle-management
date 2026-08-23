import React from 'react'
import StageSection from './StageSection'

export default function Stitching() {
  return (
    <StageSection
      title="Stitching"
      fromStage="CUTTING"
      toStage="STITCHING"
      actionLabel="Complete Stitching →"
      extraField={{ key: 'fabricator', label: 'Fabricator Name', placeholder: 'e.g. ABC Fabricators' }}
      stageColor="#3730a3"
    />
  )
}
