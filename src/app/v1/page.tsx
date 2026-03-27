'use client';

import { useState, useEffect } from 'react';


function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function createBlock(start, minutes, label = 'S&T') {
  return {
    start: new Date(start),
    end: new Date(start.getTime() + minutes * 60000),
    completed: false,
    reward: null,
    label
  };
}

function closestIndexByHour(blocks, hour) {
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < blocks.length; i++) {
    const d = Math.abs(blocks[i].start.getHours() + blocks[i].start.getMinutes() / 60 - hour);
    if (d < bestDiff) {
      bestDiff = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function relabelBlocks(blocks) {
  const updated = blocks.map(b => ({ ...b, label: 'S&T' }));

  const lastIdx = updated.length - 1;

  // Wake
  updated[0].label = 'Wake Routine';
  updated[1].label = 'Fine Arts';

  // Sleep (fixed)
  updated[lastIdx].label = 'Sleep Routine';
  updated[lastIdx-1].label = 'Fine Arts';
  updated[lastIdx-2].label = 'Fine Arts';
  
  // Fine Arts near 1PM
  const a1Idx = closestIndexByHour(updated, 13);
  updated[a1Idx].label = 'Fine Arts';

  // Exercise near 2PM
  const exIdx = closestIndexByHour(updated, 14);
  updated[exIdx].label = 'Exercise';
  if (exIdx + 1 < lastIdx) updated[exIdx + 1].label = 'Exercise';

  // Competition near 5PM
  const compIdx = closestIndexByHour(updated, 17);
  updated[compIdx].label = 'Competition';
  if (compIdx + 1 < lastIdx) updated[compIdx + 1].label = 'Competition';


  return updated;
}

export default function Page() {
  const STORAGE_KEY = 'scheduler_state';
  const [wakeTime, setWakeTime] = useState('');
  const [sleepTime, setSleepTime] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!wakeTime || !sleepTime) return;

    const today = new Date();

    const [wh, wm] = wakeTime.split(':');
    const [sh, sm] = sleepTime.split(':');

    const wake = new Date(today);
    wake.setHours(wh, wm, 0);

    const sleep = new Date(today);
    sleep.setHours(sh, sm, 0);

    const tempBlocks = [];
    let current = new Date(wake);

    while (current < sleep) {
      tempBlocks.push(createBlock(current, 30));
      current = new Date(current.getTime() + 30 * 60000);
    }

    const labeled = relabelBlocks(tempBlocks);

    setBlocks(labeled);
    setInitialized(true);
  }, [wakeTime, sleepTime]);

  const applyBreakToFuture = (updatedBlocks, startIndex, minutes) => {
    if (minutes === 0) return updatedBlocks;

    const adjusted = [...updatedBlocks];
    const lastIdx = adjusted.length - 1;

    for (let i = startIndex; i < lastIdx; i++) {
      adjusted[i].start = new Date(adjusted[i].start.getTime() + minutes * 60000);
      adjusted[i].end = new Date(adjusted[i].end.getTime() + minutes * 60000);
    }

    return relabelBlocks(adjusted);
  };

  const handleComplete = (index) => {
    const rewards = [
      { type: 'none', chance: 0.3, minutes: 0 },
      { type: '5m break', chance: 0.4, minutes: 5 },
      { type: '15m break', chance: 0.2, minutes: 15 },
      { type: '1h break', chance: 0.1, minutes: 60 }
    ];

    const rand = Math.random();
    let cumulative = 0;
    let selected = rewards[0];

    for (let r of rewards) {
      cumulative += r.chance;
      if (rand <= cumulative) {
        selected = r;
        break;
      }
    }

    let updated = [...blocks];

    updated[index].completed = true;
    updated[index].reward = selected.type;

    updated = applyBreakToFuture(updated, index + 1, selected.minutes);

    setBlocks(updated);
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        background: 'linear-gradient(180deg, #4facfe, #00f2fe)',
        color: '#fff',
        overflowY: 'auto'
      }}
    >
      {!initialized && (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={{ textAlign: 'center' }}>Setup Your Day</h2>

          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: 'none' }}
          />

          <input
            type="time"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: 'none' }}
          />
        </div>
      )}

      {initialized && (
        <div style={{ padding: 10 }}>
          {blocks.map((b, i) => {
            const now = new Date();
            const isCurrent = now >= b.start && now < b.end;

            const colorMap = {
              'Exercise': '#ff9966',
              'Competition': '#f7797d',
              'Fine Arts': '#a18cd1',
              'Wake Routine': '#43e97b',
              'Sleep Routine': '#667eea',
              'S&T': '#00c6ff'
            };

            return (
              <div
                key={i}
                style={{
                  width: '100%',
                  marginBottom: 10,
                  padding: 15,
                  borderRadius: 15,
                  background: isCurrent
                    ? 'linear-gradient(135deg, #ff7e5f, #feb47b)'
                    : colorMap[b.label] || 'rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>
                  {formatTime(b.start)} - {formatTime(b.end)}
                </div>

                <div style={{ marginTop: 5, fontSize: 13 }}>
                  {b.label}
                </div>

                {!b.completed && now >= b.end && (
                  <button
                    onClick={() => handleComplete(i)}
                    style={{
                      marginTop: 10,
                      padding: '10px 15px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#fff',
                      color: '#000',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  >
                    Complete Block
                  </button>
                )}

                {b.reward && (
                  <div style={{ marginTop: 10, fontWeight: 'bold' }}>
                    Reward: {b.reward}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

