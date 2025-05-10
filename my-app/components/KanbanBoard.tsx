"use client";
import React, { useState, DragEvent, KeyboardEvent, useEffect } from 'react';
import { Trash2, Edit3, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const dummyData: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: 'task-1', title: 'Analyze requirements', description: 'Understand the project needs', labels: ['planning', 'critical'] },
      { id: 'task-2', title: 'Design UI mockups', description: 'Create visual designs for the app', labels: ['design'] },
    ],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    tasks: [
      { id: 'task-3', title: 'Develop feature X', description: 'Implement the main functionality', labels: ['development', 'backend'] },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: 'task-4', title: 'Setup project environment', description: 'Initialize the repository and tools', labels: ['setup'] },
      { id: 'task-5', title: 'Write initial documentation', description: 'Draft the README file', labels: ['docs'] },
    ],
  },
];

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(dummyData);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardLabels, setNewCardLabels] = useState('');
  const [editingCard, setEditingCard] = useState<Task | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editModalTitle, setEditModalTitle] = useState('');
  const [editModalDescription, setEditModalDescription] = useState('');
  const [editModalLabels, setEditModalLabels] = useState('');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [draggedItem, setDraggedItem] = useState<{ task: Task; fromColumnId: string } | null>(null);
  const [editingColumnTitleId, setEditingColumnTitleId] = useState<string | null>(null);
  const [currentEditingColumnTitle, setCurrentEditingColumnTitle] = useState('');
  const [isAddCardFormCollapsed, setIsAddCardFormCollapsed] = useState(true);
  const [isAddColumnFormCollapsed, setIsAddColumnFormCollapsed] = useState(true);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [taskDragOverColumnId, setTaskDragOverColumnId] = useState<string | null>(null);
  const [columnDragOverInfo, setColumnDragOverInfo] = useState<{ targetId: string | null; draggingId: string | null }>({ targetId: null, draggingId: null });
  const [dragOverTaskInfo, setDragOverTaskInfo] = useState<{ columnId: string; targetTaskId: string; position: 'before' | 'after' } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    type: 'card' | 'column' | null;
    targetId: string | null; 
    columnIdForCard?: string | null; 
    currentTitleForColumn?: string | null; 
  }>({ visible: false, x: 0, y: 0, type: null, targetId: null });
  const [searchTerm, setSearchTerm] = useState('');

  const LABEL_COLORS = [
    'bg-red-200 text-red-800',
    'bg-yellow-200 text-yellow-800',
    'bg-green-200 text-green-800',
    'bg-blue-200 text-blue-800',
    'bg-indigo-200 text-indigo-800',
    'bg-purple-200 text-purple-800',
    'bg-pink-200 text-pink-800',
    'bg-gray-200 text-gray-800',
  ];
  const [labelColorMap, setLabelColorMap] = useState<{ [key: string]: string }>({});
  let nextColorIndex = 0;

  const getLabelColor = (label: string, currentMap: { [key: string]: string }) => {
    if (currentMap[label]) {
      return currentMap[label];
    }
    const color = LABEL_COLORS[nextColorIndex % LABEL_COLORS.length];
    nextColorIndex = (nextColorIndex + 1) % LABEL_COLORS.length; // Cycle through colors
    return color;
  };

  useEffect(() => {
    // Initialize label colors from dummyData
    const initialLabelColors: { [key: string]: string } = {};
    let tempNextColorIndex = 0;
    dummyData.forEach(column => {
      column.tasks.forEach(task => {
        task.labels?.forEach(label => {
          if (!initialLabelColors[label]) {
            initialLabelColors[label] = LABEL_COLORS[tempNextColorIndex % LABEL_COLORS.length];
            tempNextColorIndex = (tempNextColorIndex + 1);
          }
        });
      });
    });
    setLabelColorMap(initialLabelColors);
    nextColorIndex = tempNextColorIndex % LABEL_COLORS.length; // Ensure nextColorIndex is correctly set after initialization
  }, []); // Run once on mount

  const updateLabelColors = (newLabels: string[]) => {
    setLabelColorMap(prevMap => {
      const newMap = { ...prevMap };
      let updated = false;
      newLabels.forEach(label => {
        if (!newMap[label]) {
          newMap[label] = getLabelColor(label, newMap); // Pass newMap to getLabelColor to ensure it uses the latest state within this update
          updated = true;
        }
      });
      // Re-assign nextColorIndex globally based on the newMap to avoid reusing colors too quickly if many new labels are added in one go
      if (updated) {
          const existingColors = Object.values(newMap);
          nextColorIndex = LABEL_COLORS.findIndex(lc => !existingColors.includes(lc));
          if (nextColorIndex === -1) nextColorIndex = 0; // All colors used, restart
      }
      return updated ? newMap : prevMap;
    });
  };

  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) {
      alert('Card title cannot be empty!');
      return;
    }

    const parsedLabels = newCardLabels.split(',').map(label => label.trim()).filter(label => label);
    if (parsedLabels.length > 0) {
      updateLabelColors(parsedLabels);
    }

    const newCard: Task = {
      id: `task-${Date.now()}`,
      title: newCardTitle.trim(),
      description: newCardDescription.trim() || undefined,
      labels: parsedLabels.length > 0 ? parsedLabels : undefined,
    };

    const updatedColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: [...column.tasks, newCard],
        };
      }
      return column;
    });

    setColumns(updatedColumns);
    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardLabels('');
  };

  const openEditModal = (task: Task, columnId: string) => {
    setEditingCard(task);
    setEditingColumnId(columnId);
    setEditModalTitle(task.title);
    setEditModalDescription(task.description || '');
    setEditModalLabels(task.labels ? task.labels.join(', ') : '');
  };

  const closeEditModal = () => {
    setEditingCard(null);
    setEditingColumnId(null);
    setEditModalTitle('');
    setEditModalDescription('');
    setEditModalLabels('');
  };

  const handleSaveChanges = () => {
    if (!editingCard || !editingColumnId) return;
    if (!editModalTitle.trim()) {
      alert('Card title cannot be empty!');
      return;
    }

    const parsedLabels = editModalLabels.split(',').map(label => label.trim()).filter(label => label);
    if (parsedLabels.length > 0) {
      updateLabelColors(parsedLabels);
    }

    const updatedColumns = columns.map(column => {
      if (column.id === editingColumnId) {
        return {
          ...column,
          tasks: column.tasks.map(task =>
            task.id === editingCard.id
              ? { 
                  ...task, 
                  title: editModalTitle.trim(), 
                  description: editModalDescription.trim() || undefined,
                  labels: parsedLabels.length > 0 ? parsedLabels : undefined,
                }
              : task
          ),
        };
      }
      return column;
    });
    setColumns(updatedColumns);
    closeEditModal();
  };

  const handleDeleteCard = (taskId: string, columnId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      const updatedColumns = columns.map(column => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: column.tasks.filter(task => task.id !== taskId),
          };
        }
        return column;
      });
      setColumns(updatedColumns);
    }
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      alert('Column title cannot be empty!');
      return;
    }
    const newColumn: Column = {
      id: `col-${Date.now()}`,
      title: newColumnTitle.trim(),
      tasks: [],
    };
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, task: Task, fromColumnId: string) => {
    e.stopPropagation(); // Prevent event from bubbling to column's drag handlers
    setDraggedItem({ task, fromColumnId });
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setTaskDragOverColumnId(null);
    setDragOverTaskInfo(null); 
    setColumnDragOverInfo(prev => ({ ...prev, targetId: null })); 
    closeContextMenu(); // Close context menu on drag end
  };

  const handleColumnDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('.task-draggable-item')) {
      return;
    }

    setDraggedColumnIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (columns[index]) {
      e.dataTransfer.setData('application/kanban-column-id', columns[index].id);
      setColumnDragOverInfo({ targetId: null, draggingId: columns[index].id });
    }
  };

  const handleColumnDragOver = (e: DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault(); // Necessary to allow dropping

    const isDraggingTaskType = e.dataTransfer.types.includes('text/plain');
    const isDraggingColumnType = e.dataTransfer.types.includes('application/kanban-column-id');

    if (isDraggingTaskType && draggedItem) { // A task from our app is being dragged
      if (!dragOverTaskInfo || dragOverTaskInfo.columnId !== targetColumnId) {
        setTaskDragOverColumnId(targetColumnId);
      }
      setColumnDragOverInfo(prev => ({ ...prev, targetId: null })); // Clear column reorder highlight
    } else if (isDraggingColumnType && draggedColumnIndex !== null) { // A column from our app is being dragged
      if (columns[draggedColumnIndex]?.id !== targetColumnId) {
        setColumnDragOverInfo(prev => ({ ...prev, targetId: targetColumnId }));
      } else {
        setColumnDragOverInfo(prev => ({ ...prev, targetId: null })); // Don't highlight if dragging column over itself
      }
      setTaskDragOverColumnId(null); // Clear task drop highlight
      setDragOverTaskInfo(null); // Clear task reorder highlight
    }
  };

  const handleColumnDragLeave = (e: DragEvent<HTMLDivElement>) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
        setTaskDragOverColumnId(null);
        setColumnDragOverInfo(prev => ({ ...prev, targetId: null }));
    }
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnIndex(null);
    setColumnDragOverInfo({ targetId: null, draggingId: null });
    setTaskDragOverColumnId(null); // Ensure task highlight is also cleared
    setDragOverTaskInfo(null); // Ensure task reorder highlight is also cleared
    closeContextMenu(); // Close context menu on drag end
  };

  const handleUnifiedDrop = (e: DragEvent<HTMLDivElement>, targetColumnId: string, targetColumnIndex: number) => {
    e.preventDefault();
    
    const isTaskDropAttempt = e.dataTransfer.types.includes('text/plain') && draggedItem;
    const isColumnDropAttempt = e.dataTransfer.types.includes('application/kanban-column-id') && draggedColumnIndex !== null;

    if (isTaskDropAttempt && !dragOverTaskInfo) { 
      const { task: draggedTaskItem, fromColumnId: sourceColumnIdForTask } = draggedItem!;

      if (sourceColumnIdForTask !== targetColumnId) { 
        let taskToMove: Task | undefined;
        const intermediateColumns = columns.map(col => {
          if (col.id === sourceColumnIdForTask) {
            taskToMove = col.tasks.find(t => t.id === draggedTaskItem.id);
            return { ...col, tasks: col.tasks.filter(t => t.id !== draggedTaskItem.id) };
          }
          return col;
        });

        if (taskToMove) {
          const finalColumns = intermediateColumns.map(col => {
            if (col.id === targetColumnId) {
              return { ...col, tasks: [...col.tasks, taskToMove!] };
            }
            return col;
          });
          setColumns(finalColumns);
        }
      } else { 
        setColumns(prevCols => {
          const newCols = [...prevCols];
          const columnIndex = newCols.findIndex(col => col.id === targetColumnId);
          if (columnIndex !== -1) {
            const columnToUpdate = { ...newCols[columnIndex] };
            const taskToMoveInstance = columnToUpdate.tasks.find(t => t.id === draggedTaskItem.id);
            if (taskToMoveInstance) {
                columnToUpdate.tasks = columnToUpdate.tasks.filter(t => t.id !== draggedTaskItem.id);
                columnToUpdate.tasks.push(taskToMoveInstance); 
                newCols[columnIndex] = columnToUpdate;
            }
          }
          return newCols;
        });
      }
    } else if (isColumnDropAttempt) {
      if (draggedColumnIndex !== null && draggedColumnIndex !== targetColumnIndex) {
        const newColumnsOrder = [...columns];
        const [draggedColumn] = newColumnsOrder.splice(draggedColumnIndex!, 1);
        newColumnsOrder.splice(targetColumnIndex, 0, draggedColumn);
        setColumns(newColumnsOrder);
      }
    }

    setDraggedItem(null);
    setDraggedColumnIndex(null);
    setTaskDragOverColumnId(null);
    setColumnDragOverInfo({ targetId: null, draggingId: null });
    setDragOverTaskInfo(null);
  };

  const startEditColumnTitle = (columnId: string, currentTitle: string) => {
    setEditingColumnTitleId(columnId);
    setCurrentEditingColumnTitle(currentTitle);
  };

  const handleColumnTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentEditingColumnTitle(e.target.value);
  };

  const saveColumnTitle = (columnId: string) => {
    if (!currentEditingColumnTitle.trim()) {
      alert('Column title cannot be empty!');
      const originalColumn = columns.find(col => col.id === columnId);
      if (originalColumn) setCurrentEditingColumnTitle(originalColumn.title); 
      else setEditingColumnTitleId(null);
      return;
    }
    const updatedColumns = columns.map(col =>
      col.id === columnId ? { ...col, title: currentEditingColumnTitle.trim() } : col
    );
    setColumns(updatedColumns);
    setEditingColumnTitleId(null);
    setCurrentEditingColumnTitle('');
  };

  const cancelEditColumnTitle = () => {
    setEditingColumnTitleId(null);
    setCurrentEditingColumnTitle('');
  };

  const handleColumnTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>, columnId: string) => {
    if (e.key === 'Enter') {
      saveColumnTitle(columnId);
    }
    if (e.key === 'Escape') {
      cancelEditColumnTitle();
    }
  };

  const handleDeleteColumn = (columnIdToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this column and all its cards?')) {
      setColumns(prevColumns => prevColumns.filter(col => col.id !== columnIdToDelete));
      const selectElement = document.getElementById('add-card-column-select') as HTMLSelectElement | null;
      if (selectElement && selectElement.value === columnIdToDelete) {
        if (columns.length > 1) {
          const firstRemainingColumn = columns.find(col => col.id !== columnIdToDelete);
          if (firstRemainingColumn) {
            selectElement.value = firstRemainingColumn.id;
          } else {
            selectElement.value = '';
          }
        } else {
          selectElement.value = '';
        }
      }
    }
  };

  const handleTaskDragOver = (e: DragEvent<HTMLDivElement>, overTask: Task, inColumnId: string) => {
    e.preventDefault();
    e.stopPropagation(); 

    if (draggedItem && draggedItem.task.id !== overTask.id) {
      if (draggedItem.fromColumnId === inColumnId) { 
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? 'before' : 'after';
        setDragOverTaskInfo({ columnId: inColumnId, targetTaskId: overTask.id, position });
        setTaskDragOverColumnId(null); 
      } else { 
        setTaskDragOverColumnId(inColumnId); 
        setDragOverTaskInfo(null); 
      }
    }
  };

  const handleTaskDragLeave = (e: DragEvent<HTMLDivElement>) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
        setDragOverTaskInfo(null);
    }
  };

  const handleTaskDropOnTask = (e: DragEvent<HTMLDivElement>, onTask: Task, inColumnId: string) => {
    e.preventDefault();
    e.stopPropagation(); 

    if (draggedItem && dragOverTaskInfo && 
        draggedItem.fromColumnId === inColumnId && 
        dragOverTaskInfo.columnId === inColumnId && 
        dragOverTaskInfo.targetTaskId === onTask.id) {
      const { task: taskToMove } = draggedItem;

      setColumns(prevCols => {
        return prevCols.map(col => {
          if (col.id === inColumnId) {
            let newTasks = [...col.tasks];
            const taskToMoveInstance = newTasks.find(t => t.id === taskToMove.id);

            if (!taskToMoveInstance) return col;

            newTasks = newTasks.filter(t => t.id !== taskToMove.id);

            let targetIdx = newTasks.findIndex(t => t.id === onTask.id);

            if (targetIdx === -1) { 
              newTasks.push(taskToMoveInstance); 
            } else {
              if (dragOverTaskInfo.position === 'before') {
                newTasks.splice(targetIdx, 0, taskToMoveInstance);
              } else { 
                newTasks.splice(targetIdx + 1, 0, taskToMoveInstance);
              }
            }
            return { ...col, tasks: newTasks };
          }
          return col;
        });
      });
    } else if (draggedItem && draggedItem.fromColumnId !== inColumnId) {
      let taskToMove: Task | undefined;
      const sourceColId = draggedItem.fromColumnId;
      
      const intermediateColumns = columns.map(col => {
        if (col.id === sourceColId) {
          taskToMove = col.tasks.find(t => t.id === draggedItem.task.id);
          return { ...col, tasks: col.tasks.filter(t => t.id !== draggedItem.task.id) };
        }
        return col;
      });

      if (taskToMove) {
        const finalColumns = intermediateColumns.map(col => {
          if (col.id === inColumnId) { 
            return { ...col, tasks: [...col.tasks, taskToMove!] }; 
          }
          return col;
        });
        setColumns(finalColumns);
      }
    }

    setDraggedItem(null);
    setTaskDragOverColumnId(null);
    setDragOverTaskInfo(null);
    setColumnDragOverInfo({ targetId: null, draggingId: null });
  };

  const handleCardContextMenu = (
    e: React.MouseEvent<HTMLDivElement>,
    task: Task,
    columnId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'card',
      targetId: task.id,
      columnIdForCard: columnId,
    });
  };

  const handleColumnContextMenu = (
    e: React.MouseEvent<HTMLDivElement>,
    column: Column
  ) => {
    e.preventDefault();
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest('.task-draggable-item')) {
        return; // Don't show column context menu if right-click is on a card
    }
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'column',
      targetId: column.id,
      currentTitleForColumn: column.title,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false, type: null, targetId: null }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.visible) {
        const target = event.target as HTMLElement;
        const menuElement = document.querySelector('.context-menu-container');
        if (menuElement && !menuElement.contains(target)) {
          closeContextMenu();
        }
      }
    };

    const handleEscKey = (event: globalThis.KeyboardEvent) => { // Changed type to globalThis.KeyboardEvent
      if (event.key === 'Escape') {
        closeContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey as EventListener); // Added type assertion
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey as EventListener); // Added type assertion
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey as EventListener); // Added type assertion
    };
  }, [contextMenu.visible]);

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }));

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen w-full" onClick={closeContextMenu}> 
      <div className="w-full max-w-4xl mb-6">
        <input 
          type="text"
          placeholder="Search cards by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex space-x-4 justify-start w-full max-w-4xl overflow-x-auto pb-4 mb-6">
        {filteredColumns.map((column, index) => { // Use filteredColumns here
          let columnClasses = "bg-gray-200 p-4 rounded-lg w-72 shadow-md flex-shrink-0 cursor-grab transition-all duration-150 ease-in-out";
          
          if (columnDragOverInfo.draggingId && columnDragOverInfo.targetId === column.id && columnDragOverInfo.draggingId !== column.id) {
            columnClasses += " ring-2 ring-green-500 ring-offset-2";
          }
          if (taskDragOverColumnId === column.id && draggedItem && draggedItem.fromColumnId !== column.id) {
            columnClasses += " bg-blue-100 ring-2 ring-blue-500 ring-offset-2";
          }

          if (draggedColumnIndex === index) {
            columnClasses += " opacity-50 scale-105 transform";
          }

          return (
            <div 
              key={column.id} 
              className={columnClasses}
              draggable="true"
              onDragStart={(e) => handleColumnDragStart(e, index)}
              onDragOver={(e) => handleColumnDragOver(e, column.id)} 
              onDragLeave={handleColumnDragLeave}
              onDrop={(e) => handleUnifiedDrop(e, column.id, index)} 
              onDragEnd={handleColumnDragEnd} 
              onContextMenu={(e) => handleColumnContextMenu(e, column)}
            >
              <div style={{ pointerEvents: draggedColumnIndex !== null ? 'none' : 'auto' }}> 
                <div className="flex justify-between items-center mb-4">
                  {editingColumnTitleId === column.id ? (
                    <input
                      type="text"
                      value={currentEditingColumnTitle}
                      onChange={handleColumnTitleInputChange}
                      onBlur={() => saveColumnTitle(column.id)}
                      onKeyDown={(e) => handleColumnTitleKeyDown(e, column.id)}
                      className="text-xl font-semibold text-gray-700 bg-white border border-blue-500 rounded px-2 py-1 w-full mr-2"
                      autoFocus
                    />
                  ) : (
                    <h2 
                      className="text-xl font-semibold text-gray-700 cursor-pointer hover:bg-gray-300 p-1 rounded flex-grow"
                      onClick={() => startEditColumnTitle(column.id, column.title)}
                    >
                      {column.title}
                    </h2>
                  )}
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    className="ml-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                    title="Delete column"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="space-y-3 min-h-[100px]">
                  {column.tasks.map((task) => {
                    let taskClasses = "task-draggable-item bg-white p-3 rounded-md shadow hover:shadow-lg transition-shadow cursor-grab";
                    if (draggedItem?.task.id === task.id) {
                      taskClasses += " opacity-50 scale-95 transform"; 
                    }
                    
                    let taskStyle: React.CSSProperties = {};
                    if (dragOverTaskInfo && dragOverTaskInfo.columnId === column.id && dragOverTaskInfo.targetTaskId === task.id) {
                      if (dragOverTaskInfo.position === 'before') {
                        taskStyle = { ...taskStyle, borderTop: '3px solid #3b82f6', paddingTop: 'calc(0.75rem - 3px)' }; 
                      } else {
                        taskStyle = { ...taskStyle, borderBottom: '3px solid #3b82f6', paddingBottom: 'calc(0.75rem - 3px)' };
                      }
                    }
                    if (draggedItem?.task.id === task.id) {
                        taskStyle.opacity = 0.5;
                    }

                    return (
                      <div 
                        key={task.id} 
                        className={taskClasses}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, task, column.id)}
                        onDragEnd={handleDragEnd} 
                        onDragOver={(e) => handleTaskDragOver(e, task, column.id)} 
                        onDragLeave={handleTaskDragLeave} 
                        onDrop={(e) => handleTaskDropOnTask(e, task, column.id)} 
                        style={taskStyle}
                        onContextMenu={(e) => handleCardContextMenu(e, task, column.id)}
                      >
                        <h3 className="font-medium text-gray-800">{task.title}</h3>
                        {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                        {task.labels && task.labels.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {task.labels.map((label, index) => (
                              <span 
                                key={index} 
                                className={`text-xs px-2 py-0.5 rounded-full ${labelColorMap[label] || 'bg-gray-200 text-gray-800'}`}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => openEditModal(task, column.id)}
                            className="text-xs text-yellow-600 hover:text-yellow-700 p-1 rounded hover:bg-yellow-100 transition-colors"
                            title="Edit card"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(task.id, column.id)}
                            className="text-xs text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                            title="Delete card"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-start gap-6 w-full max-w-4xl">
        <div className="p-4 bg-white rounded-lg shadow-md flex-1 min-w-[300px] max-w-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Add New Card</h2>
            <button 
              onClick={() => setIsAddCardFormCollapsed(!isAddCardFormCollapsed)}
              className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-100 transition-colors"
              title={isAddCardFormCollapsed ? 'Show form' : 'Hide form'}
            >
              {isAddCardFormCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
          {!isAddCardFormCollapsed && (
            <>
              <input
                type="text"
                placeholder="Card Title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                placeholder="Card Description (Optional)"
                value={newCardDescription}
                onChange={(e) => setNewCardDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
              <input
                type="text"
                placeholder="Labels (comma-separated)"
                value={newCardLabels}
                onChange={(e) => setNewCardLabels(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select 
                className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={columns[0]?.id || ''}
                onChange={(e) => {}}
                id="add-card-column-select"
              >
                {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                {columns.length === 0 && <option value="" disabled>Create a column first</option>} 
              </select>
              <button
                onClick={() => {
                  const selectedColumnId = (document.getElementById('add-card-column-select') as HTMLSelectElement).value;
                  if (selectedColumnId) {
                    handleAddCard(selectedColumnId);
                  } else {
                    alert("Please select a column to add the card to, or create one if none exist.");
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                disabled={columns.length === 0}
              >
                Add Card
              </button>
            </>
          )}
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md flex-1 min-w-[300px] max-w-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Add New Column</h2>
            <button 
              onClick={() => setIsAddColumnFormCollapsed(!isAddColumnFormCollapsed)}
              className="text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-100 transition-colors"
              title={isAddColumnFormCollapsed ? 'Show form' : 'Hide form'}
            >
              {isAddColumnFormCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
          {!isAddColumnFormCollapsed && (
            <>
              <input
                type="text"
                placeholder="Column Title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddColumn}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Add Column
              </button>
            </>
          )}
        </div>
      </div>

      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Card</h3>
            <input
              type="text"
              value={editModalTitle}
              onChange={(e) => setEditModalTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Card Title"
            />
            <textarea
              value={editModalDescription}
              onChange={(e) => setEditModalDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Card Description (Optional)"
            />
            <input
              type="text"
              placeholder="Labels (comma-separated)"
              value={editModalLabels}
              onChange={(e) => setEditModalLabels(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {contextMenu.visible && contextMenu.targetId && (
        <div
          className="context-menu-container fixed bg-white border border-gray-300 rounded-md shadow-xl py-1 z-[100] min-w-[150px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()} // Prevent click inside from closing via board's onClick
        >
          <ul className="divide-y divide-gray-200">
            {contextMenu.type === 'card' && contextMenu.columnIdForCard && (
              <>
                <li
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 hover:text-gray-900 transition-colors duration-150"
                  onClick={() => {
                    const cardToEdit = columns.find(col => col.id === contextMenu.columnIdForCard)?.tasks.find(t => t.id === contextMenu.targetId);
                    if (cardToEdit) {
                      openEditModal(cardToEdit, contextMenu.columnIdForCard!);
                    }
                    closeContextMenu();
                  }}
                >
                  Edit Card
                </li>
                <li
                  className="px-3 py-2 hover:bg-red-50 cursor-pointer text-sm text-red-600 hover:text-red-700 transition-colors duration-150"
                  onClick={() => {
                    handleDeleteCard(contextMenu.targetId!, contextMenu.columnIdForCard!);
                    closeContextMenu();
                  }}
                >
                  Delete Card
                </li>
              </>
            )}
            {contextMenu.type === 'column' && contextMenu.currentTitleForColumn && (
              <>
                <li
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 hover:text-gray-900 transition-colors duration-150"
                  onClick={() => {
                    startEditColumnTitle(contextMenu.targetId!, contextMenu.currentTitleForColumn!);
                    closeContextMenu();
                  }}
                >
                  Edit Title
                </li>
                <li
                  className="px-3 py-2 hover:bg-red-50 cursor-pointer text-sm text-red-600 hover:text-red-700 transition-colors duration-150"
                  onClick={() => {
                    handleDeleteColumn(contextMenu.targetId!);
                    closeContextMenu();
                  }}
                >
                  Delete Column
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
