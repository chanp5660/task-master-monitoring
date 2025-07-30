import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const SortableTaskItem = ({ 
  id, 
  children, 
  className = '', 
  disabled = false,
  showDragHandle = true,
  as = 'div' // 렌더링할 HTML 요소 타입 (div, tr 등)
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: id.toString(),
    disabled 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (disabled) {
    const Component = as;
    return (
      <Component className={className}>
        {children}
      </Component>
    );
  }

  const Component = as;

  return (
    <Component
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'z-50 shadow-2xl' : ''} ${as === 'tr' ? '' : 'relative group'}`}
    >
      {as === 'tr' ? (
        <>
          {showDragHandle && (
            <td className="px-2 py-4 whitespace-nowrap">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-100 transition-opacity duration-200 p-2 flex items-center justify-center rounded hover:bg-gray-100"
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </div>
            </td>
          )}
          {children}
        </>
      ) : (
        <div className="relative group">
          {showDragHandle && (
            <div
              {...attributes}
              {...listeners}
              className="absolute left-1 top-1/2 transform -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-100 transition-opacity duration-200 z-10 p-2 rounded hover:bg-gray-100 flex items-center justify-center"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </div>
          )}
          <div className={showDragHandle ? 'pl-8' : ''}>
            {children}
          </div>
        </div>
      )}
    </Component>
  );
};

export default SortableTaskItem;