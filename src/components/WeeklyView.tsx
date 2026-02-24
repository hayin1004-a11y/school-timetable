import { dayName, ALL_DAYS, getTodayDayIndex } from '../utils/dates';
import type { EffectiveEntry, PeriodTime } from '../models/types';

interface Props {
  childId: string;
  accentColor: string;
  periodTimes: PeriodTime[];
  getEntries: (childId: string, dayOfWeek: number) => EffectiveEntry[];
  onDayTap: (day: number) => void;
}

export function WeeklyView({ childId, accentColor, periodTimes, getEntries, onDayTap }: Props) {
  const today = getTodayDayIndex();

  // 모든 요일별 entries
  const weekData = ALL_DAYS.map(day => ({
    day,
    entries: getEntries(childId, day),
  }));

  // 가장 많은 교시 수
  const maxPeriods = Math.max(...weekData.map(d => d.entries.length), 1);

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      {/* 헤더 - 요일 */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E5E7EB' }}>
        {/* 교시 열 */}
        <div style={{
          width: 52, flexShrink: 0,
          padding: '8px 4px', textAlign: 'center',
          fontSize: 11, color: '#9CA3AF', fontWeight: 600,
        }}>
          교시
        </div>
        {ALL_DAYS.map(day => {
          const isToday = day === today;
          const isWeekend = day >= 6;
          const weekendColor = day === 6 ? '#4A90D9' : '#FF3B30';
          return (
            <div
              key={day}
              onClick={() => onDayTap(day)}
              style={{
                flex: 1, padding: '8px 2px', textAlign: 'center',
                fontSize: 13, fontWeight: isToday ? 700 : 500,
                color: isToday ? accentColor : isWeekend ? weekendColor : '#374151',
                cursor: 'pointer',
                background: isToday ? accentColor + '10' : 'transparent',
                borderBottom: isToday ? `2px solid ${accentColor}` : '2px solid transparent',
                marginBottom: -2,
              }}
            >
              {dayName(day)}
              {isToday && <span style={{ fontSize: 9, display: 'block', color: accentColor }}>오늘</span>}
            </div>
          );
        })}
      </div>

      {/* 시간표 그리드 */}
      {Array.from({ length: maxPeriods }, (_, pIdx) => {
        const pt = periodTimes[pIdx];
        return (
          <div key={pIdx} style={{
            display: 'flex',
            borderBottom: pIdx < maxPeriods - 1 ? '1px solid #F3F4F6' : 'none',
            minHeight: 44,
          }}>
            {/* 교시 레이블 */}
            <div style={{
              width: 52, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '4px 2px',
              borderRight: '1px solid #F3F4F6',
              background: '#FAFBFC',
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280' }}>
                {pt?.label ?? `${pIdx + 1}`}
              </span>
              {pt && (
                <span style={{ fontSize: 9, color: '#C0C4CC', marginTop: 1 }}>
                  {`${pt.startHour}:${pt.startMinute.toString().padStart(2, '0')}`}
                </span>
              )}
            </div>

            {/* 각 요일 셀 */}
            {ALL_DAYS.map(day => {
              const wd = weekData.find(w => w.day === day);
              const entry = wd?.entries.find(e => e.period === pIdx + 1);
              const isToday = day === today;

              return (
                <div
                  key={day}
                  onClick={() => onDayTap(day)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 2px',
                    cursor: 'pointer',
                    background: isToday ? accentColor + '06' : 'transparent',
                    borderRight: '1px solid #F9FAFB',
                    transition: 'background 0.15s',
                    minHeight: 38,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F3F4F6'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isToday ? accentColor + '06' : 'transparent'; }}
                >
                  {entry ? (
                    <div style={{ textAlign: 'center', width: '100%', overflow: 'hidden' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 500, color: '#1A1A2E',
                        display: 'block',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        padding: '0 2px',
                      }}>
                        {entry.subjectName}
                      </span>
                      {entry.isOverridden && (
                        <span style={{
                          fontSize: 9, color: '#FF9500', background: '#FFF8F0',
                          padding: '0 3px', borderRadius: 3,
                        }}>변경</span>
                      )}
                      {entry.supplies && (
                        <span style={{ fontSize: 9, color: '#FF9500', display: 'block' }}>🎒</span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: '#E5E7EB' }}>-</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* 비어있을 때 */}
      {maxPeriods === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
          시간표를 등록해주세요
        </div>
      )}
    </div>
  );
}
