import { useEffect, useState } from 'react';
import {
  useCreateToDoMutation,
  useDeleteToDoMutation,
  useLazyGetToDosQuery,
  useUpdateToDoMutation,
} from './todoApiSlice';
import type { ToDo } from './todoApiSlice';

export function useTodoController() {
  const [triggerGetToDosQuery, { data: toDos }] = useLazyGetToDosQuery();
  const [triggerCreateToDoMutation] = useCreateToDoMutation();
  const [triggerUpdateToDoMutation] = useUpdateToDoMutation();
  const [triggerDeleteToDoMutation] = useDeleteToDoMutation();
  const [todoInput, setTodoInput] = useState('');

  useEffect(() => {
    triggerGetToDosQuery();
  }, [triggerGetToDosQuery]);

  const addTodo = () => {
    if (!todoInput.trim()) return;
    triggerCreateToDoMutation({ title: todoInput.trim(), isDone: false });
    setTodoInput('');
  };

  const toggleDone = (todo: ToDo) => {
    triggerUpdateToDoMutation({ ...todo, isDone: !todo.isDone });
  };

  const deleteTodo = async (id: number) => {
    await triggerDeleteToDoMutation(id).unwrap();
    triggerGetToDosQuery();
  };

  return {
    toDos: toDos ?? [],
    todoInput,
    setTodoInput,
    addTodo,
    toggleDone,
    deleteTodo,
  };
}
