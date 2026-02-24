import type { EffectiveEntry } from '../models/types';
import { WeeklyChangeBadge } from './WeeklyChangeBadge';

interface Props {
  entry: EffectiveEntry;
  isCurrentPeriod?: boolean;
  onTap: () => void;
  onSuppliesTap: () => void;
  onPeriodLabelTap: () => void;
}

export function PeriodCell({ entry, isCurrentPeriod, onTap, onSuppliesTap, onPeriodLabelTap }: Props) {
  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: isCurrentPeriod ? '#EFF6FF' : '#fff',
        cursor: 'pointer',
        borderBottom: '1px solid #F3F4F6',
        borderLeft: isCurrentPeriod ? '3px solid #4A90D9' : '3px solid transparent',
        transition: 'background 0.2s',
      }}
    >
      {/* 교시명 + 시간 (클릭 시 교시 편집) */}
      <div
        onClick={(e) => { e.stopPropagation(); onPeriodLabelTap(); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          minWidth: 56,
          cursor: 'pointer',
          padding: '2px',
          borderRadius: 8,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F3F4F6'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
        title="교시 편집"
      >
        <span style={{
          padding: '4px 8px',
          borderRadius: 6,
          background: isCurrentPeriod ? '#4A90D9' : '#FAFBFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: isCurrentPeriod ? '#fff' : '#6B7280',
          whiteSpace: 'nowrap',
        }}>
          {entry.periodLabel}
        </span>
        {entry.startTime && (
          <span style={{
            fontSize: 10,
            color: isCurrentPeriod ? '#4A90D9' : '#9CA3AF',
            marginTop: 2,
            whiteSpace: 'nowrap',
          }}>
            {entry.startTime}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#1A1A2E' }}>
            {entry.subjectName}
          </span>
          {entry.isOverridden && <WeeklyChangeBadge />}
        </div>
        {/* 시간 범위 */}
        {entry.startTime && entry.endTime && (
          <span style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1, display: 'block' }}>
            {entry.startTime} ~ {entry.endTime}
          </span>
        )}
        {entry.supplies && (
          <div
            onClick={(e) => { e.stopPropagation(); onSuppliesTap(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 10, color: '#FF9500' }}>🎒</span>
            <span style={{ fontSize: 13, color: '#FF9500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.supplies}
            </span>
          </div>
        )}
      </div>

      <span style={{ fontSize: 12, color: '#D1D5DB' }}>›</span>
    </div>
  );
}
