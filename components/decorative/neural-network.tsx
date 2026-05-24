"use client";
import React, { useRef, useEffect } from "react";

interface Node {
  x: number;
  y: number;
  glow: number; // 0 to 1 for glow animation
  layer: number;
}

interface Connection {
  from: Node;
  to: Node;
}

interface Signal {
  fromNode: Node;
  toNode: Node;
  progress: number;
  speed: number;
  color: string;
}

export function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Define layers: 4 -> 5 -> 5 -> 2 nodes
    const layerCounts = [4, 5, 5, 2];
    const width = 400;
    const height = 280;

    // Set high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Initialize nodes
    const nodes: Node[][] = [];
    layerCounts.forEach((count, lIndex) => {
      const layerNodes: Node[] = [];
      const x = 50 + (width - 100) * (lIndex / (layerCounts.length - 1));
      
      for (let i = 0; i < count; i++) {
        // Distribute nodes vertically centered
        const y = height / 2 + (i - (count - 1) / 2) * (height / (count + 0.8));
        layerNodes.push({
          x,
          y,
          glow: 0,
          layer: lIndex,
        });
      }
      nodes.push(layerNodes);
    });

    // Flatten nodes list for easy traversal
    const allNodes = nodes.flat();

    // Create connections list
    const connections: Connection[] = [];
    for (let l = 0; l < nodes.length - 1; l++) {
      const currentLayer = nodes[l];
      const nextLayer = nodes[l + 1];
      currentLayer.forEach((fromNode) => {
        nextLayer.forEach((toNode) => {
          connections.push({ from: fromNode, to: toNode });
        });
      });
    }

    let signals: Signal[] = [];

    // Spawn a signal from layer 0 to layer 1
    const spawnSignal = () => {
      const startNodes = nodes[0];
      const startNode = startNodes[Math.floor(Math.random() * startNodes.length)];
      const nextNodes = nodes[1];
      const endNode = nextNodes[Math.floor(Math.random() * nextNodes.length)];
      
      const colors = ["#3DD68C", "#818CF8"]; // Jade and Indigo signals
      const color = colors[Math.floor(Math.random() * colors.length)];

      signals.push({
        fromNode: startNode,
        toNode: endNode,
        progress: 0,
        speed: 0.01 + Math.random() * 0.015,
        color,
      });

      // Boost start node glow
      startNode.glow = 1.0;
    };

    // Spawn initial signals
    for (let i = 0; i < 3; i++) {
      setTimeout(spawnSignal, i * 600);
    }

    // Periodic signal generator
    const spawnInterval = setInterval(spawnSignal, 1500);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw dot grid pattern in background
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      const dotGap = 20;
      for (let x = 0; x < width; x += dotGap) {
        for (let y = 0; y < height; y += dotGap) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Draw connections (low opacity)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      connections.forEach((conn) => {
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
      });

      // 3. Update & Draw signals
      const activeSignals: Signal[] = [];
      signals.forEach((sig) => {
        sig.progress += sig.speed;

        if (sig.progress >= 1.0) {
          // Signal reached destination node
          sig.toNode.glow = 1.0;

          // Propagate to next layer if possible
          const nextLayerIndex = sig.toNode.layer + 1;
          if (nextLayerIndex < nodes.length) {
            const possibleNextNodes = nodes[nextLayerIndex];
            const nextNode = possibleNextNodes[Math.floor(Math.random() * possibleNextNodes.length)];
            
            activeSignals.push({
              fromNode: sig.toNode,
              toNode: nextNode,
              progress: 0,
              speed: 0.012 + Math.random() * 0.018,
              color: sig.color,
            });
          }
        } else {
          // Draw signal point
          const x = sig.fromNode.x + (sig.toNode.x - sig.fromNode.x) * sig.progress;
          const y = sig.fromNode.y + (sig.toNode.y - sig.fromNode.y) * sig.progress;

          // Draw trail
          ctx.strokeStyle = sig.color;
          ctx.globalAlpha = 0.15;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(
            sig.fromNode.x + (sig.toNode.x - sig.fromNode.x) * Math.max(0, sig.progress - 0.15),
            sig.fromNode.y + (sig.toNode.y - sig.fromNode.y) * Math.max(0, sig.progress - 0.15)
          );
          ctx.lineTo(x, y);
          ctx.stroke();

          // Draw head
          ctx.fillStyle = sig.color;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Glow shadow for head
          ctx.shadowColor = sig.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
          ctx.globalAlpha = 1.0; // reset

          activeSignals.push(sig);
        }
      });
      signals = activeSignals;

      // 4. Update & Draw nodes
      allNodes.forEach((node) => {
        // Fade out glow slowly
        if (node.glow > 0) {
          node.glow -= 0.03;
          if (node.glow < 0) node.glow = 0;
        }

        const nodeColor = node.layer === 0 ? "#3DD68C" : node.layer === 3 ? "#F59E0B" : "#818CF8"; // Jade, Gold, or Indigo nodes

        // Outer glowing ring if active
        if (node.glow > 0) {
          ctx.fillStyle = nodeColor;
          ctx.globalAlpha = node.glow * 0.25;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 7 + node.glow * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Draw node center
        ctx.fillStyle = node.glow > 0.3 ? nodeColor : "rgba(22, 22, 24, 0.9)";
        ctx.strokeStyle = nodeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnInterval);
    };
  }, []);

  return (
    <div className="w-full h-[280px] bg-[var(--surface)] border border-[var(--b1)] rounded-xl relative overflow-hidden flex items-center justify-center p-2">
      {/* Small subtle border accents */}
      <span className="absolute top-2 left-2 text-[9px] font-mono text-[var(--text-3)] tracking-wider">Live inference simulation</span>
      
      <canvas ref={canvasRef} className="block relative z-10" />

      {/* Footer labels inside network */}
      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-mono text-[var(--text-3)] tracking-widest uppercase">
        <span>Input</span>
        <span>Hidden (x2)</span>
        <span>Output</span>
      </div>
    </div>
  );
}
