import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import config from '../config';

const baseQuery = fetchBaseQuery({
    baseUrl: config.baseUrl,
    prepareHeaders(headers) {
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
