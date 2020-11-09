import Config from '../../../config';
import Fetch from 'isomorphic-fetch';

/*
    THUNKS
*/

export const loadAllPhotos = () => {
    return dispatch => {
        return Fetch(Config.API_URL + '/photos/')
        .then(response => response.json())
        .then(json => dispatch(didLoadPhotos(json.photos)))
        .catch(function(e) {
            console.log('--Load Photos--');
            console.log(e);
        })
    }
}

export const loadPhotosByGallery = (galleryId) => {
    return dispatch => {
        return Fetch(Config.API_URL + '/galleries/' + galleryId + '/photos/')
        .then(response => response.json())
        .then(json => dispatch(didLoadPhotos(json.photos)))
        .catch(function(e) {
            console.log('--Load Photos By Gallery--');
            console.log(e);
        })
    }
}

export const unloadPhotos = () => {
    return dispatch => { dispatch(didUnloadPhotos()) }
}

export const updatePhoto = (id, name) => {
    return dispatch => {
        return Fetch(Config.API_URL + '/galleries/' + id, {
            method: 'POST',
            headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: 'name=' + name,
        })
        .then(response => response.json())
        .then(json => dispatch(didUpdateGallery(json.gallery.id, json.gallery.name)))
        .catch(function(e) {
            console.log('--Update Photo--');
            console.log(e);
        })
    }
}

export const deletePhoto = (id) => {
    return dispatch => {
        return Fetch(Config.API_URL + '/photos/' + id, {
            method: 'DELETE',
            headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
        })
        .then(response => response.json())
        .then(json => dispatch(didDeletePhoto(id)))
        .catch(function(e) {
            console.log('--Delete Photo--');
            console.log(e);
        })
    }
}

export const removePhotoFromGallery = (galleryId, photoId) => {
    return dispatch => {
        return Fetch(Config.API_URL + '/galleries/' + galleryId + '/photo/' + photoId, {
            method: 'DELETE',
            headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
        })
        .then(response => response.json())
        .then(json => dispatch(didRemovePhoto(photoId)))
        .catch(function(e) {
            console.log('--Delete Photo--');
            console.log(e);
        })
    }
}

export const togglePhotoSelect = (id) => {
    return dispatch => { dispatch(didTogglePhotoSelect(id)); }
}

export const sortPhoto = (galleryId, photoId, targetId, direction) => {
    return dispatch => {
        return Fetch(Config.API_URL + '/galleries/' + galleryId + '/photo/' + photoId + '/sort', {
            method: 'PUT',
            headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
            body: 'targetId=' + targetId + '&direction=' + direction,
        })
        .then(response => response.json())
        .then(json => dispatch(didSortPhoto(photoId, targetId)))
        .catch(function(e) {
            console.log('--Sort Photo--');
            console.log(e);
        })
    }
}

export const movePhoto = (dragIndex, hoverIndex) => {
    return dispatch => { dispatch(didMovePhoto(dragIndex, hoverIndex)); }
}

/*
    ACTION CREATORS
*/

const didLoadPhotos = (photos) => ({ type: 'LOAD_PHOTOS', photos });
const didUnloadPhotos = () => ({ type: 'UNLOAD_PHOTOS' });
const didUpdatePhoto = (id, name) => ({ type: 'UPDATE_PHOTO', id, name });
const didDeletePhoto = (id) => ({ type: 'DELETE_PHOTO', id });
const didRemovePhoto = (id) => ({ type: 'DELETE_PHOTO', id });
const didTogglePhotoSelect = (id) => ({ type: 'TOGGLE_PHOTO_SELECT', id });
const didSortPhoto = (id, targetId) => ({ type: 'SORT_PHOTO', id, targetId });
const didMovePhoto = (dragIndex, hoverIndex) => ({ type: 'MOVE_PHOTO', dragIndex, hoverIndex });
