import { dayName, ALL_DAYS, getTodayDayIndex } from '../utils/dates';

interface Props {
  selectedDay: number;
  onSelect: (day: number) => void;
  accentColor: string;
}

export function DayBar({ selectedDay, onSelect, accentColor }: Props) {
  const today = getTodayDayIndex();

  return (
    <div style={{
      display: 'flex',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      {ALL_DAYS.map(day => {
        const active = day === selectedDay;
        const isToday = day === today;
        const isWeekend = day >= 6;
        const weekendColor = day === 6 ? '#4A90D9' : '#FF3B30'; // 토=파란, 일=빨간

        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: active ? accentColor + '15' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              position: 'relative',
            }}
          >
            <span style={{
              fontSize: 13,
              fontWeight: active ? 700 : 400,
              color: active ? accentColor : isWeekend ? weekendColor : '#6B7280',
            }}>
              {dayName(day)}
            </span>
            {isToday && (
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: active ? accentColor : '#9CA3AF',
              }} />
            )}
            {!isToday && (
              <span style={{ width: 4, height: 4 }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
