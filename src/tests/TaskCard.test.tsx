import { render, screen } from "@testing-library/react";
import TaskCard from "../components/TaskCard";
import '@testing-library/jest-dom';

describe("TaskCard Component", () => {
  const mockTask = { id: 1, columnId: 1, content: "Test Task" };

  it("renders task content correctly", () => {
    render(
      <TaskCard task={mockTask} deleteTask={jest.fn()} updateTask={jest.fn()} />
    );
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });
});
