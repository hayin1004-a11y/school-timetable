import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { Child, TimetableEntry, PeriodTime } from '../models/types';

/**
 * Compact shared data format for URL encoding.
 * We strip IDs and use indices to minimize size.
 */
interface SharedData {
  v: 1; // version
  c: Array<{ n: string; s: string; g: number; ci: number }>; // children
  e: Array<{ ci: number; d: number; p: number; sn: string; sp?: string }>; // entries
  pt: Array<{ l: string; sh: number; sm: number; eh: number; em: number }>; // periodTimes
  cs: string[]; // customSubjects
}

export function encodeShareData(
  children: Child[],
  entries: TimetableEntry[],
  periodTimes: PeriodTime[],
  customSubjects: string[],
): string {
  const childIdMap = new Map<string, number>();
  children.forEach((c, i) => childIdMap.set(c.id, i));

  const shared: SharedData = {
    v: 1,
    c: children.map(c => ({ n: c.name, s: c.schoolName, g: c.grade, ci: c.colorIndex })),
    e: entries.map(e => ({
      ci: childIdMap.get(e.childId) ?? 0,
      d: e.dayOfWeek,
      p: e.period,
      sn: e.subjectName,
      ...(e.supplies ? { sp: e.supplies } : {}),
    })),
    pt: periodTimes.map(pt => ({
      l: pt.label,
      sh: pt.startHour,
      sm: pt.startMinute,
      eh: pt.endHour,
      em: pt.endMinute,
    })),
    cs: customSubjects,
  };

  const json = JSON.stringify(shared);
  return compressToEncodedURIComponent(json);
}

export interface DecodedShareData {
  children: Array<{ name: string; schoolName: string; grade: number; colorIndex: number }>;
  entries: Array<{ childIndex: number; dayOfWeek: number; period: number; subjectName: string; supplies?: string }>;
  periodTimes: PeriodTime[];
  customSubjects: string[];
}

export function decodeShareData(encoded: string): DecodedShareData | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const data: SharedData = JSON.parse(json);
    if (data.v !== 1) return null;

    return {
      children: data.c.map(c => ({ name: c.n, schoolName: c.s, grade: c.g, colorIndex: c.ci })),
      entries: data.e.map(e => ({
        childIndex: e.ci,
        dayOfWeek: e.d,
        period: e.p,
        subjectName: e.sn,
        supplies: e.sp,
      })),
      periodTimes: data.pt.map(pt => ({
        label: pt.l,
        startHour: pt.sh,
        startMinute: pt.sm,
        endHour: pt.eh,
        endMinute: pt.em,
      })),
      customSubjects: data.cs,
    };
  } catch {
    return null;
  }
}

export function getShareHash(): string | null {
  const hash = window.location.hash;
  if (hash.startsWith('#share=')) {
    return hash.slice(7);
  }
  return null;
}

export function generateShareUrl(encoded: string): string {
  return `${window.location.origin}${window.location.pathname}#share=${encoded}`;
}
