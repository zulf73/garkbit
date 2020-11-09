import Config from '../../../config';
import Fetch from 'isomorphic-fetch';
import { handleError } from '../../Modules/Error/erroractions';

/*
    THUNKS
*/

export const updatePhoto = (id, caption) => {
    return dispatch => {
        return Fetch(Config.API_URL + '/photos/' + id, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: 'caption=' + caption,
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => dispatch(didUpdatePhoto(id, caption, json.success)))
        .catch(function(e) {
            handleError(dispatch, e, 'Error updating photo details');
        });
    }
}

/*
    ACTION CREATORS
*/

export const clearMessages = () => {
    return dispatch => { dispatch({ type: 'CLEAR_MESSAGES' }); }
}

const didUpdatePhoto = (id, caption, success) => ({ type: 'UPDATE_PHOTO', id, caption, success });
