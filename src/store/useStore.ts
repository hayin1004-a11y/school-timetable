import { useState, useCallback, useEffect } from 'react';
import type { Child, TimetableEntry, WeeklyOverride, AppSettings, EffectiveEntry, PeriodTime } from '../models/types';
import { getWeekStartDate, DEFAULT_PERIOD_TIMES, formatTime } from '../utils/dates';
import { DEFAULT_SUBJECTS } from '../utils/subjects';

const STORAGE_KEY = 'school-timetable-data';

interface StoreData {
  children: Child[];
  entries: TimetableEntry[];
  overrides: WeeklyOverride[];
  settings: AppSettings;
  customSubjects: string[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadData(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    children: [],
    entries: [],
    overrides: [],
    settings: { notificationEnabled: true, notificationHour: 20, notificationMinute: 0, periodTimes: DEFAULT_PERIOD_TIMES },
    customSubjects: [],
  };
}

function migrateData(data: StoreData): StoreData {
  // Add periodTimes if missing (migration from older version)
  if (!data.settings.periodTimes) {
    data.settings.periodTimes = DEFAULT_PERIOD_TIMES;
  }
  // Add label if missing on existing periodTimes
  data.settings.periodTimes = data.settings.periodTimes.map((pt, idx) => {
    if (!pt.label) {
      return { ...pt, label: `${idx + 1}교시` };
    }
    return pt;
  });
  return data;
}

function saveData(data: StoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStore() {
  const [data, setData] = useState<StoreData>(() => migrateData(loadData()));

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Cleanup old overrides on load
  useEffect(() => {
    const currentWeek = getWeekStartDate();
    setData(prev => ({
      ...prev,
      overrides: prev.overrides.filter(o => o.weekStartDate >= currentWeek),
    }));
  }, []);

  const allSubjects = [...DEFAULT_SUBJECTS, ...data.customSubjects];

  // --- Child CRUD ---
  const addChild = useCallback((name: string, schoolName: string, grade: number) => {
    setData(prev => {
      if (prev.children.length >= 3) return prev;
      const child: Child = {
        id: generateId(),
        name,
        schoolName,
        grade,
        colorIndex: prev.children.length,
        displayOrder: prev.children.length,
      };
      return { ...prev, children: [...prev.children, child] };
    });
  }, []);

  const updateChild = useCallback((id: string, name: string, schoolName: string, grade: number) => {
    setData(prev => ({
      ...prev,
      children: prev.children.map(c => c.id === id ? { ...c, name, schoolName, grade } : c),
    }));
  }, []);

  const deleteChild = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      children: prev.children.filter(c => c.id !== id),
      entries: prev.entries.filter(e => e.childId !== id),
      overrides: prev.overrides.filter(o => o.childId !== id),
    }));
  }, []);

  // --- Timetable CRUD ---
  const addEntry = useCallback((childId: string, dayOfWeek: number, subjectName: string) => {
    setData(prev => {
      const existing = prev.entries.filter(e => e.childId === childId && e.dayOfWeek === dayOfWeek);
      const maxPeriods = prev.settings.periodTimes.length;
      if (existing.length >= maxPeriods) return prev;
      const entry: TimetableEntry = {
        id: generateId(),
        childId,
        dayOfWeek,
        period: existing.length + 1,
        subjectName,
      };
      return { ...prev, entries: [...prev.entries, entry] };
    });
  }, []);

  const updateEntrySubject = useCallback((entryId: string, subjectName: string) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === entryId ? { ...e, subjectName } : e),
    }));
  }, []);

  const updateEntrySupplies = useCallback((entryId: string, supplies: string | undefined) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === entryId ? { ...e, supplies } : e),
    }));
  }, []);

  const deleteEntry = useCallback((entryId: string) => {
    setData(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== entryId),
    }));
  }, []);

  // --- Weekly Override ---
  const setWeeklyOverride = useCallback((childId: string, dayOfWeek: number, period: number, subjectName: string) => {
    const weekStart = getWeekStartDate();
    setData(prev => {
      const existing = prev.overrides.findIndex(
        o => o.childId === childId && o.dayOfWeek === dayOfWeek && o.period === period && o.weekStartDate === weekStart
      );
      if (existing >= 0) {
        const updated = [...prev.overrides];
        updated[existing] = { ...updated[existing], overrideSubjectName: subjectName };
        return { ...prev, overrides: updated };
      }
      const override: WeeklyOverride = {
        id: generateId(),
        childId,
        weekStartDate: weekStart,
        dayOfWeek,
        period,
        overrideSubjectName: subjectName,
      };
      return { ...prev, overrides: [...prev.overrides, override] };
    });
  }, []);

  const removeWeeklyOverride = useCallback((overrideId: string) => {
    setData(prev => ({
      ...prev,
      overrides: prev.overrides.filter(o => o.id !== overrideId),
    }));
  }, []);

  // --- Effective Entries ---
  const getEffectiveEntries = useCallback((childId: string, dayOfWeek: number): EffectiveEntry[] => {
    const weekStart = getWeekStartDate();
    const base = data.entries
      .filter(e => e.childId === childId && e.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.period - b.period);

    return base.map(entry => {
      const override = data.overrides.find(
        o => o.childId === childId && o.dayOfWeek === dayOfWeek && o.period === entry.period && o.weekStartDate === weekStart
      );
      const pt = data.settings.periodTimes[entry.period - 1];
      return {
        period: entry.period,
        periodLabel: pt?.label ?? `${entry.period}교시`,
        subjectName: override?.overrideSubjectName ?? entry.subjectName,
        supplies: override?.overrideSupplies ?? entry.supplies,
        isOverridden: !!override,
        baseEntryId: entry.id,
        overrideId: override?.id,
        startTime: pt ? formatTime(pt.startHour, pt.startMinute) : undefined,
        endTime: pt ? formatTime(pt.endHour, pt.endMinute) : undefined,
      };
    });
  }, [data.entries, data.overrides]);

  // --- Custom Subjects ---
  const addCustomSubject = useCallback((name: string) => {
    setData(prev => ({
      ...prev,
      customSubjects: prev.customSubjects.includes(name) ? prev.customSubjects : [...prev.customSubjects, name],
    }));
  }, []);

  const removeCustomSubject = useCallback((name: string) => {
    setData(prev => ({
      ...prev,
      customSubjects: prev.customSubjects.filter(s => s !== name),
    }));
  }, []);

  // --- Settings ---
  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  }, []);

  // --- Period Times ---
  const updatePeriodTime = useCallback((index: number, pt: PeriodTime) => {
    setData(prev => {
      const newTimes = [...prev.settings.periodTimes];
      newTimes[index] = pt;
      return { ...prev, settings: { ...prev.settings, periodTimes: newTimes } };
    });
  }, []);

  const addPeriodTime = useCallback((pt: PeriodTime) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, periodTimes: [...prev.settings.periodTimes, pt] },
    }));
  }, []);

  const removePeriodTime = useCallback((index: number) => {
    setData(prev => {
      const newTimes = prev.settings.periodTimes.filter((_, i) => i !== index);
      return { ...prev, settings: { ...prev.settings, periodTimes: newTimes } };
    });
  }, []);

  const resetPeriodTimes = useCallback(() => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, periodTimes: DEFAULT_PERIOD_TIMES },
    }));
  }, []);

  // --- Reset ---
  const resetAll = useCallback(() => {
    const fresh: StoreData = {
      children: [],
      entries: [],
      overrides: [],
      settings: { notificationEnabled: true, notificationHour: 20, notificationMinute: 0, periodTimes: DEFAULT_PERIOD_TIMES },
      customSubjects: [],
    };
    setData(fresh);
  }, []);

  return {
    children: data.children,
    entries: data.entries,
    overrides: data.overrides,
    settings: data.settings,
    allSubjects,
    customSubjects: data.customSubjects,
    addChild,
    updateChild,
    deleteChild,
    addEntry,
    updateEntrySubject,
    updateEntrySupplies,
    deleteEntry,
    setWeeklyOverride,
    removeWeeklyOverride,
    getEffectiveEntries,
    addCustomSubject,
    removeCustomSubject,
    updateSettings,
    updatePeriodTime,
    addPeriodTime,
    removePeriodTime,
    resetPeriodTimes,
    resetAll,
  };
}
