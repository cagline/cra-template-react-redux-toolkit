import {BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError,} from '@reduxjs/toolkit/query'
// import { tokenReceived, loggedOut } from './authSlice'
const DOG_API_KEY = "ef867ca0-a6f4-4871-9135-907d77e7a21f";

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3001',
    prepareHeaders(headers) {
        headers.set('x-api-key', DOG_API_KEY);
        headers.set('Content-Type', 'application/json')
        return headers;
    }
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs,
    unknown,
    FetchBaseQueryError> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    console.info('interceptors', result);
    if (result.error && result.error.status === 401) {
        // try to get a new token
        const refreshResult = await baseQuery('/refreshToken', api, extraOptions);
        if (refreshResult.data) {
            // store the new token
            // api.dispatch(tokenReceived(refreshResult.data))
            // retry the initial query
            result = await baseQuery(args, api, extraOptions)
        } else {
            // api.dispatch(loggedOut())
        }
    }
    return result
};
