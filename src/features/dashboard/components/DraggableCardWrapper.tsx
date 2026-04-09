import { useRef, type ReactNode } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';

export type CardId = 'github' | 'gcloud' | 'sentry' | 'environments' | 'teams';
export type ColumnId = 'left' | 'right';

export const ITEM_TYPE = 'DASHBOARD_CARD';

export interface DragItem {
  id: CardId;
  index: number;
  column: ColumnId;
}

interface Props {
  id: CardId;
  index: number;
  column: ColumnId;
  onMove: (dragId: CardId, dragIndex: number, dragCol: ColumnId, hoverIndex: number, hoverCol: ColumnId) => void;
  children: ReactNode;
}

export function DraggableCardWrapper({ id, index, column, onMove, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: ITEM_TYPE,
    item: { id, index, column },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: ITEM_TYPE,
    collect: (monitor) => ({ isOver: monitor.isOver() }),
    hover(item) {
      if (!ref.current || item.id === id) return;
      onMove(item.id, item.index, item.column, index, column);
      item.index = index;
      item.column = column;
    },
  });

  dragPreview(drop(ref));

  return (
    <div
      ref={ref}
      className={[
        'relative group',
        isDragging ? 'opacity-40' : 'opacity-100',
        isOver ? 'ring-2 ring-primary ring-offset-2 rounded-xl' : '',
      ].join(' ')}
    >
      <div
        ref={drag}
        className="absolute top-3 right-3 z-10 hidden group-hover:flex cursor-grab active:cursor-grabbing items-center justify-center rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </div>
      {children}
    </div>
  );
}
