import _ from 'lodash';
import update from 'immutability-helper';

const galleriesPanel = (state = {'showAddGalleryModal': false, 'addSet': false}, action) => {
    let newState = {};
    switch (action.type) {
        case 'TOGGLE_ADDGALLERY_MODAL':
            newState = {...state};
            if (state.showAddGalleryModal) {
                newState.showAddGalleryModal = false;
            } else {
                newState.showAddGalleryModal = true;
            }
            newState.addSet = action.addSet;
            return newState;
        default:
            return state;
    }
}

export default galleriesPanel;
