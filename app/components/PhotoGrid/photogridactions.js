import Config from '../../../config';
import Fetch from 'isomorphic-fetch';

/*
    THUNKS
*/

export const toggleCannotSortDialog = () => {
    return dispatch => { dispatch(didToggleCannotSortDialog()); }
}

/*
    ACTION CREATORS
*/

const didToggleCannotSortDialog = () => ({ type: 'TOGGLE_CANNOT_SORT_DIALOG' });
