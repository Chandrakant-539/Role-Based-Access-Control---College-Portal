import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // CRITICAL: Allows the browser to send/receive JWT cookies
})

/**
 * --- HTTP METHOD WRAPPERS ---
 */
export const get = (url, params) => instance.get(url, { params })
export const post = (url, data) => instance.post(url, data)
export const put = (url, data) => instance.put(url, data)

// --- THE FIX ---
// We define 'del' for new code, but export 'deleteUser' to prevent the 
// White Screen crash in existing components (UsersTable, ApprovalRequests).
export const del = (url) => instance.delete(url)
export const deleteUser = del; 

/**
 * --- REQUEST INTERCEPTOR ---
 */
instance.interceptors.request.use(function (config) {
    return config;
}, function (error) {
    return Promise.reject(error);
});

/**
 * --- RESPONSE INTERCEPTOR ---
 */
instance.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response) {
        const { status } = error.response;

        // 401: Unauthorized / Session Expired
        if (status === 401) {
            console.warn("Session Expired. Redirecting to login...");
        }

        // 403: Forbidden / Role Mismatch
        if (status === 403) {
            console.error("Zero Trust Violation: Permission Denied.");
        }
    }

    return Promise.reject(error);
});

export default instance;
