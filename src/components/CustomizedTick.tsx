import React from 'react'

const CusomizedTick = ({ x, y, payload, THE_COLLECTOR }: { x?: number, y?: number, payload?: any, THE_COLLECTOR: any }) => {
  THE_COLLECTOR.collect(payload.value, y);
  return (
    <g>
      <text x={x} y={y} fill='#666' textAnchor='end' dy={4}>{payload.value}</text>
    </g>
  )
}

export default CusomizedTick