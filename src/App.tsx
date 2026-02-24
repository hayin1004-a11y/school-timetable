import { useState, useCallback, useEffect } from 'react';
import { useStore } from './store/useStore';
import { childColor, COLORS } from './utils/colors';
import { getTodayDayIndex, dayName, getCurrentPeriodIndex } from './utils/dates';
import { ChildTabBar } from './components/ChildTabBar';
import { DayBar } from './components/DayBar';
import { TodaySummaryCard } from './components/TodaySummaryCard';
import { PeriodCell } from './components/PeriodCell';
import { SubjectPicker } from './components/SubjectPicker';
import { ChildForm } from './components/ChildForm';
import { UndoToast } from './components/UndoToast';
import { SettingsPanel } from './components/SettingsPanel';
import { WeeklyView } from './components/WeeklyView';
import { SharedView } from './components/SharedView';
import type { Child, PeriodTime } from './models/types';
import { formatTime } from './utils/dates';
import { encodeShareData, decodeShareData, getShareHash, generateShareUrl } from './utils/sharing';
import type { DecodedShareData } from './utils/sharing';
import './App.css';

function App() {
  const store = useStore();

  // 공유 링크 감지
  const [sharedData, setSharedData] = useState<DecodedShareData | null>(() => {
    const hash = getShareHash();
    if (hash) return decodeShareData(hash);
    return null;
  });

  // 공유 링크 복사 상태
  const [shareCopied, setShareCopied] = useState(false);

  // 공유 모드면 읽기전용 뷰 표시
  if (sharedData) {
    return (
      <div>
        <SharedView data={sharedData} />
        <div style={{ textAlign: 'center', padding: '16px 0 32px' }}>
          <button onClick={() => { window.location.hash = ''; setSharedData(null); }}
            style={{ padding: '10px 24px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>
            내 시간표로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    const encoded = encodeShareData(
      store.children,
      store.entries,
      store.settings.periodTimes,
      store.customSubjects,
    );
    const url = generateShareUrl(encoded);
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);
  const [selectedDay, setSelectedDay] = useState(getTodayDayIndex);
  const [showChildForm, setShowChildForm] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | undefined>();
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [undoAction, setUndoAction] = useState<(() => void) | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [showSuppliesEdit, setShowSuppliesEdit] = useState(false);
  const [suppliesText, setSuppliesText] = useState('');
  const [suppliesEntryId, setSuppliesEntryId] = useState('');

  // 보기 모드: 'day' | 'week'
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // 교시 편집 모달
  const [showPeriodEdit, setShowPeriodEdit] = useState(false);
  const [editingPeriodIdx, setEditingPeriodIdx] = useState<number | null>(null);
  const [editPT, setEditPT] = useState<PeriodTime>({ label: '', startHour: 9, startMinute: 0, endHour: 9, endMinute: 40 });

  const child = store.children[selectedChildIdx];
  const color = child ? childColor(child.colorIndex) : childColor(0);

  const entries = child ? store.getEffectiveEntries(child.id, selectedDay) : [];
  const totalPeriods = entries.length;
  const suppliesCount = entries.filter(e => e.supplies).length;

  useEffect(() => {
    if (!showUndo) return;
    const t = setTimeout(() => { setShowUndo(false); setUndoAction(null); }, 3000);
    return () => clearTimeout(t);
  }, [showUndo]);

  const handleSubjectChange = useCallback((subject: string, thisWeekOnly: boolean) => {
    if (!child || editingPeriod === null) return;
    const prev = entries.find(e => e.period === editingPeriod);
    if (!prev) return;

    if (thisWeekOnly) {
      store.setWeeklyOverride(child.id, selectedDay, editingPeriod, subject);
      const oid = prev.overrideId;
      if (oid) {
        setUndoAction(() => () => store.removeWeeklyOverride(oid));
      }
    } else {
      const prevSubject = prev.subjectName;
      const eid = prev.baseEntryId;
      store.updateEntrySubject(eid, subject);
      setUndoAction(() => () => store.updateEntrySubject(eid, prevSubject));
    }
    setShowUndo(true);
    setShowSubjectPicker(false);
  }, [child, editingPeriod, selectedDay, entries, store]);

  // Onboarding
  if (store.children.length === 0) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: COLORS.background, padding: 32,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📅</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 8 }}>초등 시간표</h1>
        <p style={{ color: COLORS.textSecondary, marginBottom: 40 }}>아이들의 시간표를 간편하게 관리하세요</p>
        <button onClick={() => setShowChildForm(true)} style={{
          padding: '16px 40px', border: 'none', borderRadius: 12,
          background: '#4A90D9', color: '#fff', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', width: '100%', maxWidth: 300,
        }}>첫 번째 아이 등록하기</button>
        {showChildForm && (
          <ChildForm
            onSave={(name, school, grade) => { store.addChild(name, school, grade); setShowChildForm(false); }}
            onClose={() => setShowChildForm(false)}
          />
        )}
      </div>
    );
  }

  // Main
  return (
    <div style={{ minHeight: '100vh', background: COLORS.background, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        {store.children.length < 3 && (
          <button onClick={() => { setEditingChild(undefined); setShowChildForm(true); }}
            style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', padding: 4 }} title="아이 추가">👤+</button>
        )}
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 600, color: COLORS.textPrimary, margin: 0 }}>
          {child?.name ?? '시간표'}
        </h1>
        <button onClick={handleShare}
          style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', padding: 4, position: 'relative' }} title="공유 링크 복사">
          {shareCopied ? '✅' : '🔗'}
          {shareCopied && (
            <span style={{ position: 'absolute', top: -8, right: -16, fontSize: 10, background: '#10B981', color: '#fff', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
              복사됨!
            </span>
          )}
        </button>
        <button onClick={() => setShowSettings(true)}
          style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', padding: 4 }} title="설정">⚙️</button>
      </div>

      <ChildTabBar children={store.children} selectedIndex={selectedChildIdx} onSelect={setSelectedChildIdx} />

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 보기 모드 전환 탭 */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 2 }}>
          <button onClick={() => setViewMode('day')} style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            background: viewMode === 'day' ? '#fff' : 'transparent',
            color: viewMode === 'day' ? color.hex : '#6B7280',
            boxShadow: viewMode === 'day' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>📋 일별</button>
          <button onClick={() => setViewMode('week')} style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            background: viewMode === 'week' ? '#fff' : 'transparent',
            color: viewMode === 'week' ? color.hex : '#6B7280',
            boxShadow: viewMode === 'week' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>📊 주간</button>
        </div>

        {viewMode === 'week' && child ? (
          /* === 주간 보기 === */
          <WeeklyView
            childId={child.id}
            accentColor={color.hex}
            periodTimes={store.settings.periodTimes}
            getEntries={store.getEffectiveEntries}
            onDayTap={(day) => { setSelectedDay(day); setViewMode('day'); }}
          />
        ) : (
          /* === 일별 보기 === */
          <>
            {child && (
              <TodaySummaryCard childName={child.name} childColorHex={color.hex}
                totalPeriods={totalPeriods} suppliesCount={suppliesCount} dayIndex={selectedDay}
                periodTimes={store.settings.periodTimes}
                isToday={selectedDay === getTodayDayIndex()} />
            )}

            <DayBar selectedDay={selectedDay} onSelect={setSelectedDay} accentColor={color.hex} />

            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <p style={{ fontWeight: 600, color: COLORS.textPrimary }}>시간표가 비어있어요</p>
                <p style={{ fontSize: 14, color: COLORS.textSecondary }}>{dayName(selectedDay)}요일 시간표를 등록해주세요</p>
              </div>
            ) : (
              <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                {entries.map(entry => {
                  const isToday = selectedDay === getTodayDayIndex();
                  const currentPeriod = isToday ? getCurrentPeriodIndex(store.settings.periodTimes) : null;
                  return (
                    <PeriodCell key={entry.period} entry={entry}
                      isCurrentPeriod={currentPeriod === entry.period}
                      onTap={() => { setEditingPeriod(entry.period); setShowSubjectPicker(true); }}
                      onSuppliesTap={() => { setSuppliesEntryId(entry.baseEntryId); setSuppliesText(entry.supplies ?? ''); setShowSuppliesEdit(true); }}
                      onPeriodLabelTap={() => {
                        const ptIdx = entry.period - 1;
                        const pt = store.settings.periodTimes[ptIdx];
                        if (pt) { setEditingPeriodIdx(ptIdx); setEditPT({ ...pt }); setShowPeriodEdit(true); }
                      }}
                    />
                  );
                })}
              </div>
            )}

            {child && totalPeriods < store.settings.periodTimes.length && (
              <button onClick={() => { setEditingPeriod(null); setShowSubjectPicker(true); }}
                style={{ padding: 12, border: 'none', borderRadius: 10, background: color.light, color: color.hex, fontSize: 15, cursor: 'pointer', fontWeight: 500 }}>
                + {store.settings.periodTimes[totalPeriods]?.label ?? '교시'} 추가
              </button>
            )}

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
          </>
        )}
      </div>

      {/* Modals */}
      {showSubjectPicker && child && (
        <SubjectPicker subjects={store.allSubjects}
          currentSubject={editingPeriod !== null ? (entries.find(e => e.period === editingPeriod)?.subjectName ?? '') : ''}
          onSelect={(subject, thisWeekOnly) => {
            if (editingPeriod === null) { store.addEntry(child.id, selectedDay, subject); setShowSubjectPicker(false); }
            else handleSubjectChange(subject, thisWeekOnly);
          }}
          onClose={() => setShowSubjectPicker(false)}
          onAddCustom={store.addCustomSubject}
        />
      )}

      {showChildForm && (
        <ChildForm child={editingChild}
          onSave={(name, school, grade) => {
            if (editingChild) store.updateChild(editingChild.id, name, school, grade);
            else store.addChild(name, school, grade);
            setShowChildForm(false); setEditingChild(undefined);
          }}
          onDelete={editingChild ? () => { store.deleteChild(editingChild.id); setSelectedChildIdx(0); setEditingChild(undefined); } : undefined}
          onClose={() => { setShowChildForm(false); setEditingChild(undefined); }}
        />
      )}

      {showSettings && (
        <SettingsPanel children={store.children} settings={store.settings} customSubjects={store.customSubjects}
          onEditChild={(c) => { setEditingChild(c); setShowChildForm(true); setShowSettings(false); }}
          onUpdateSettings={store.updateSettings}
          onAddSubject={store.addCustomSubject} onRemoveSubject={store.removeCustomSubject}
          onUpdatePeriodTime={store.updatePeriodTime} onAddPeriodTime={store.addPeriodTime}
          onRemovePeriodTime={store.removePeriodTime} onResetPeriodTimes={store.resetPeriodTimes}
          onReset={store.resetAll} onClose={() => setShowSettings(false)}
        />
      )}

      {showSuppliesEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 280 }}>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>준비물 메모</p>
            <input autoFocus value={suppliesText} onChange={e => setSuppliesText(e.target.value)} placeholder="준비물을 입력하세요"
              style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSuppliesEdit(false)}
                style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>취소</button>
              <button onClick={() => { store.updateEntrySupplies(suppliesEntryId, suppliesText.trim() || undefined); setShowSuppliesEdit(false); }}
                style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#007AFF', color: '#fff', cursor: 'pointer' }}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 교시 편집 모달 (메인 화면에서 직접) */}
      {showPeriodEdit && editingPeriodIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={() => setShowPeriodEdit(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 20, width: 320 }}>
            <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>교시 편집</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 4 }}>이름</label>
                <input autoFocus type="text" value={editPT.label}
                  onChange={e => setEditPT(p => ({ ...p, label: e.target.value }))}
                  placeholder="예: 1교시, 영어학원, 태권도"
                  style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 4 }}>시작</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" min={0} max={23} value={editPT.startHour}
                    onChange={e => setEditPT(p => ({ ...p, startHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) }))}
                    style={{ width: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 16, textAlign: 'center' }} />
                  <span style={{ fontSize: 18, fontWeight: 600 }}>:</span>
                  <input type="number" min={0} max={59} value={editPT.startMinute}
                    onChange={e => setEditPT(p => ({ ...p, startMinute: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                    style={{ width: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 16, textAlign: 'center' }} />
                  <span style={{ fontSize: 14, color: '#9CA3AF', marginLeft: 4 }}>~</span>
                  <input type="number" min={0} max={23} value={editPT.endHour}
                    onChange={e => setEditPT(p => ({ ...p, endHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) }))}
                    style={{ width: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 16, textAlign: 'center' }} />
                  <span style={{ fontSize: 18, fontWeight: 600 }}>:</span>
                  <input type="number" min={0} max={59} value={editPT.endMinute}
                    onChange={e => setEditPT(p => ({ ...p, endMinute: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                    style={{ width: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 16, textAlign: 'center' }} />
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                  {formatTime(editPT.startHour, editPT.startMinute)} ~ {formatTime(editPT.endHour, editPT.endMinute)}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPeriodEdit(false)}
                style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>취소</button>
              <button onClick={() => {
                if (!editPT.label.trim()) return;
                store.updatePeriodTime(editingPeriodIdx, editPT);
                setShowPeriodEdit(false);
              }}
                style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#007AFF', color: '#fff', cursor: 'pointer' }}>저장</button>
            </div>
          </div>
        </div>
      )}

      {showUndo && undoAction && (
        <UndoToast onUndo={() => { undoAction(); setShowUndo(false); setUndoAction(null); }} />
      )}
    </div>
  );
}

export default App;
