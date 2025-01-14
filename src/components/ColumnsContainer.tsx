import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (ColumnId: Id) => void;
  tasks: Task[];
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}

const ColumnsContainer = (props: Props) => {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
  } = props;
  const [editMode, setEditMode] = useState(false);

  //dnd kit prop to perform actions of dragging
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  //make transition between two or more columns when dragged above one another
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className=" opacity-40 border-2 border-rose-500 bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px]rounded-md flex flex-col"
      ></div>
    );
  }

  return (
    <div
      //make dnd-kit-library to handle our div
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px]rounded-md flex flex-col"
    >
      {/* title */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="
      bg-mainBackgroundColor
      text-md 
      h-[60px]
      cursor-grab
      rounded-md
      rounded-b-none
      p-3
      font-bold
      border-columnBackgroundColor
      border-4
      flex
      items-center
      justify-between
      "
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full">
            0
          </div>
          {!editMode && column.title}
          {editMode && (
            <input
              className="bg-black border focus:border-rose-500 "
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        <button
          onClick={() => {
            deleteColumn(column.id);
          }}
          className=" stroke-gray-500 hover:stroke-red-500 hover:bg-columnBackgroundColor rounded px-1 py-2 "
        >
          <TrashIcon />
        </button>
      </div>
      {/* main task container */}
      <div className="flex flex-grow flex-col gap-2 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      {/* footer */}
      <button
        className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor
      hover:text-orange-400
      active:bg-black"
        onClick={() => createTask(column.id)}
      >
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
};

export default ColumnsContainer;
