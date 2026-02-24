export interface Child {
  id: string;
  name: string;
  schoolName: string;
  grade: number;
  colorIndex: number;
  displayOrder: number;
}

export interface TimetableEntry {
  id: string;
  childId: string;
  dayOfWeek: number; // 1=Mon ... 5=Fri
  period: number;    // 1~7
  subjectName: string;
  supplies?: string;
}

export interface WeeklyOverride {
  id: string;
  childId: string;
  weekStartDate: string; // ISO date string of Monday
  dayOfWeek: number;
  period: number;
  overrideSubjectName: string;
  overrideSupplies?: string;
}

export interface PeriodTime {
  label: string;       // "1교시", "점심", "영어학원" 등
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface AppSettings {
  notificationEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  lastSelectedChildId?: string;
  periodTimes: PeriodTime[];
}

export interface EffectiveEntry {
  period: number;
  periodLabel: string; // "1교시", "영어학원" 등
  subjectName: string;
  supplies?: string;
  isOverridden: boolean;
  baseEntryId: string;
  overrideId?: string;
  startTime?: string;  // "09:00"
  endTime?: string;    // "09:40"
}
