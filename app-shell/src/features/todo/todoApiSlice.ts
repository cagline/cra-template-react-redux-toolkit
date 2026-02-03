import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../api/interceptorsSlice';

export interface ToDo {
  id: number;
  isDone: boolean;
  title: string;
}

export const todoApiSlice = createApi({
  reducerPath: 'todo',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['todo'],
  endpoints: (builder) => ({
    getToDos: builder.query<ToDo[], number | void>({
      query: (_limit = 10) => ({
        url: `/todos`,
      }),
      providesTags: ['todo'],
    }),
    getToDo: builder.query<ToDo, number | void>({
      query: (id) => ({
        url: `/todos`,
        params: { id },
      }),
    }),
    createToDo: builder.mutation<ToDo, { title: string; isDone: boolean }>({
      query: (data) => ({
        url: 'todos',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['todo'],
    }),
    updateToDo: builder.mutation<ToDo, ToDo>({
      query: (data) => ({
        url: `todos/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['todo'],
    }),
    deleteToDo: builder.mutation<void, number>({
      query: (id) => ({
        url: `todos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['todo'],
    }),
  }),
});

export const {
  useLazyGetToDosQuery,
  useLazyGetToDoQuery,
  useCreateToDoMutation,
  useUpdateToDoMutation,
  useDeleteToDoMutation,
} = todoApiSlice;
