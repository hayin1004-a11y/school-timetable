interface Props {
  onUndo: () => void;
}

export function UndoToast({ onUndo }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.8)', borderRadius: 12, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 16, zIndex: 90,
      minWidth: 240,
    }}>
      <span style={{ color: '#fff', fontSize: 14, flex: 1 }}>변경되었습니다</span>
      <button
        onClick={onUndo}
        style={{ border: 'none', background: 'none', color: '#FFD60A', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
      >
        되돌리기
      </button>
    </div>
  );
}
