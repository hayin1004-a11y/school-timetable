import { useState } from 'react';
import type { Child, AppSettings, PeriodTime } from '../models/types';
import { childColor } from '../utils/colors';
import { formatTime } from '../utils/dates';

interface Props {
  children: Child[];
  settings: AppSettings;
  customSubjects: string[];
  onEditChild: (child: Child) => void;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onAddSubject: (name: string) => void;
  onRemoveSubject: (name: string) => void;
  onUpdatePeriodTime: (index: number, pt: PeriodTime) => void;
  onAddPeriodTime: (pt: PeriodTime) => void;
  onRemovePeriodTime: (index: number) => void;
  onResetPeriodTimes: () => void;
  onReset: () => void;
  onClose: () => void;
}

export function SettingsPanel({
  children, settings, customSubjects,
  onEditChild, onUpdateSettings: _onUpdateSettings, onAddSubject, onRemoveSubject,
  onUpdatePeriodTime, onAddPeriodTime, onRemovePeriodTime, onResetPeriodTimes, onReset, onClose,
}: Props) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [editingPeriodIdx, setEditingPeriodIdx] = useState<number | null>(null);
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [editPT, setEditPT] = useState<PeriodTime>({ label: '', startHour: 9, startMinute: 0, endHour: 9, endMinute: 40 });
  const [showDeletePeriodConfirm, setShowDeletePeriodConfirm] = useState(false);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start', zIndex: 100, paddingTop: 40,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#FAFBFC', borderRadius: 16, width: '90%', maxWidth: 420,
        maxHeight: 'calc(100vh - 80px)', overflow: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#fff', borderRadius: '16px 16px 0 0' }}>
          <span style={{ fontWeight: 600, fontSize: 17 }}>설정</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 15, color: '#007AFF', cursor: 'pointer', fontWeight: 600 }}>완료</button>
        </div>

        {/* Children */}
        <div style={{ padding: '16px 20px' }}>
          <h4 style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>아이 관리</h4>
          <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
            {children.map(child => (
              <button key={child.id} onClick={() => onEditChild(child)} style={{
                display: 'flex', width: '100%', padding: '12px 16px', border: 'none',
                background: '#fff', cursor: 'pointer', alignItems: 'center', gap: 10,
                borderBottom: '1px solid #F3F4F6',
              }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: childColor(child.colorIndex).hex }} />
                <span style={{ flex: 1, textAlign: 'left', fontSize: 15 }}>{child.name}</span>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{child.schoolName} {child.grade}학년</span>
                <span style={{ color: '#D1D5DB' }}>›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Subjects */}
        <div style={{ padding: '0 20px 16px' }}>
          <h4 style={{ fontSize: 13, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>추가 과목</h4>
          <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
            {customSubjects.map(subj => (
              <div key={subj} style={{
                display: 'flex', padding: '10px 16px', alignItems: 'center',
                borderBottom: '1px solid #F3F4F6',
              }}>
                <span style={{ flex: 1, fontSize: 15 }}>{subj}</span>
                <button onClick={() => onRemoveSubject(subj)}
                  style={{ border: 'none', background: 'none', color: '#FF3B30', cursor: 'pointer', fontSize: 14 }}>삭제</button>
              </div>
            ))}
            <button onClick={() => setShowAddSubject(true)} style={{
              display: 'flex', width: '100%', padding: '10px 16px', border: 'none',
              background: '#fff', cursor: 'pointer', fontSize: 15, color: '#007AFF',
            }}>
              + 과목 추가
            </button>
          </div>
        </div>

        {/* Period Times */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h4 style={{ fontSize: 13, color: '#6B7280', textTransform: 'uppercase', margin: 0 }}>교시/일정 관리</h4>
            <button onClick={onResetPeriodTimes}
              style={{ border: 'none', background: 'none', fontSize: 12, color: '#007AFF', cursor: 'pointer' }}>기본값 복원</button>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
            {settings.periodTimes.map((pt, idx) => (
              <button key={idx} onClick={() => { setEditingPeriodIdx(idx); setIsAddingPeriod(false); setEditPT({ ...pt }); setShowDeletePeriodConfirm(false); }}
                style={{
                  display: 'flex', width: '100%', padding: '10px 16px', border: 'none',
                  background: '#fff', cursor: 'pointer', alignItems: 'center', gap: 10,
                  borderBottom: '1px solid #F3F4F6', textAlign: 'left',
                }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 6, background: '#FAFBFC',
                  fontSize: 12, fontWeight: 600, color: '#6B7280', flexShrink: 0,
                }}>{pt.label}</span>
                <span style={{ flex: 1, fontSize: 14, color: '#9CA3AF' }}>
                  {formatTime(pt.startHour, pt.startMinute)} ~ {formatTime(pt.endHour, pt.endMinute)}
                </span>
                <span style={{ color: '#D1D5DB' }}>›</span>
              </button>
            ))}
            <button onClick={() => {
              const last = settings.periodTimes[settings.periodTimes.length - 1];
              const newStart = last ? { startHour: last.endHour, startMinute: last.endMinute + 10 } : { startHour: 15, startMinute: 30 };
              if (newStart.startMinute >= 60) { newStart.startHour += 1; newStart.startMinute -= 60; }
              setEditPT({
                label: `${settings.periodTimes.length + 1}교시`,
                startHour: newStart.startHour, startMinute: newStart.startMinute,
                endHour: newStart.startHour + (newStart.startMinute + 40 >= 60 ? 1 : 0),
                endMinute: (newStart.startMinute + 40) % 60,
              });
              setIsAddingPeriod(true);
              setEditingPeriodIdx(-1);
              setShowDeletePeriodConfirm(false);
            }} style={{
              display: 'flex', width: '100%', padding: '10px 16px', border: 'none',
              background: '#fff', cursor: 'pointer', fontSize: 15, color: '#007AFF', gap: 6, alignItems: 'center',
            }}>
              + 교시/일정 추가
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>
            학원, 방과후 등 자유롭게 추가할 수 있어요
          </p>
        </div>

        {/* Reset */}
        <div style={{ padding: '0 20px 24px' }}>
          <button onClick={() => setShowResetConfirm(true)} style={{
            width: '100%', padding: 12, border: 'none', borderRadius: 10,
            background: '#FEE2E2', color: '#FF3B30', fontSize: 15, cursor: 'pointer',
          }}>
            모든 데이터 초기화
          </button>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7280', marginTop: 16 }}>버전 1.0.0</p>
        </div>

        {showResetConfirm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 280, textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>정말 초기화하시겠습니까?</p>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>모든 아이 정보와 시간표가 삭제됩니다.</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button onClick={() => setShowResetConfirm(false)}
                  style={{ padding: '8px 20px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>취소</button>
                <button onClick={() => { onReset(); onClose(); }}
                  style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: '#FF3B30', color: '#fff', cursor: 'pointer' }}>초기화</button>
              </div>
            </div>
          </div>
        )}

        {editingPeriodIdx !== null && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 320 }}>
              <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>
                {isAddingPeriod ? '새 교시/일정 추가' : `${editPT.label} 편집`}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* 교시명 */}
                <div>
                  <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 4 }}>이름</label>
                  <input type="text" value={editPT.label}
                    onChange={e => setEditPT(p => ({ ...p, label: e.target.value }))}
                    placeholder="예: 8교시, 영어학원, 태권도"
                    style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }} />
                </div>

                {/* 시작 시간 */}
                <div>
                  <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 4 }}>시작 시간</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="number" min={0} max={23} value={editPT.startHour}
                      onChange={e => setEditPT(p => ({ ...p, startHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) }))}
                      style={{ width: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 16, textAlign: 'center' }} />
                    <span style={{ fontSize: 18, fontWeight: 600 }}>:</span>
                    <input type="number" min={0} max={59} value={editPT.startMinute}
                      onChange={e => setEditPT(p => ({ ...p, startMinute: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                      style={{ width: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 16, textAlign: 'center' }} />
                  </div>
                </div>

                {/* 종료 시간 */}
                <div>
                  <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 4 }}>종료 시간</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="number" min={0} max={23} value={editPT.endHour}
                      onChange={e => setEditPT(p => ({ ...p, endHour: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) }))}
                      style={{ width: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 16, textAlign: 'center' }} />
                    <span style={{ fontSize: 18, fontWeight: 600 }}>:</span>
                    <input type="number" min={0} max={59} value={editPT.endMinute}
                      onChange={e => setEditPT(p => ({ ...p, endMinute: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) }))}
                      style={{ width: 60, padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 16, textAlign: 'center' }} />
                  </div>
                </div>
              </div>

              {/* 삭제 버튼 (기존 교시 편집 시에만) */}
              {!isAddingPeriod && (
                <>
                  {!showDeletePeriodConfirm ? (
                    <button onClick={() => setShowDeletePeriodConfirm(true)}
                      style={{ width: '100%', padding: 10, border: 'none', borderRadius: 8, background: '#FEE2E2', color: '#FF3B30', fontSize: 14, cursor: 'pointer', marginTop: 12 }}>
                      이 교시 삭제
                    </button>
                  ) : (
                    <div style={{ marginTop: 12, padding: 10, background: '#FEE2E2', borderRadius: 8, textAlign: 'center' }}>
                      <p style={{ fontSize: 13, color: '#FF3B30', marginBottom: 8 }}>정말 삭제하시겠어요?</p>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button onClick={() => setShowDeletePeriodConfirm(false)}
                          style={{ padding: '6px 16px', border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 }}>취소</button>
                        <button onClick={() => { onRemovePeriodTime(editingPeriodIdx); setEditingPeriodIdx(null); }}
                          style={{ padding: '6px 16px', border: 'none', borderRadius: 6, background: '#FF3B30', color: '#fff', cursor: 'pointer', fontSize: 13 }}>삭제</button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => setEditingPeriodIdx(null)}
                  style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>취소</button>
                <button onClick={() => {
                  if (!editPT.label.trim()) return;
                  if (isAddingPeriod) {
                    onAddPeriodTime(editPT);
                  } else {
                    onUpdatePeriodTime(editingPeriodIdx, editPT);
                  }
                  setEditingPeriodIdx(null);
                }}
                  style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#007AFF', color: '#fff', cursor: 'pointer' }}>
                  {isAddingPeriod ? '추가' : '저장'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddSubject && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 280 }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>과목 추가</p>
              <input autoFocus value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="과목명"
                style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowAddSubject(false); setNewSubject(''); }}
                  style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>취소</button>
                <button onClick={() => {
                  if (newSubject.trim()) { onAddSubject(newSubject.trim()); setShowAddSubject(false); setNewSubject(''); }
                }}
                  style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#007AFF', color: '#fff', cursor: 'pointer' }}>추가</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
