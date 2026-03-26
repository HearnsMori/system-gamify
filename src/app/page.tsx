'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Task = {
  id: number;
  name: string;
  steps: string[];
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
    name: "90m Block: Science",
    steps: [
        'Write Things You Gonna Do for 90m',
        'Do It',
    ]
  },
  {
    id: 3,
    name: "90m Block: Technology",
    steps: [
        'Write Things You Gonna Do for 90m',
        'Do It',
    ]
  },
  {
    id: 4,
    name: "90m Block: Competition",
    steps: [
        'Write Things You Gonna Do for 90m',
        'Do It',
    ]
  },
  {
    id: 5,
    name: "90m Block: Exercise",
    steps: [
        'Write Things You Gonna Do for 90m',
        'Do It',
    ]
  },
  {
    id: 6,
    name: "90m Block: Fine Arts",
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
  const [rewardAlr, setRewardAlr] = useState<string | null>(null);

  const handleStep = () => {
    if (!selectedTask) return;

    if (currentStep < selectedTask.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const spinWheel = () => {
    setSpinning(true);
    setReward(null);
    setRewardAlr(null);
    const isHigh = Math.random() < 0.73;
    const result = isHigh ? 'HIGH REWARD ✨' : 'LOW REWARD';
    setRewardAlr(result);
    const stored = JSON.parse(localStorage.getItem('rewards') || '[]');
    stored.push({ task: selectedTask?.name, reward: result, date: Date.now() });
    localStorage.setItem('rewards', JSON.stringify(stored));
    setTimeout(() => {
      setReward(result);
    }, 3000);
    setTimeout(() => {
      setSpinning(false);
    }, 7000);
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
      <h1 style={{ textAlign: 'center', letterSpacing: '2px' }}>
        
      </h1>

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

          <motion.div
            animate={{ rotate: spinning ? (rewardAlr === 'HIGH REWARD ✨' ? 450+360*3 : 270+360*3) : 0}}
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

          {!spinning && !reward && (
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
                    reward === 'HIGH REWARD ✨' ? '#00ffcc' : '#ff7675',
                  textShadow:
                    reward === 'HIGH REWARD ✨'
                      ? '0 0 20px #00ffcc'
                      : 'none',
                }}
              >
                {reward}
              </motion.div>
            )}
          </AnimatePresence>
            { reward === 'HIGH REWARD ✨' ? (
                <li>
                    <ul>Do Anything You Want for 30m</ul>
                    <ul></ul>
                    <ul></ul>
                </li>
            ) : (
                <></>
            )}

            { reward === 'LOW REWARD' ? (
                <li>
                    <ul>Do Not Do Anything for 30m</ul>
                    <ul>No Internet</ul>
                    <ul>No Music</ul>
                    <ul>No Sleeping</ul>
                </li>
            ) : (
                <></>
            )}

          <button
            onClick={() => {
              setSelectedTask(null);
              setReward(null);
              setCompleted(false);
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

