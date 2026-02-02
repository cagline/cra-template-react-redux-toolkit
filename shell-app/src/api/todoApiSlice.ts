import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQueryWithReauth} from './interceptorsSlice';

interface ToDo {
    id: number;
    isDone: boolean;
    title: string;
}

export const apiSlice = createApi({
    reducerPath: 'todo',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['todo'], // There are some other advance cache Recipes like > Optimistic Updates > Pessimistic Updates ...
    endpoints: builder => ({
        getToDos: builder.query<any, number | void>({
            query: (_limit = 10) => ({
                url : `/todos`,
            }),
            providesTags: ['todo'],
        }),
        getToDo: builder.query<ToDo, number | void>({
            query: (id) => ({
                url : `/todos`,
                params: { id }
            }),
        }),
        createToDo: builder.mutation<any, any>({
            query: (data) => ({
                url: 'todos',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['todo'],
        }),
        updateToDo: builder.mutation<ToDo, ToDo>({
            query: (data: any) => ({
                url: `todos/${data.id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['todo']
        }),
        deleteToDo: builder.mutation<ToDo, number>({
            query: (id) => ({
                url: `todos/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['todo']
        }),
    }),
});

export const {useLazyGetToDosQuery, useLazyGetToDoQuery,  useCreateToDoMutation, useUpdateToDoMutation, useDeleteToDoMutation} = apiSlice;
