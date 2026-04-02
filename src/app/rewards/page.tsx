'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Segment {
  label: string;
  weight: number;
  color: string;
}

const segments: Segment[] = [
  { label: 'No Moniegold', weight: 30, color: '#0f172a' },
  { label: '1 Moniegold', weight: 40, color: '#1e293b' },
  { label: '3 Moniegold', weight: 20, color: '#334155' },
  { label: '12 Moniegold', weight: 10, color: '#475569' },
];

function getRandomSegment(): Segment {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const seg of segments) {
    cumulative += seg.weight;
    if (rand <= cumulative) return seg;
  }

  return segments[0];
}

export default function Page() {
  const [rotation, setRotation] = useState<number>(0);
  const [result, setResult] = useState<string>('Tap to spin');
  const [spinning, setSpinning] = useState<boolean>(false);

  const spinWheel = (): void => {
    if (spinning) return;

    const chosen = getRandomSegment();
    const index = segments.findIndex((s) => s.label === chosen.label);
    const segmentAngle = 360 / segments.length;

    // current rotation normalized
    const currentRotation = rotation % 360;

    // center of selected segment
    const targetAngle = 360 - (index * segmentAngle + segmentAngle / 2);

    // calculate exact delta needed
    let delta = targetAngle - currentRotation;
    if (delta < 0) delta += 360;

    const extraSpins = 1440; // smooth animation
    const newRotation = rotation + extraSpins + delta;

    setSpinning(true);
    setRotation(newRotation);

    setTimeout(() => {
      setResult(chosen.label);
      setSpinning(false);
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Break Wheel</h1>

      <div style={styles.wheelWrapper}>
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          style={styles.wheel}
        >
          {segments.map((seg, i) => {
            const angle = (360 / segments.length) * i;

            return (
              <div
                key={i}
                style={{
                  ...styles.segment,
                  transform: `rotate(${angle}deg)`,
                  background: seg.color,
                }}
              >
                <span style={styles.label}>{seg.label}</span>
              </div>
            );
          })}
        </motion.div>

        <div style={styles.pointer} />
      </div>

      <button style={styles.button} onClick={spinWheel}>
        {spinning ? 'Spinning...' : 'Spin'}
      </button>

      <p style={styles.result}>{result}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    background: 'linear-gradient(135deg, #020617, #0f172a)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#e2e8f0',
    fontFamily: 'system-ui, sans-serif',
    padding: '16px',
  },
  title: {
    fontSize: '30px',
    fontWeight: 600,
    marginBottom: '24px',
    letterSpacing: '0.5px',
  },
  wheelWrapper: {
    position: 'relative',
    width: '300px',
    height: '300px',
    marginBottom: '28px',
  },
  wheel: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  segment: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    top: '50%',
    left: '50%',
    transformOrigin: '0% 0%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    transform: 'rotate(45deg)',
    fontSize: '12px',
    fontWeight: 500,
    textAlign: 'center',
    padding: '6px',
    color: '#f1f5f9',
  },
  pointer: {
    position: 'absolute',
    top: '73px',
    left: '95%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '12px solid transparent',
    borderRight: '12px solid transparent',
    borderBottom: '22px solid #f1f5f9',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
  },
  button: {
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: 600,
    background: '#f1f5f9',
    color: '#020617',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    marginBottom: '14px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
  },
  result: {
    fontSize: '20px',
    fontWeight: 500,
    opacity: 0.95,
  },
};
