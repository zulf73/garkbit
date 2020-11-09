import _ from 'lodash';
import Config from '../../../config';
import Fetch from 'isomorphic-fetch';
import { handleError } from '../../Modules/Error/erroractions';

export const addPhoto = (files, galleryId) => {
    return dispatch => {

        dispatch(startUpload());

        let formData = new FormData();
        _.each(files, (f) => {
            formData.append('photo', f);
        });
        formData.append('galleryId', galleryId);

        return Fetch(Config.API_URL + '/photos', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => {
            dispatch(endUpload());
            if (json.error) {
                dispatch(addPhotoError(json.error));
            }
            dispatch(didAddPhoto(json.photos));
            return;
        })
        .catch(function(e) {
            handleError(dispatch, e, 'Error adding new photo');
        })
    }
}

const didAddPhoto = (photos) => ({ type: 'ADD_PHOTO', photos });
const addPhotoError = (error) => ({ type: 'ADD_PHOTO_ERROR', error });
const startUpload = () => ({ type: 'START_UPLOAD' });
const endUpload = () => ({ type: 'END_UPLOAD' });
