import _ from 'lodash';
import Config from '../../../config';
import Fetch from 'isomorphic-fetch';
import { handleError } from '../Error/erroractions';

/*
    THUNKS
*/

export const loadGalleries = () => {
    return dispatch => {
        return Fetch(Config.API_URL + '/galleries', {
            credentials: 'same-origin',
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => dispatch(didLoadGalleries(json.galleries)))
        .catch(function(e) {
            handleError(dispatch, e, 'Error loading galleries');
        });
    }
}

export const addGallery = (name, parentId, isSet) => {
    return ( dispatch ) => {
        return Fetch(Config.API_URL + '/galleries', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: 'name=' + name + '&parentId=' + parentId + '&isSet=' + isSet,
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => dispatch(didAddGallery(json.gallery)))
        .catch(function(e) {
            handleError(dispatch, e, 'Error adding gallery');
        })
    }
}

export const updateGallery = (id, name, parentId) => {
    return ( dispatch ) => {
        return Fetch(Config.API_URL + '/galleries/' + id, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: 'name=' + name,
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => dispatch(didUpdateGallery(id, name, parentId)))
        .catch(function(e) {
            handleError(dispatch, e, 'Error updating gallery');
        })
    }
}

export const deleteGallery = (id, parentId) => {
    return ( dispatch ) => {
        return Fetch(Config.API_URL + '/galleries/' + id, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => dispatch(didDeleteGallery(id, parentId)))
        .catch(function(e) {
            handleError(dispatch, e, 'Error deleting gallery');
        })
    }
}

/*
    Note: in this function, it's important to remove the photo from the old gallery
    before adding to the new gallery in order to preserve parent/child consistency
*/
export const addPhotoToGallery = (photoId, galleryId) => {
    return ( dispatch ) => {
        return Fetch(Config.API_URL + '/galleries/' + galleryId + '/photo/' + photoId, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(json => {
            return dispatch(didAddPhotoToGallery(photoId, galleryId))
        })
        .catch(function(e) {
            handleError(dispatch, e, 'Error adding photo to gallery');
        })
    }
}

/*
    ACTION CREATORS
*/

const didLoadGalleries = (galleries) => ({ type: 'LOAD_GALLERIES', galleries });
const didAddGallery = (gallery) => ({ type: 'ADD_GALLERY', gallery });
const didUpdateGallery = (id, name, parentId) => ({ type: 'UPDATE_GALLERY', id, name, parentId });
const didDeleteGallery = (id, parentId) => ({ type: 'DELETE_GALLERY', id, parentId });
const didAddPhotoToGallery = (photoId, galleryId) => ({ type: 'ADD_PHOTO_TO_GALLERY', photoId, galleryId });
