'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Task = {
  id: number;
  name: string;
  steps: string[];
  duration?: 90 | 60 | 30;
};

const tasks: Task[] = [
  {
    id: 1,
    name: 'Wake Up Routine',
    steps: [
        'Stand-up',
        'Get Natural Light',
        'Quick Water Only Wash for Face', 
        'Drink Water',
        'Light Warmup + Belly Breathing',
        'Tooth Brush',
        'Do Cognitive Priming 15m default state',
        'Probiotics',
        'Eat',
        '15m Walk',
        'Do Neck Curl 3 sets',
        'Do Neck Tuck 3 sets',
        'Shower',
        'Cleanse Face',
        'Apply Vitamin C Serum',
        'Apply Moisturizer',
        'Apply Sun Screen',
        'Write 1 Task for Each: 90m Block, 60m Block, and 30m Block in Paper',
        'Do 10m Environment Design',
    ],
  },
  //Fine Arts, Exercise, Technology, Competition, Science
  {
    id: 2,
    name: "Block: Science",
    steps: [
        'Write Things You Gonna Do for 90m',
        'Do It',
    ]
  },
  {
    id: 3,
    name: "Block: Technology",
    steps: [
        'Write Things You Gonna Do for 90m',
        'Do It',
    ]
  },
  {
    id: 4,
    name: "Block: Competition",
    steps: [
        'Write Things You Gonna Do for 90m',
        'Do It',
    ]
  },
  {
    id: 5,
    name: "Block: Exercise",
    steps: [
        'Write Things You Gonna Do for 90m',
        'Do It',
    ]
  },
  {
    id: 6,
    name: "Block: Fine Arts",
    steps: [
        'Write Things You Gonna Do for 90m',
        'Do It',
    ]
  },
  {
    id: 7,
    name: 'Sleep Routine',
    steps: [
        'Sip water',
        'Light dinner',
        'Sip water',
        '15m Walk',
        'Cleanse Face',
        'Moisturizer',
        'Retinoid',
        'Dim Light',
        '10m Self and System Reflection',
        'Plan 3 most important block tomorrow and say each to someone who can be accountable for it',
        'Lie down with legs 45deg raised',
        'Deep diaphragmatic breathing',
        'Sleep',
    ],
  },
];


export default function Page() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState<string | null>(null);
  const [freetime, setFreetime] = useState<number>(0);
  const [spinsLeft, setSpinsLeft] = useState(0);
  const [allRewards, setAllRewards] = useState<string[]>([]);


  const handleStep = () => {
    if (!selectedTask) return;
    setFreetime(0);
    if (currentStep < selectedTask.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);

      const p = prompt("Duration in m:", "0");
      let duration;
      if(p) {
          duration = parseInt(p, 10);
      }

      if (duration >= 90) {
          setSpinsLeft(3);
      }
      else if (duration >= 60) {
          setSpinsLeft(2);
      }
      else if (duration >= 30) {
          setSpinsLeft(1);
      }
      else window.location.reload();
    }
  };
useEffect(() => {
    if (spinsLeft == 0) {
      if (freetime >= 0) {
        setReward(`${freetime}m Healthy Break`);
      } else {
        setReward(`${freetime}m No Move`);
      }
    }
}, [freetime, spinsLeft]);


  const spinWheel = async () => {
    if (spinsLeft <= 0) return;

    setSpinning(true);
    setReward(null);

    const isHigh = Math.random() < 0.73;
    const result = isHigh ? 'HIGH REWARD ✨' : 'LOW REWARD';

    const stored = JSON.parse(localStorage.getItem('rewards') || '[]');
    stored.push({
      task: selectedTask?.name,
      reward: result,
      date: Date.now(),
    });
    localStorage.setItem('rewards', JSON.stringify(stored));
      if(isHigh) {
          setFreetime(prev=>prev+10);
      } else {
          setFreetime(prev=>prev-10);
      }
    setTimeout(() => {
      if(result === 'HIGH REWARD ✨') {
          setAllRewards((prev) => [...prev, result+": +10m"]);
      } else {
          setAllRewards((prev) => [...prev, result+": -10m"]);
      }
      setSpinsLeft((prev) => prev - 1);
    }, 3000);

    setTimeout(() => {
      setSpinning(false);
    }, 3000);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexFlow: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f, #1a1a2e)',
        color: '#fff',
        padding: '20px',
        fontFamily: 'sans-serif',
      }}
    >
      {!selectedTask && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedTask(task);
                setCurrentStep(0);
                setCompleted(false);
                setAllRewards([]);
                setSpinsLeft(0);
              }}
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              {task.name}
            </motion.div>
          ))}
        </div>
      )}

      {selectedTask && !completed && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h2>{selectedTask.name}</h2>
          <p>{selectedTask.steps[currentStep]}</p>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleStep}
            style={{
              marginTop: '20px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              background: '#6c5ce7',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Complete Step
          </motion.button>
        </div>
      )}

      {completed && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <h2>Task Completed</h2>

          <p>Spins Left: {spinsLeft}</p>

          <motion.div
            animate={{
              rotate: spinning
                ? reward === 'HIGH REWARD ✨'
                  ? 450 + 360 * 3
                  : 270 + 360 * 3
                : 0,
            }}
            transition={{ duration: 3, ease: 'easeIn' }}
            style={{
              margin: '30px auto',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background:
                'conic-gradient(#00ffcc 0% 50%, #ff7675 50% 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0,255,200,0.2)',
            }}
          >
            <span>SPIN</span>
          </motion.div>

          <div>^</div>

          {!spinning && spinsLeft > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={spinWheel}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: '#00cec9',
                color: '#000',
                cursor: 'pointer',
              }}
            >
              Spin Reward
            </motion.button>
          )}

          <AnimatePresence>
            {reward && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: '20px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color:
                    reward === 'HIGH REWARD ✨'
                      ? '#00ffcc'
                      : '#ff7675',
                }}
              >
                {reward}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ALL REWARDS */}
          <div style={{ marginTop: '20px' }}>
            {allRewards.map((r, i) => (
              <div key={i}>{r}</div>
            ))}
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setReward(null);
              setCompleted(false);
              setAllRewards([]);
              setSpinsLeft(0);
            }}
            style={{
              marginTop: '20px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #fff',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
