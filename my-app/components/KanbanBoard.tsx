"use client";
import React, { useState, DragEvent, KeyboardEvent } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  labels?: string[]; // Added labels
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
  const [newCardLabels, setNewCardLabels] = useState(''); // State for new card labels
  const [editingCard, setEditingCard] = useState<Task | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editModalTitle, setEditModalTitle] = useState('');
  const [editModalDescription, setEditModalDescription] = useState('');
  const [editModalLabels, setEditModalLabels] = useState(''); // State for editing card labels
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [draggedItem, setDraggedItem] = useState<{ task: Task; fromColumnId: string } | null>(null);
  const [editingColumnTitleId, setEditingColumnTitleId] = useState<string | null>(null);
  const [currentEditingColumnTitle, setCurrentEditingColumnTitle] = useState('');
  const [isAddCardFormCollapsed, setIsAddCardFormCollapsed] = useState(true);
  const [isAddColumnFormCollapsed, setIsAddColumnFormCollapsed] = useState(true);

  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) {
      alert('Card title cannot be empty!');
      return;
    }

    const parsedLabels = newCardLabels.split(',').map(label => label.trim()).filter(label => label);

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
    setNewCardLabels(''); // Reset labels input
  };

  const openEditModal = (task: Task, columnId: string) => {
    setEditingCard(task);
    setEditingColumnId(columnId);
    setEditModalTitle(task.title);
    setEditModalDescription(task.description || '');
    setEditModalLabels(task.labels ? task.labels.join(', ') : ''); // Set labels for editing
  };

  const closeEditModal = () => {
    setEditingCard(null);
    setEditingColumnId(null);
    setEditModalTitle('');
    setEditModalDescription('');
    setEditModalLabels(''); // Reset edit labels
  };

  const handleSaveChanges = () => {
    if (!editingCard || !editingColumnId) return;
    if (!editModalTitle.trim()) {
      alert('Card title cannot be empty!');
      return;
    }

    const parsedLabels = editModalLabels.split(',').map(label => label.trim()).filter(label => label);

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
    setDraggedItem({ task, fromColumnId });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, toColumnId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { task: draggedTask, fromColumnId } = draggedItem;

    if (fromColumnId === toColumnId) {
      setDraggedItem(null);
      return;
    }

    const updatedColumns = columns.map(col => {
      if (col.id === fromColumnId) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== draggedTask.id) };
      }
      if (col.id === toColumnId) {
        return { ...col, tasks: [...col.tasks, draggedTask] };
      }
      return col;
    });

    setColumns(updatedColumns);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Column Title Editing Handlers
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

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen w-full">
      {/* Kanban Board Columns Display - MOVED UP */}
      <div className="flex space-x-4 justify-start w-full overflow-x-auto pb-4 mb-6">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className="bg-gray-200 p-4 rounded-lg w-80 shadow-md flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
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
                className="ml-2 text-red-500 hover:text-red-700 font-semibold py-1 px-2 rounded text-sm"
                title="Delete column"
              >
                &#x1F5D1; {/* Trash can icon */}
              </button>
            </div>
            <div className="space-y-3 min-h-[100px]">
              {column.tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-white p-3 rounded-md shadow hover:shadow-lg transition-shadow cursor-grab"
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, task, column.id)}
                  onDragEnd={handleDragEnd}
                >
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                  {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                  {task.labels && task.labels.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.labels.map((label, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => openEditModal(task, column.id)}
                      className="text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-800 font-semibold py-1 px-2 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCard(task.id, column.id)}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Forms for Adding New Card and Column - MOVED DOWN */}
      <div className="flex flex-wrap justify-center gap-6 w-full max-w-4xl">
        <div className="p-4 bg-white rounded-lg shadow-md flex-1 min-w-[300px] max-w-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Add New Card</h2>
            <button 
              onClick={() => setIsAddCardFormCollapsed(!isAddCardFormCollapsed)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              {isAddCardFormCollapsed ? 'Show' : 'Hide'}
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
              className="text-sm text-green-500 hover:text-green-700"
            >
              {isAddColumnFormCollapsed ? 'Show' : 'Hide'}
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
    </div>
  );
};

export default KanbanBoard;
