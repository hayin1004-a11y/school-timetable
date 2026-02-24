import type { Child } from '../models/types';
import { childColor } from '../utils/colors';

interface Props {
  children: Child[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ChildTabBar({ children, selectedIndex, onSelect }: Props) {
  if (children.length <= 1) return null;

  return (
    <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
      {children.map((child, i) => {
        const color = childColor(child.colorIndex);
        const active = i === selectedIndex;
        return (
          <button
            key={child.id}
            onClick={() => onSelect(i)}
            style={{
              flex: 1,
              padding: '12px 0 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: active ? `3px solid ${color.hex}` : '3px solid transparent',
              color: active ? color.hex : '#6B7280',
              fontWeight: active ? 600 : 400,
              fontSize: 15,
            }}
          >
            {child.name}
          </button>
        );
      })}
    </div>
  );
}
