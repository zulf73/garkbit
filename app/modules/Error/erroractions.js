import { logoutUser } from '../Auth/authactions.js';

/* UTILITY FUNCTIONS */

export const handleError = (dispatch, error, message) => {
    if (error.status === 401) {
        logoutUser(dispatch);
    } else {
        dispatch({
            type: 'SET_ERROR',
            error: error,
            message: message,
        });
        console.log(message, e);
    }
}

/* THUNKS */

export const clearError = (error) => {
    return dispatch => {
        dispatch({ type: 'CLEAR_ERROR' });
    }
}
