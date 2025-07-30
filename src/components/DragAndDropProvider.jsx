import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

const DragAndDropProvider = ({ 
  children, 
  items, 
  onDragEnd, 
  disabled = false,
  strategy = 'vertical' // 'vertical' | 'rect'
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id.toString() === active.id);
      const newIndex = items.findIndex(item => item.id.toString() === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onDragEnd(newItems);
      }
    }
  };

  if (disabled) {
    return children;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item.id.toString())}
        strategy={strategy === 'rect' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
};

export default DragAndDropProvider;