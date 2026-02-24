import { useState } from 'react';
import type { DecodedShareData } from '../utils/sharing';
import type { EffectiveEntry } from '../models/types';
import { dayName, ALL_DAYS, getTodayDayIndex, formatTime } from '../utils/dates';
import { childColor, COLORS } from '../utils/colors';

interface Props {
  data: DecodedShareData;
}

export function SharedView({ data }: Props) {
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);
  const [selectedDay, setSelectedDay] = useState(getTodayDayIndex);

  const child = data.children[selectedChildIdx];
  const color = child ? childColor(child.colorIndex) : childColor(0);

  const getEntries = (childIdx: number, day: number): EffectiveEntry[] => {
    return data.entries
      .filter(e => e.childIndex === childIdx && e.dayOfWeek === day)
      .sort((a, b) => a.period - b.period)
      .map(e => {
        const pt = data.periodTimes[e.period - 1];
        return {
          period: e.period,
          periodLabel: pt?.label ?? `${e.period}교시`,
          subjectName: e.subjectName,
          supplies: e.supplies,
          isOverridden: false,
          baseEntryId: '',
          startTime: pt ? formatTime(pt.startHour, pt.startMinute) : undefined,
          endTime: pt ? formatTime(pt.endHour, pt.endMinute) : undefined,
        };
      });
  };

  const entries = getEntries(selectedChildIdx, selectedDay);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: 20, marginRight: 8 }}>🔗</div>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 600, color: COLORS.textPrimary, margin: 0 }}>
          {child?.name ?? '시간표'} (공유)
        </h1>
      </div>

      {/* 공유 배너 */}
      <div style={{ background: '#EEF2FF', padding: '10px 16px', fontSize: 13, color: '#4338CA', textAlign: 'center' }}>
        📋 읽기 전용으로 공유된 시간표입니다
      </div>

      {/* 아이 탭 */}
      {data.children.length > 1 && (
        <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
          {data.children.map((c, i) => {
            const cc = childColor(c.colorIndex);
            return (
              <button key={i} onClick={() => setSelectedChildIdx(i)}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                  background: i === selectedChildIdx ? cc.light : 'transparent',
                  color: i === selectedChildIdx ? cc.hex : '#6B7280',
                  fontWeight: i === selectedChildIdx ? 600 : 400, fontSize: 14,
                  borderBottom: i === selectedChildIdx ? `2px solid ${cc.hex}` : '2px solid transparent',
                }}>
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 요일 바 */}
        <div style={{ display: 'flex', gap: 4 }}>
          {ALL_DAYS.map(d => {
            const isSelected = d === selectedDay;
            const isToday = d === getTodayDayIndex();
            const isWeekend = d >= 6;
            let textColor = '#374151';
            if (isWeekend) textColor = d === 6 ? '#4A90D9' : '#FF3B30';
            if (isSelected) textColor = '#fff';

            return (
              <button key={d} onClick={() => setSelectedDay(d)}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
                  background: isSelected ? color.hex : 'transparent',
                  color: textColor, fontWeight: isSelected || isToday ? 700 : 400, fontSize: 14,
                  position: 'relative',
                }}>
                {dayName(d)}
                {isToday && !isSelected && (
                  <div style={{
                    position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%', background: color.hex,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* 요약 */}
        {child && (
          <div style={{
            background: '#fff', borderRadius: 12, padding: 16,
            borderLeft: `4px solid ${color.hex}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.textPrimary }}>
              {child.name} · {child.schoolName} {child.grade}학년
            </div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
              {dayName(selectedDay)}요일 · {entries.length}개 일정
              {entries.length > 0 && entries[0].startTime && entries[entries.length - 1].endTime && (
                <span> · {entries[0].startTime} ~ {entries[entries.length - 1].endTime}</span>
              )}
            </div>
          </div>
        )}

        {/* 시간표 */}
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 600, color: COLORS.textPrimary }}>등록된 시간표가 없어요</p>
            <p style={{ fontSize: 14, color: COLORS.textSecondary }}>{dayName(selectedDay)}요일 일정이 비어있습니다</p>
          </div>
        ) : (
          <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
            {entries.map(entry => (
              <div key={entry.period} style={{
                display: 'flex', alignItems: 'center', background: '#fff',
                borderBottom: '1px solid #F3F4F6', padding: '12px 16px', gap: 12,
              }}>
                <div style={{
                  minWidth: 56, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: color.hex }}>{entry.periodLabel}</div>
                  {entry.startTime && entry.endTime && (
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
                      {entry.startTime}~{entry.endTime}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: COLORS.textPrimary }}>
                  {entry.subjectName}
                </div>
                {entry.supplies && (
                  <div style={{ fontSize: 12, color: '#FF9500' }} title={entry.supplies}>🎒</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 준비물 */}
        {entries.some(e => e.supplies) && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>준비물</h3>
            {entries.filter(e => e.supplies).map(e => (
              <div key={e.period} style={{ display: 'flex', gap: 12, padding: 12, background: '#FFF8F0', borderRadius: 8, marginBottom: 8 }}>
                <span style={{ color: '#FF9500' }}>🎒</span>
                <div>
                  <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{e.subjectName}</span>
                  <p style={{ margin: '2px 0 0', fontSize: 15 }}>{e.supplies}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 주간 전체보기 */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>주간 전체보기</h3>
          <div style={{ overflowX: 'auto', borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 4px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: 11, color: '#6B7280', width: 50 }}>교시</th>
                  {ALL_DAYS.map(d => (
                    <th key={d} style={{
                      padding: '8px 4px', borderBottom: '1px solid #E5E7EB', fontSize: 11, fontWeight: 600,
                      background: d === getTodayDayIndex() ? color.light : '#F9FAFB',
                      color: d >= 7 ? '#FF3B30' : d >= 6 ? '#4A90D9' : '#374151',
                    }}>
                      {dayName(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.periodTimes.map((pt, pIdx) => (
                  <tr key={pIdx}>
                    <td style={{ padding: '6px 4px', borderBottom: '1px solid #F3F4F6', textAlign: 'center', color: '#6B7280', fontSize: 10 }}>
                      {pt.label}
                    </td>
                    {ALL_DAYS.map(d => {
                      const dayEntries = getEntries(selectedChildIdx, d);
                      const entry = dayEntries.find(e => e.period === pIdx + 1);
                      return (
                        <td key={d} style={{
                          padding: '6px 4px', borderBottom: '1px solid #F3F4F6', textAlign: 'center',
                          background: d === getTodayDayIndex() ? color.light : 'transparent',
                          fontSize: 11, color: entry ? COLORS.textPrimary : '#D1D5DB',
                        }}>
                          {entry?.subjectName ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
