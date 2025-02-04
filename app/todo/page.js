
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

export default function TodoPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Load todos from LocalStorage
  const getTodos = () => {
    if (typeof window !== 'undefined') {
      const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
      return storedTodos;
    }
    return [];
  };

  // Fetch Todos
  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
    initialData: [],
  });

  // Save Todos to LocalStorage
  const saveTodos = (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos));
    queryClient.invalidateQueries(['todos']); // Refresh UI
  };

  // Create Todo
  const createTodo = useMutation({
    mutationFn: () => {
      const newTodo = { id: uuidv4(), title, isCompleted: false };
      const updatedTodos = [...todos, newTodo];
      saveTodos(updatedTodos);
    },
    onSuccess: () => setTitle(''),
  });

  // Update Todo
  const updateTodo = useMutation({
    mutationFn: () => {
      const updatedTodos = todos.map((todo) =>
        todo.id === editId ? { ...todo, title: editTitle } : todo
      );
      saveTodos(updatedTodos);
    },
    onSuccess: () => {
      setEditId(null);
      setEditTitle('');
    },
  });

  // Delete Todo
  const deleteTodo = useMutation({
    mutationFn: (id) => {
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      saveTodos(updatedTodos);
    },
  });

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Todo List </h1>

      {/* Add Todo */}
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new todo"
          className="border p-2 flex-1"
        />
        <button onClick={() => createTodo.mutate()} className="bg-blue-500 text-white px-4 py-2">
          Add
        </button>
      </div>

      {/* Todo List */}
      <ul className="mt-4">
        {todos.map((todo) => (
          <li key={todo.id} className="flex justify-between items-center p-2 border-b">
            {editId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border p-1 flex-1"
                />
                <button onClick={() => updateTodo.mutate()} className="ml-2 bg-green-500 text-white px-2 py-1">
                  Save
                </button>
              </>
            ) : (
              <>
                <span>{todo.title}</span>
                <div>
                  <button
                    onClick={() => {
                      setEditId(todo.id);
                      setEditTitle(todo.title);
                    }}
                    className="mr-2 text-yellow-500"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteTodo.mutate(todo.id)} className="text-red-500">
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
