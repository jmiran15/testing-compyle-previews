import { useState, useCallback, useMemo } from "react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Taskflow — Elegant Todo App" },
    { name: "description", content: "A beautiful, minimal todo application" },
  ];
};

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type FilterType = "all" | "active" | "completed";

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "1",
      text: "Welcome to Taskflow! Add your first task above",
      completed: false,
      createdAt: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const addTodo = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = inputValue.trim();
      if (!text) return;

      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: new Date(),
      };

      setTodos((prev) => [newTodo, ...prev]);
      setInputValue("");
    },
    [inputValue]
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, []);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [todos]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header__title">Taskflow</h1>
        <p className="header__subtitle">Organize your day, one task at a time</p>
      </header>

      <div className="stats">
        <div className="stat">
          <div className="stat__value">{stats.total}</div>
          <div className="stat__label">Total</div>
        </div>
        <div className="stat">
          <div className="stat__value">{stats.active}</div>
          <div className="stat__label">Active</div>
        </div>
        <div className="stat">
          <div className="stat__value">{stats.completed}</div>
          <div className="stat__label">Done</div>
        </div>
      </div>

      <form className="add-form" onSubmit={addTodo}>
        <input
          type="text"
          className="add-form__input"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
        <button type="submit" className="add-form__button">
          Add Task
        </button>
      </form>

      <div className="filters">
        {(["all", "active", "completed"] as FilterType[]).map((filterType) => (
          <button
            key={filterType}
            className={`filter-button ${
              filter === filterType ? "filter-button--active" : ""
            }`}
            onClick={() => setFilter(filterType)}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div className="task-list">
        {filteredTodos.length === 0 ? (
          <div className="task-list--empty">
            <div className="task-list--empty__icon">
              {filter === "completed" ? "✨" : "📝"}
            </div>
            <p className="task-list--empty__text">
              {filter === "completed"
                ? "No completed tasks yet"
                : filter === "active"
                ? "All tasks completed!"
                : "No tasks yet. Add one above!"}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo, index) => (
            <div
              key={todo.id}
              className={`task ${todo.completed ? "task--completed" : ""}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <label className="task__checkbox">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className="task__checkbox-custom" />
              </label>
              <div className="task__content">
                <p className="task__text">{todo.text}</p>
                <p className="task__date">{formatDate(todo.createdAt)}</p>
              </div>
              <button
                className="task__delete"
                onClick={() => deleteTodo(todo.id)}
                aria-label="Delete task"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {stats.completed > 0 && (
        <button className="clear-completed" onClick={clearCompleted}>
          Clear {stats.completed} completed task{stats.completed !== 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

