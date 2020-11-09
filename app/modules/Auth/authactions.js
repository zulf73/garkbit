import Config from '../../../config';
import Fetch from 'isomorphic-fetch';
import { browserHistory } from 'react-router';
import { canUseDOM } from '../../../lib/utils.js';

/*
export const logoutUser = (dispatch) => {
    dispatch(didLogout());
    if (canUseDOM) {
        browserHistory.push('/login');
    }
}
*/

export const logoutUser = (dispatch) => {
    return dispatch => {
        return Fetch(Config.API_URL + '/logout', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => {
            dispatch(didLogout());
            browserHistory.push('/login');
        })
        .catch(function(e) {
            dispatch({ type: 'LOGOUT_ERROR', message: 'There was an error logging out.' });
        });
    }
}

export const loginUser = (email, password) => {
    return dispatch => {
        return Fetch(Config.API_URL + '/login', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: 'email=' + email + '&password=' + password,
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => {
            dispatch(didLogin());
            browserHistory.push('/');
        })
        .catch(function(e) {
            dispatch({ type: 'LOGIN_ERROR', message: 'There was an error logging in. Please check your username and password.' });
            logoutUser(dispatch);
        });
    }
}

const didLogin = () => ({ type: 'LOGIN_USER' });
const didLogout = () => ({ type: 'LOGOUT_USER' });
