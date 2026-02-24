import { useState } from 'react';
import type { Child } from '../models/types';

interface Props {
  child?: Child;
  onSave: (name: string, schoolName: string, grade: number) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function ChildForm({ child, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(child?.name ?? '');
  const [schoolName, setSchoolName] = useState(child?.schoolName ?? '');
  const [grade, setGrade] = useState(child?.grade ?? 1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canSave = name.trim() && schoolName.trim();

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: '90%', maxWidth: 400, padding: 24,
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>{child ? '프로필 수정' : '아이 등록'}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: '#6B7280', marginBottom: 4, display: 'block' }}>이름</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="아이 이름"
              style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#6B7280', marginBottom: 4, display: 'block' }}>학교</label>
            <input
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="학교 이름"
              style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#6B7280', marginBottom: 4, display: 'block' }}>학년</label>
            <select
              value={grade}
              onChange={e => setGrade(Number(e.target.value))}
              style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }}
            >
              {[1,2,3,4,5,6].map(g => (
                <option key={g} value={g}>{g}학년</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {child && onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ padding: '10px 16px', border: 'none', borderRadius: 8, background: '#FEE2E2', color: '#FF3B30', cursor: 'pointer', fontSize: 14 }}
            >삭제</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose}
            style={{ padding: '10px 20px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>취소</button>
          <button
            disabled={!canSave}
            onClick={() => { if (canSave) onSave(name.trim(), schoolName.trim(), grade); }}
            style={{
              padding: '10px 20px', border: 'none', borderRadius: 8,
              background: canSave ? '#007AFF' : '#D1D5DB', color: '#fff', cursor: canSave ? 'pointer' : 'default', fontSize: 14,
            }}
          >저장</button>
        </div>

        {showDeleteConfirm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 280, textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>정말 삭제하시겠습니까?</p>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>아이의 모든 시간표 데이터가 삭제됩니다.</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: '8px 20px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>취소</button>
                <button onClick={() => { onDelete?.(); onClose(); }}
                  style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: '#FF3B30', color: '#fff', cursor: 'pointer' }}>삭제</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
