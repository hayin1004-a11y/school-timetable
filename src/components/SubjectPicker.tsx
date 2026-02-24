import { useState } from 'react';

interface Props {
  subjects: string[];
  currentSubject: string;
  onSelect: (subject: string, thisWeekOnly: boolean) => void;
  onClose: () => void;
  onAddCustom: (name: string) => void;
}

export function SubjectPicker({ subjects, currentSubject, onSelect, onClose, onAddCustom }: Props) {
  const [selected, setSelected] = useState(currentSubject);
  const [thisWeekOnly, setThisWeekOnly] = useState(true);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 480,
          maxHeight: '70vh', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 15, color: '#6B7280', cursor: 'pointer' }}>취소</button>
          <span style={{ fontWeight: 600, fontSize: 16 }}>과목 변경</span>
          <button
            onClick={() => { if (selected) onSelect(selected, thisWeekOnly); }}
            disabled={!selected}
            style={{ border: 'none', background: 'none', fontSize: 15, color: selected ? '#007AFF' : '#D1D5DB', cursor: 'pointer', fontWeight: 600 }}
          >완료</button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={thisWeekOnly}
              onChange={e => setThisWeekOnly(e.target.checked)}
              style={{ accentColor: '#FF9500', width: 18, height: 18 }}
            />
            <span style={{ fontSize: 15 }}>이번 주만 변경</span>
          </label>
          {!thisWeekOnly && (
            <p style={{ fontSize: 13, color: '#FF9500', margin: '4px 0 0 26px' }}>
              기본 시간표가 영구적으로 변경됩니다
            </p>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSelected(subj)}
              style={{
                display: 'flex', width: '100%', padding: '10px 20px',
                border: 'none', background: selected === subj ? '#F0F7FF' : 'transparent',
                cursor: 'pointer', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 15,
              }}
            >
              <span style={{ color: '#1A1A2E' }}>{subj}</span>
              {selected === subj && <span style={{ color: '#007AFF' }}>✓</span>}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(true)}
            style={{
              display: 'flex', width: '100%', padding: '10px 20px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 15, color: '#007AFF', gap: 4,
            }}
          >
            + 직접 입력
          </button>
        </div>

        {showCustom && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110,
          }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 280 }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>과목 직접 입력</p>
              <input
                autoFocus
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="과목명"
                style={{ width: '100%', padding: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowCustom(false); setCustomName(''); }}
                  style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>취소</button>
                <button onClick={() => {
                  if (customName.trim()) {
                    onAddCustom(customName.trim());
                    setSelected(customName.trim());
                    setShowCustom(false);
                    setCustomName('');
                  }
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
