import React from 'react'

const CusomizedTick = ({ x, y, payload, THE_COLLECTOR }: { x?: number, y?: number, payload?: any, THE_COLLECTOR: any }) => {
  THE_COLLECTOR.collect(payload.value, y);
  return (
    <g>
      <text x={x} y={y} fill='#5d6571' textAnchor='end' dy={16}>{payload.value}</text>
    </g>
  )
}

export default CusomizedTick