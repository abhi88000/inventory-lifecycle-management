import React from 'react'
import StageSection from './StageSection'

export default function Washing() {
  return (
    <StageSection
      title="Washing"
      fromStage="STITCHING"
      toStage="WASHING"
      nextStage="FINISHING"
      nextLabel="Move to Finishing"
      actionLabel="Complete Washing →"
      extraField={{ key: 'washer', label: 'Washer Name', placeholder: 'e.g. XYZ Washing' }}
      stageColor="#065f46"
    />
  )
}
