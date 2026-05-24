'use client'

import React from 'react'

export function NeuralNetwork() {
  // 4 layers: 3-4-4-2 nodes
  const layers = [
    [{ x: 60,  y: 80  }, { x: 60,  y: 160 }, { x: 60,  y: 240 }],
    [{ x: 180, y: 60  }, { x: 180, y: 130 }, { x: 180, y: 200 }, { x: 180, y: 270 }],
    [{ x: 300, y: 60  }, { x: 300, y: 130 }, { x: 300, y: 200 }, { x: 300, y: 270 }],
    [{ x: 420, y: 120 }, { x: 420, y: 200 }],
  ]
  
  // Generate all connections
  const connections: { id: string; x1: number; y1: number; x2: number; y2: number; delay: number }[] = []
  for (let l = 0; l < layers.length - 1; l++) {
    layers[l].forEach((node, i) => {
      layers[l + 1].forEach((nextNode, j) => {
        connections.push({
          id: `conn-${l}-${i}-${j}`,
          x1: node.x, y1: node.y,
          x2: nextNode.x, y2: nextNode.y,
          delay: (i + j) * 0.3,
        })
      })
    })
  }
  
  return (
    <div className="relative w-full h-[280px] rounded-xl overflow-hidden border"
         style={{ background: 'var(--surface)', borderColor: 'var(--b1)' }}>
      
      {/* Grid dots background */}
      <div className="absolute inset-0 opacity-20"
           style={{
             backgroundImage: 'radial-gradient(circle, rgba(61,214,140,0.3) 1px, transparent 1px)',
             backgroundSize: '28px 28px'
           }} />
      
      {/* SVG Network */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 320">
        <defs>
          {/* Animated signal dots on connections using SVG animation paths */}
          {connections.map((conn) => (
            <path
              key={`path-${conn.id}`}
              id={`path-element-${conn.id}`}
              d={`M${conn.x1},${conn.y1} L${conn.x2},${conn.y2}`}
              fill="none"
            />
          ))}
        </defs>

        {/* Connections */}
        {connections.map((conn) => (
          <line
            key={`line-${conn.id}`}
            x1={conn.x1} y1={conn.y1}
            x2={conn.x2} y2={conn.y2}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}
        
        {/* Animated signals */}
        {connections.slice(0, 10).map((conn, i) => (
          <circle key={`signal-${conn.id}`} r="2" fill="var(--jade)">
            <animateMotion
              dur={`${2.5 + i * 0.4}s`}
              repeatCount="indefinite"
              begin={`${conn.delay}s`}
            >
              <mpath href={`#path-element-${conn.id}`} />
            </animateMotion>
          </circle>
        ))}
        
        {/* Nodes — SVG animated nodes */}
        {layers.flat().map((node, i) => {
          const nodeColor = node.x === 60 ? "var(--jade)" : node.x === 420 ? "var(--gold)" : "var(--indigo)";
          return (
            <g key={`node-${i}`}>
              {/* Glow ring */}
              <circle
                cx={node.x} cy={node.y} r="8"
                fill="none"
                stroke={nodeColor}
                strokeWidth="1.5"
              >
                <animate
                  attributeName="r"
                  values="6;10;6"
                  dur={`${2 + (i % 3)}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.1;0.4;0.1"
                  dur={`${2 + (i % 3)}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Core dot */}
              <circle
                cx={node.x} cy={node.y} r="3.5"
                fill="var(--surface)"
                stroke={nodeColor}
                strokeWidth="1.5"
              >
                <animate
                  attributeName="r"
                  values="3;4.2;3"
                  dur={`${2.5 + (i % 4) * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>
      
      {/* Label */}
      <div className="absolute top-2 left-3">
        <span className="text-[9px] font-mono text-[var(--text-3)] tracking-wider">
          Hardware-accelerated CSS/SVG simulation
        </span>
      </div>

      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-mono text-[var(--text-3)] tracking-widest uppercase">
        <span>Input</span>
        <span>Hidden (x2)</span>
        <span>Output</span>
      </div>
    </div>
  )
}
