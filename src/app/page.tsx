'use client';

import { useState, useEffect } from 'react';

type Block = {
  start: Date;
  end: Date;
  completed: boolean;
  reward: string | null;
  label: string;
};

type Reward = {
  type: string;
  chance: number;
  minutes: number;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function createBlock(start: Date, minutes: number, label = 'S&T'): Block {
  return {
    start: new Date(start),
    end: new Date(start.getTime() + minutes * 60000),
    completed: false,
    reward: null,
    label
  };
}

function closestIndexByHour(blocks: Block[], hour: number): number {
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

function relabelBlocks(blocks: Block[], sleepTime?: string): Block[] {
  if (!blocks.length) return [];

  const updated = blocks.map(b => ({ ...b, label: 'S&T' }));
  const lastIdx = updated.length - 1;

  // Wake
  updated[0].label = 'Wake Routine';
  if (updated[1]) updated[1].label = 'Fine Arts';

  // Fine Arts near 12PM
  const a1Idx = closestIndexByHour(updated, 12);
  if (updated[a1Idx]) updated[a1Idx].label = 'Fine Arts';
  if (updated[a1Idx + 1]) updated[a1Idx + 1]?.label && (updated[a1Idx + 1].label = 'Fine Arts');

  // Exercise near 2PM
  const exIdx = closestIndexByHour(updated, 14);
  if (updated[exIdx]) updated[exIdx].label = 'Exercise';
  if (updated[exIdx + 1]) updated[exIdx + 1].label = 'Exercise';

  // Competition near 5PM
  const compIdx = closestIndexByHour(updated, 17);
  if (updated[compIdx]) updated[compIdx].label = 'Competition';
  if (updated[compIdx + 1]) updated[compIdx + 1].label = 'Competition';

  if (sleepTime) {
    const [sh, sm] = sleepTime.split(':').map(Number);
    const sleep = new Date();
    sleep.setHours(sh, sm, 0, 0);

    const filtered = updated.filter(b => b.label !== 'S&T' || b.end <= sleep);

    // Sleep near sleeptime
    const sleepIdx = closestIndexByHour(filtered, sh);
    if (filtered[sleepIdx]) filtered[sleepIdx].label = 'Sleep Routine';
    if (filtered[sleepIdx - 1]) filtered[sleepIdx - 1].label = 'Fine Arts';

    return filtered;
  }

  return updated;
}

export default function Page() {
  const STORAGE_KEY = 'scheduler_state';
  const [wakeTime, setWakeTime] = useState<string>('');
  const [sleepTime, setSleepTime] = useState<string>('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setWakeTime(parsed.wakeTime);
      setSleepTime(parsed.sleepTime);

      const parsedBlocks: Block[] = parsed.blocks.map((b: any) => ({
        start: new Date(b.start),
        end: new Date(b.end),
        completed: b.completed ?? false,
        reward: b.reward ?? null,
        label: b.label ?? 'S&T'
      }));

      setBlocks(parsedBlocks);
      setInitialized(true);
    }
  }, []);

  // Save state
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ wakeTime, sleepTime, blocks })
    );
  }, [blocks, wakeTime, sleepTime, initialized]);

  // Reset at sleep
  useEffect(() => {
    if (!initialized || !sleepTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const [sh, sm] = sleepTime.split(':').map(Number);
      const sleep = new Date();
      sleep.setHours(sh, sm, 0, 0);
      if (now >= sleep) {
        localStorage.removeItem(STORAGE_KEY);
        setWakeTime('');
        setSleepTime('');
        setBlocks([]);
        setInitialized(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [sleepTime, initialized]);

  // Initialize blocks
  useEffect(() => {
    if (!wakeTime || !sleepTime || blocks.length > 0) return;

    const today = new Date();
    const [wh, wm] = wakeTime.split(':').map(Number);
    const [sh, sm] = sleepTime.split(':').map(Number);

    const wake = new Date(today);
    wake.setHours(wh, wm, 0, 0);

    const sleep = new Date(today);
    sleep.setHours(sh, sm, 0, 0);

    const tempBlocks: Block[] = [];
    let current = new Date(wake);
    while (current < sleep) {
      tempBlocks.push(createBlock(current, 30));
      current = new Date(current.getTime() + 30 * 60000);
    }

    const labeled = relabelBlocks(tempBlocks, sleepTime);
    setBlocks(labeled);
    setInitialized(true);
  }, [wakeTime, sleepTime]);

  const applyBreakToFuture = (updatedBlocks: Block[], startIndex: number, minutes: number): Block[] => {
    if (minutes === 0) return updatedBlocks;
    const adjusted = [...updatedBlocks];
    for (let i = startIndex; i < adjusted.length; i++) {
      adjusted[i].start = new Date(adjusted[i].start.getTime() + minutes * 60000);
      adjusted[i].end = new Date(adjusted[i].end.getTime() + minutes * 60000);
    }
    return relabelBlocks(adjusted, sleepTime);
  };

  const handleComplete = (index: number) => {
    const rewards: Reward[] = [
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

            const colorMap: Record<string, string> = {
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
