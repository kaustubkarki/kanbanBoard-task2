import { render, screen, fireEvent } from "@testing-library/react";
import KanbanBoard from "../components/KanbanBoard";

describe("KanbanBoard Integration Tests", () => {
  it("should add a new column", () => {
    render(<KanbanBoard />);

    const addButton = screen.getByText("Add Column");
    fireEvent.click(addButton);

    // Assuming that after clicking the button, the first column title is 'Column 1'
    expect(screen.getByText("Column 1")).toBeInTheDocument();
  });

  it("should persist columns and tasks in localStorage", () => {
    render(<KanbanBoard />);

    const addButton = screen.getByText("Add Column");
    fireEvent.click(addButton);

    // Check localStorage
    const storedColumns = JSON.parse(localStorage.getItem("columns") || "[]");
    expect(storedColumns.length).toBe(2);
    expect(storedColumns[0].title).toBe("Column 1");
  });
});
