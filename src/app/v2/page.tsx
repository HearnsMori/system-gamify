'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'select' | 'focus' | 'reward' | 'break' | 'shop';

type Reward = {
  type: string;
  chance: number;
  minutes: number;
};

type Upgrades = {
  startLevel: number;
  coinBoost: number;
  levelBoost: number;
};

const STORAGE_KEY = 'focus_cycle_state_v4';

const BLOCKS = [
  'Wake-Up Routine',
  'Sleep Routine',
  'S&T',
  'Competition',
  'Fine Arts',
  'Exercise'
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function todayKey() {
  return new Date().toDateString();
}

export default function Page() {
  const [phase, setPhase] = useState<Phase>('select');
  const [prevPhase, setPrevPhase] = useState<Phase>('select');

  const [endTime, setEndTime] = useState<number | null>(null);

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [reward, setReward] = useState<Reward | null>(null);

  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [bestLevel, setBestLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState('');

  const [upgrades, setUpgrades] = useState<Upgrades>({
    startLevel: 1,
    coinBoost: 1,
    levelBoost: 1
  });

  const [initialized, setInitialized] = useState(false);
  const [locked, setLocked] = useState(false);

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      setPhase(p.phase);
      setPrevPhase(p.prevPhase || 'select');
      setEndTime(p.endTime || null);
      setSelectedBlock(p.selectedBlock);
      setReward(p.reward);
      setCoins(p.coins || 0);
      setLevel(p.level || 1);
      setBestLevel(p.bestLevel || 1);
      setStreak(p.streak || 0);
      setLastDate(p.lastDate || '');
      setUpgrades(p.upgrades || { startLevel: 1, coinBoost: 1, levelBoost: 1 });
      setLocked(p.locked || false);
    }
    setInitialized(true);
  }, []);

  // DAILY RESET
  useEffect(() => {
    if (!initialized) return;
    const today = todayKey();

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate === yesterday.toDateString()) {
        setStreak((s) => s + 1);
      } else {
        setStreak(1);
      }

      setLevel(upgrades.startLevel);
      setLastDate(today);
    }
  }, [initialized]);

  // SAVE
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        phase,
        prevPhase,
        endTime,
        selectedBlock,
        reward,
        coins,
        level,
        bestLevel,
        streak,
        lastDate,
        upgrades,
        locked
      })
    );
  }, [phase, prevPhase, endTime, selectedBlock, reward, coins, level, bestLevel, streak, lastDate, upgrades, locked, initialized]);

const [tick, setTick] = useState(0);

useEffect(() => {
  if (!initialized || !endTime) return;

  const interval = setInterval(() => {
    const remaining = endTime - Date.now();

    setTick((t) => t + 1); // ✅ force re-render

    if (remaining <= 0) {
      handlePhaseEnd();
    }
  }, 1000);

  return () => clearInterval(interval);
}, [endTime, phase, initialized]);

  const getTimeLeft = () => {
    if (!endTime) return 0;
    return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  };

  const generateReward = (): Reward => {
    const rewards: Reward[] = [
      { type: 'No Break', chance: 0.3, minutes: 0 },
      { type: '5 min Break', chance: 0.4, minutes: 5 },
      { type: '15 min Break', chance: 0.2, minutes: 15 },
      { type: '1 hr Break', chance: 0.1, minutes: 60 }
    ];

    const rand = Math.random();
    let cumulative = 0;

    for (let r of rewards) {
      cumulative += r.chance;
      if (rand <= cumulative) return r;
    }

    return rewards[0];
  };

  const giveRewards = () => {
    const coinsGain = (Math.floor(Math.random() * 10) + 5) * upgrades.coinBoost;
    const levelGain = (Math.floor(Math.random() * 3) + 1) * upgrades.levelBoost;

    setCoins((c) => c + coinsGain);
    setLevel((l) => {
      const newLevel = l + levelGain;
      if (newLevel > bestLevel) setBestLevel(newLevel);
      return newLevel;
    });
  };

  const handlePhaseEnd = () => {
    if (phase === 'focus') {
      giveRewards();
      const r = generateReward();
      setReward(r);
      setPhase('reward');
    } else if (phase === 'break') {
      resetCycle();
    }
  };

  const startFocus = () => {
    if (!selectedBlock) return;

    setLocked(true);
    setPhase('focus');

    const duration = 30 * 60 * 1000;
    setEndTime(Date.now() + duration);
  };

  const startBreak = () => {
    if (!reward) return;
    if (reward.minutes === 0) return resetCycle();

    setPhase('break');

    const duration = reward.minutes * 60 * 1000;
    setEndTime(Date.now() + duration);
  };

  const resetCycle = () => {
    setPhase('select');
    setSelectedBlock(null);
    setReward(null);
    setLocked(false);

    // ✅ 15 minutes preparation time
    const duration = 15 * 60 * 1000;
    setEndTime(Date.now() + duration);
  };

  const buyUpgrade = (type: keyof Upgrades) => {
    const cost = 50 * upgrades[type];
    if (coins < cost) {
      alert("Not Enough Coins");
      return;
    }

    setCoins((c) => c - cost);
    setUpgrades((u) => ({ ...u, [type]: u[type] + 1 }));
  };

  const openShop = () => {
    setPrevPhase(phase);
    setPhase('shop');
  };

  const closeShop = () => {
    setPhase(prevPhase);
  };

  const btnStyle = {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontWeight: 'bold',
    margin: '5px 0',
    width: '100%'
  } as const;


  const timeLeft = endTime
  ? Math.max(0, Math.floor((endTime - Date.now()) / 1000))
  : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#4facfe,#00f2fe)', color: '#fff', fontFamily: 'sans-serif', padding: 20 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, fontSize: 14 }}>
        <div>🔥 {streak}</div>
        <div>💰 {coins}</div>
        <div>⭐ {level} | Best {bestLevel}</div>
      </div>

      <button onClick={openShop} style={{ ...btnStyle, background: '#fff', color: '#000' }}>Shop</button>

      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>

          {phase === 'select' && (
            <>
              <h2 style={{ marginBottom: 10 }}>Choose Focus</h2>

              {BLOCKS.map((b) => (
                <button
                  key={b}
                  disabled={locked}
                  onClick={() => !locked && setSelectedBlock(b)}
                  style={{
                    ...btnStyle,
                    opacity: locked ? 0.5 : 1,
                    border: selectedBlock === b ? '2px solid #fff' : 'none'
                  }}
                >
                  {b}
                </button>
              ))}

              <button onClick={startFocus} style={{ ...btnStyle, background: '#fff', color: '#000' }}>
                Continue
              </button>

              <div style={{ marginTop: 10 }}>{formatTime(timeLeft)}</div>
            </>
          )}

          {phase === 'focus' && (
            <>
              <h2>{selectedBlock}</h2>
              <div style={{ fontSize: 40 }}>{formatTime(timeLeft)}</div>
            </>
          )}

          {phase === 'reward' && reward && (
            <>
              <h2>{reward.type}</h2>
              <button onClick={startBreak} style={{ ...btnStyle, background: '#fff', color: '#000' }}>
                Continue
              </button>
            </>
          )}

          {phase === 'break' && (
            <>
              <h2>Break</h2>
              <div style={{ fontSize: 40 }}>{formatTime(timeLeft)}</div>
            </>
          )}

          {phase === 'shop' && (
            <>
              <h2>Shop</h2>

              <div style={{ marginBottom: 10 }}>
                Start Level Lv{upgrades.startLevel} (Cost {50 * upgrades.startLevel})
                <button onClick={() => buyUpgrade('startLevel')} style={btnStyle}>Buy</button>
              </div>

              <div style={{ marginBottom: 10 }}>
                Coin Boost x{upgrades.coinBoost} (Cost {50 * upgrades.coinBoost})
                <button onClick={() => buyUpgrade('coinBoost')} style={btnStyle}>Buy</button>
              </div>

              <div style={{ marginBottom: 10 }}>
                Level Boost x{upgrades.levelBoost} (Cost {50 * upgrades.levelBoost})
                <button onClick={() => buyUpgrade('levelBoost')} style={btnStyle}>Buy</button>
              </div>

              <button onClick={closeShop} style={{ ...btnStyle, background: '#fff', color: '#000' }}>
                Back
              </button>
            </>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
