'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Categorized data
const data = [
    {
        category: '0-4hr',
        items: [
            { condition: 'JWU', action: 'Stand-up, Get Natural Light, Quick Water Only Wash for Face , Drink Water, Light Warmup + Belly Breathing, Tooth Brush, Do Cognitive Priming 15m default state, Probiotics, Eat, 15m Walk, Do Neck Curl 3 sets, Do Neck Tuck 3 sets, Shower, Cleanse Face, Apply Vitamin C Serum, Apply Moisturizer, Apply Sun Screen' },
            { condition: 'Feeling tired', action: 'Do soft shadow boxing' },
            { condition: 'Recommended sleep not yet complete', action: 'Relax entire face muscle including inside mouth, lowen shoulder, arms, and legs, diaphragmatic breath, and clear thinking' },
            { condition: 'Nothing important to do', action: 'S&T' },
        ],
    },
    {
        category: '4-8hr',
        items: [
            { condition: 'Nothing important to do and have not done any competition', action: 'Competition' },
            { condition: 'Nothing important to do and have done competition', action: 'Exercise' },
            { condition: 'Distracted', action: 'Do diaphragmatic breating with proper posture and no other else' },
            { condition: 'Not eaten for past 4hr', action: 'Eat Healthy Plate' },
            { condition: 'Physically Tired', action: '90m Nap' },
        ],
    },
    {
        category: '8-12hr',
        items: [
            { condition: 'Nothing important to do', action: 'S&T' },
            { condition: 'Distracted', action: 'Do diaphragmatic breating with proper posture and no other else' },
            { condition: 'Not eaten for past 4hr', action: 'Eat Healthy Plate' },
        ],
    },
    {
        category: '12-15hr',
        items: [
            { condition: 'Nothing important to do and have not yet do fine art for 3hr', action: 'Fine Arts' },
            { condition: 'Nothing important to do and done fine art for 3hr', action: 'S&T' },
            { condition: 'Distracted', action: 'Do diaphragmatic breating with proper posture and no other else' },
            { condition: 'Not eaten for past 2hr', action: 'Eat Healthy Plate' },
        ],
    },
    {
        category: '15-16hr',
        items: [
            { condition: 'Nothing important to do', action: 'Brush teeth, wash-face with cleanser, moisturizer, retinoid, dim light, lie down w/ diaphragmatic breath and reflect, sleep' },
        ],
    },
];

export default function Page() {
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [selectedItem, setSelectedItem] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const filteredItems = useMemo(() => {
        const items = data[selectedCategory].items;
        if (!search) return items;
        return items.filter((i) =>
                            i.condition.toLowerCase().includes(search.toLowerCase())
                           );
    }, [selectedCategory, search]);

    return (
        <div style={styles.container}>
        <h1 style={styles.title}>SYSTEM MAP</h1>
        <p style={styles.subtitle}>Condition → Action [n(1) efficiency]</p>

        {/* Category Tabs */}
        After Woke-Up
        <div style={styles.tabs}>
        {data.map((cat, i) => (
            <div
            key={i}
            onClick={() => {
                setSelectedCategory(i);
                setSelectedItem(null);
            }}
            style={{
                ...styles.tab,
                borderBottom: selectedCategory === i ? '1px solid #fff' : '1px solid transparent',
            }}
            >
            {cat.category}
            </div>
        ))}
        </div>

        {/* Search */}
        <input
        placeholder="Search condition..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
        />

        <div style={styles.layout}>
        {/* Condition List */}
        <div style={styles.sidebar}>
        {filteredItems.map((item, index) => (
            <motion.div
            key={index}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedItem(index)}
            style={{
                ...styles.conditionItem,
                background: selectedItem === index ? '#fff' : 'transparent',
                color: selectedItem === index ? '#000' : '#fff',
            }}
            title={item.condition}
            >
            {truncate(item.condition)}
            </motion.div>
        ))}
        </div>

        {/* Action Panel */}
        <div style={styles.main}>
        <AnimatePresence mode="wait">
        {selectedItem !== null && filteredItems[selectedItem] && (
            <motion.div
            key={selectedItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            style={styles.actionCard}
            >
            <h2 style={styles.conditionTitle}>
            {filteredItems[selectedItem].condition}
            </h2>
            <p style={styles.actionText}>
            {filteredItems[selectedItem].action}
            </p>
            </motion.div>
        )}
        </AnimatePresence>

        {selectedItem === null && (
            <div style={styles.placeholder}>Select a condition</div>
        )}
        </div>
        </div>
        </div>
    );
}

function truncate(text: string, max = 40) {
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        background: '#000',
        color: '#fff',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        padding: '16px',
    },
    title: {
        fontSize: '24px',
        letterSpacing: '2px',
    },
    subtitle: {
        fontSize: '11px',
        opacity: 0.6,
        marginBottom: '10px',
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        marginBottom: '10px',
    },
    tab: {
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: '12px',
        whiteSpace: 'nowrap',
    },
    search: {
        width: '100%',
        padding: '8px',
        marginBottom: '10px',
        background: '#000',
        color: '#fff',
        border: '1px solid #333',
        outline: 'none',
    },
    layout: {
        display: 'flex',
        gap: '10px',
    },
    sidebar: {
        width: '45%',
        borderRight: '1px solid #222',
        overflowY: 'auto',
        maxHeight: '75vh',
    },
    conditionItem: {
        padding: '10px',
        borderBottom: '1px solid #111',
        cursor: 'pointer',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    main: {
        width: '55%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionCard: {
        border: '1px solid #fff',
        padding: '16px',
        maxWidth: '320px',
    },
    conditionTitle: {
        fontSize: '16px',
        marginBottom: '8px',
    },
    actionText: {
        fontSize: '13px',
        opacity: 0.8,
    },
    placeholder: {
        opacity: 0.3,
        fontSize: '12px',
    },
};

