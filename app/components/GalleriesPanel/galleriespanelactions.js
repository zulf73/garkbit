import _ from 'lodash';
import Config from '../../../config';
import Fetch from 'isomorphic-fetch';

export const toggleAddGalleryModal = (addSet) => {
    return dispatch => {
        return dispatch({ type: 'TOGGLE_ADDGALLERY_MODAL', addSet });
    }
}

const didNotMovePhotoToGallery = () => ({ type: 'DID_NOT_ADD_PHOTO_TO_GALLERY' });
