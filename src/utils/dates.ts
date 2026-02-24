export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // offset to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export function getDayOfWeekIndex(date: Date = new Date()): number {
  const day = date.getDay(); // 0=Sun ... 6=Sat
  // Convert: Sun=7, Mon=1, Tue=2, ..., Sat=6
  return day === 0 ? 7 : day;
}

export function isWeekend(date: Date = new Date()): boolean {
  return getDayOfWeekIndex(date) > 5;
}

export function dayName(index: number): string {
  const names: Record<number, string> = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토', 7: '일' };
  return names[index] || '';
}

export const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7]; // 월~일

export function getTodayDayIndex(): number {
  return getDayOfWeekIndex(); // 1=월 ... 7=일
}

// --- Period Times ---
import type { PeriodTime } from '../models/types';

/** 초등학교 표준 시간표 (40분 수업, 10분 쉬는시간, 점심 12:10~13:00) */
export const DEFAULT_PERIOD_TIMES: PeriodTime[] = [
  { label: '1교시', startHour: 9,  startMinute: 0,  endHour: 9,  endMinute: 40 },
  { label: '2교시', startHour: 9,  startMinute: 50, endHour: 10, endMinute: 30 },
  { label: '3교시', startHour: 10, startMinute: 40, endHour: 11, endMinute: 20 },
  { label: '4교시', startHour: 11, startMinute: 30, endHour: 12, endMinute: 10 },
  { label: '5교시', startHour: 13, startMinute: 0,  endHour: 13, endMinute: 40 },
  { label: '6교시', startHour: 13, startMinute: 50, endHour: 14, endMinute: 30 },
  { label: '7교시', startHour: 14, startMinute: 40, endHour: 15, endMinute: 20 },
];

export function formatTime(hour: number, minute: number): string {
  return `${hour}:${minute.toString().padStart(2, '0')}`;
}

export function formatPeriodTimeRange(pt: PeriodTime): string {
  return `${formatTime(pt.startHour, pt.startMinute)} ~ ${formatTime(pt.endHour, pt.endMinute)}`;
}

/** 현재 진행 중인 교시 번호 반환 (없으면 null) */
export function getCurrentPeriodIndex(periodTimes: PeriodTime[]): number | null {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const nowMin = h * 60 + m;

  for (let i = 0; i < periodTimes.length; i++) {
    const pt = periodTimes[i];
    const start = pt.startHour * 60 + pt.startMinute;
    const end = pt.endHour * 60 + pt.endMinute;
    if (nowMin >= start && nowMin < end) return i + 1; // 1-based period
  }
  return null;
}

/** 다음 교시 번호 반환 (없으면 null) */
export function getNextPeriodIndex(periodTimes: PeriodTime[]): number | null {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const nowMin = h * 60 + m;

  for (let i = 0; i < periodTimes.length; i++) {
    const pt = periodTimes[i];
    const start = pt.startHour * 60 + pt.startMinute;
    if (nowMin < start) return i + 1; // 1-based period
  }
  return null;
}
