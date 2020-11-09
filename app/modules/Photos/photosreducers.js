import _ from 'lodash';
import update from 'immutability-helper';

export const photos = (state = [], action) => {
    let newState = [];
    let index = 0;
    switch (action.type) {
        case 'LOAD_PHOTOS':
            newState = action.photos;
            return newState;
        case 'ADD_PHOTO':
            const newPhotos = action.photos.filter((p) => {
                if (!_.isUndefined(p.existedInGallery) && p.existedInGallery) {
                    return false;
                }
                return true;
            });
            newState = [...state, ...newPhotos];
            return newState;
        case 'UPDATE_PHOTO': {
            index = _.findIndex(state, { id: action.id });
            newState = update(state, { [index]: { title: { $set: action.title }, caption: { $set: action.caption }}});
            return newState;
        }
        case 'DELETE_PHOTO': {
            index = _.findIndex(state, {id: action.id});
            newState = [...state];
            _.pullAt(newState, index);
            return newState;
        }
        case 'SORT_PHOTO': {
            return state;
        }
        case 'MOVE_PHOTO': {
            newState = [...state];
            const itemToMove = newState[action.dragIndex];
            _.pullAt(newState, action.dragIndex);
            newState.splice(action.hoverIndex, 0, itemToMove);
            return newState;
        }
        case 'TOGGLE_PHOTO_SELECT': {
            index = _.findIndex(state, {id: action.id});
            if (state[index].isSelected) {
                newState = update(state, {[index]: {isSelected: {$set: false}}});
            } else {
                newState = update(state, {[index]: {isSelected: {$set: true}}});
            }
            return newState;
        }
        case 'MOVE_PHOTO_TO_GALLERY': {
            return state;
        }
        case 'UNLOAD_GALLERY': {
            return newState;
        }
        case 'UNLOAD_PHOTOS': {
            return newState;
        }
        default:
            return state;
    }
}

export default photos;
