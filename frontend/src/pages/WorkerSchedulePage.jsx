import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function toMonthLabel(date) {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildMonthDays(anchor) {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay(); // 0-6
    const days = [];

    // Pad leading empty cells
    for (let i = 0; i < startWeekday; i += 1) {
        days.push(null);
    }

    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d += 1) {
        days.push(new Date(year, month, d));
    }

    return days;
}

export default function WorkerSchedulePage() {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState(() => new Date());

    const goMonth = (delta) => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const days = buildMonthDays(currentMonth);

    const isSameDay = (a, b) => (
        a && b && a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate()
    );

    return (
        <div className="fade-in">
            <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                    color: '#0891b2', fontWeight: 600, fontSize: 13,
                    textDecoration: 'none', display: 'inline-block', marginBottom: 16,
                }}
            >
                ← Back to Dashboard
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>My Schedule</h1>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                        Manage your monthly availability. Free, unavailable and booked slots will sync with what customers see when booking you.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        type="button"
                        onClick={() => goMonth(-1)}
                        className="btn-secondary"
                        style={{ paddingInline: 10, minWidth: 0 }}
                    >
                        ‹
                    </button>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', minWidth: 140, textAlign: 'center' }}>
                        {toMonthLabel(currentMonth)}
                    </div>
                    <button
                        type="button"
                        onClick={() => goMonth(1)}
                        className="btn-secondary"
                        style={{ paddingInline: 10, minWidth: 0 }}
                    >
                        ›
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1.1fr) minmax(260px, 1fr)', gap: 20, alignItems: 'flex-start' }}>
                {/* Month calendar */}
                <div className="hm-card" style={{ padding: 18 }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(7,1fr)',
                        gap: 6, marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
                    }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} style={{ textAlign: 'center' }}>{d}</div>
                        ))}
                    </div>
                    <div
                        style={{
                            display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6,
                        }}
                    >
                        {days.map((d, idx) => {
                            if (!d) {
                                return <div key={`empty-${idx}`} />;
                            }
                            const isSelected = isSameDay(d, selectedDate);
                            const isToday = isSameDay(d, new Date());

                            return (
                                <button
                                    key={d.toISOString()}
                                    type="button"
                                    onClick={() => setSelectedDate(d)}
                                    style={{
                                        padding: '8px 0',
                                        borderRadius: 10,
                                        border: '1px solid',
                                        borderColor: isSelected ? '#0ea5e9' : '#e2e8f0',
                                        background: isSelected ? '#e0f2fe' : '#f8fafc',
                                        color: '#0f172a',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                >
                                    {d.getDate()}
                                    {isToday && (
                                        <span style={{
                                            position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                                            width: 4, height: 4, borderRadius: '50%', background: '#0ea5e9',
                                        }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
                        Monthly colors and per-day slot counts will appear here in the next phases.
                    </div>
                </div>

                {/* Selected day slots shell */}
                <div className="hm-card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Selected Day
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            Legend and live slot states (Free / Unavailable / Booked) will be wired up in later phases.
                        </div>
                    </div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8,
                    }}>
                        {Array.from({ length: 12 }, (_, idx) => {
                            const hour = 8 + idx;
                            const label = new Date(0, 0, 0, hour).toLocaleTimeString('en-US', {
                                hour: 'numeric', minute: '2-digit', hour12: true,
                            });
                            return (
                                <button
                                    key={hour}
                                    type="button"
                                    disabled
                                    style={{
                                        borderRadius: 10,
                                        border: '1px dashed #e2e8f0',
                                        background: '#f8fafc',
                                        color: '#94a3b8',
                                        fontSize: 12,
                                        padding: '8px 10px',
                                        cursor: 'not-allowed',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{ fontWeight: 700 }}>{label}</div>
                                    <div style={{ fontSize: 11 }}>Slot controls coming in next phases</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
