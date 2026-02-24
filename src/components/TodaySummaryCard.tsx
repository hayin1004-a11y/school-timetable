import { dayName } from '../utils/dates';
import type { PeriodTime } from '../models/types';
import { getCurrentPeriodIndex, getNextPeriodIndex, formatTime } from '../utils/dates';

interface Props {
  childName: string;
  childColorHex: string;
  totalPeriods: number;
  suppliesCount: number;
  dayIndex: number;
  periodTimes: PeriodTime[];
  isToday: boolean;
}

export function TodaySummaryCard({ childName, childColorHex, totalPeriods, suppliesCount, dayIndex, periodTimes, isToday }: Props) {
  const currentPeriod = isToday ? getCurrentPeriodIndex(periodTimes) : null;
  const nextPeriod = isToday ? getNextPeriodIndex(periodTimes) : null;

  // 오늘 시간 범위 표시
  const firstTime = periodTimes[0];
  const lastTime = totalPeriods > 0 ? periodTimes[Math.min(totalPeriods - 1, periodTimes.length - 1)] : null;

  return (
    <div style={{
      padding: 16,
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: '#1A1A2E' }}>
          {dayName(dayIndex)}요일
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: childColorHex }}>
          {childName}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, color: '#6B7280' }}>
          🕐 {totalPeriods}개 일정
        </span>
        {firstTime && lastTime && (
          <span style={{ fontSize: 14, color: '#6B7280' }}>
            ⏰ {formatTime(firstTime.startHour, firstTime.startMinute)} ~ {formatTime(lastTime.endHour, lastTime.endMinute)}
          </span>
        )}
        {suppliesCount > 0 && (
          <span style={{ fontSize: 14, color: '#FF9500' }}>
            🎒 준비물 {suppliesCount}
          </span>
        )}
      </div>

      {isToday && currentPeriod && currentPeriod <= totalPeriods && periodTimes[currentPeriod - 1] && (
        <div style={{
          marginTop: 10, padding: '8px 12px', background: '#EFF6FF',
          borderRadius: 8, fontSize: 14, color: '#4A90D9', fontWeight: 500,
        }}>
          ▶ 지금 {periodTimes[currentPeriod - 1].label} 수업 중
          <span style={{ fontWeight: 400, marginLeft: 8 }}>
            ({formatTime(periodTimes[currentPeriod - 1].startHour, periodTimes[currentPeriod - 1].startMinute)} ~ {formatTime(periodTimes[currentPeriod - 1].endHour, periodTimes[currentPeriod - 1].endMinute)})
          </span>
        </div>
      )}

      {isToday && !currentPeriod && nextPeriod && nextPeriod <= totalPeriods && periodTimes[nextPeriod - 1] && (
        <div style={{
          marginTop: 10, padding: '8px 12px', background: '#FFF8F0',
          borderRadius: 8, fontSize: 14, color: '#FF9500', fontWeight: 500,
        }}>
          ⏳ 다음 {periodTimes[nextPeriod - 1].label}
          <span style={{ fontWeight: 400, marginLeft: 8 }}>
            ({formatTime(periodTimes[nextPeriod - 1].startHour, periodTimes[nextPeriod - 1].startMinute)} 시작)
          </span>
        </div>
      )}
    </div>
  );
}
