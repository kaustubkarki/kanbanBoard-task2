import { useEffect, useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id, Task } from "../types";
import ColumnsContainer from "./ColumnsContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensors,
  useSensor,
  DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>(() => {
    // Load columns from localStorage if available
    const savedColumns = localStorage.getItem("columns");
    return savedColumns ? JSON.parse(savedColumns) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [history, setHistory] = useState<
    { columns: Column[]; tasks: Task[] }[]
  >([{ columns, tasks }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const columnId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  //tells us which contacts are drag events and which are not
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, //5px distance
      },
    })
  );

  // Save columns and tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("columns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleClick = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  };

  useEffect(() => {
    // Ensure we're adding new states only when changes happen and not when undo/redo occurs
    if (historyIndex === history.length - 1) {
      setHistory([...history, { columns, tasks }]);
    } else {
      const updatedHistory = history.slice(0, historyIndex + 1); // Remove future history when there's a new change
      setHistory([...updatedHistory, { columns, tasks }]);
    }
  }, [columns, tasks]); // Only push changes when columns or tasks change

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      setColumns(previousState.columns);
      setTasks(previousState.tasks);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setColumns(nextState.columns);
      setTasks(nextState.tasks);
    }
  };

  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  };

  const generateId = () => {
    return Math.floor(Math.random() * 10001);
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    // This logic over here makes sure the replacement of one column overlaps another and the replacement is done.
    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );

      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    //To drop a card over another card
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }
    //To Drop a card to another column

    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  //to change columns name
  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  };

  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: Id) => {
    const newTask = tasks.filter((task) => task.id !== id);
    setTasks(newTask);
  };

  const updateTask = (id: Id, content: string) => {
    const newTask = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTask);
  };

  return (
    <div
      className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden
    px-[40px]"
    >
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={undo}
          disabled={historyIndex === 0}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md disabled:bg-gray-400 hover:bg-blue-600 transition duration-200"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={historyIndex === history.length - 1}
          className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md disabled:bg-gray-400 hover:bg-green-600 transition duration-200"
        >
          Redo
        </button>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnId}>
              {columns.map((col) => (
                <ColumnsContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={handleClick}
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2"
          >
            <PlusIcon />
            Add Column
          </button>
        </div>

        {/* this creates a place in the dom to cast an overlay where the dragged item will sit*/}
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnsContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                updateTask={updateTask}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
