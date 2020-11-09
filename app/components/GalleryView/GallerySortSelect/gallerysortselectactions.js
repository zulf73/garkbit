import Config from '../../../../config';
import Fetch from 'isomorphic-fetch';
import { handleError } from '../../../Modules/Error/erroractions';

export const updateGallerySort = (id, sort) => {
    return dispatch => {
        return Fetch(Config.API_URL + '/galleries/' + id, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: 'sortBy=' + sort,
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => dispatch(didUpdateGallerySort(id, sort)))
        .catch(function(e) {
            handleError(dispatch, e, 'Error updating gallery sort method');
        })
    }
}

const didUpdateGallerySort = (id, sort) => ({ type: 'UPDATE_GALLERY_SORT', id, sort });
