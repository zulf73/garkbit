import _ from 'lodash';

const gallery = (state = {id: '', name: '', parentId: '', sortBy: ''}, action) => {
    let newState = {};
    switch (action.type) {
        case 'LOAD_GALLERY':
            newState = action.gallery;
            return newState;
        case 'UNLOAD_GALLERY':
            return newState;
        case 'UPDATE_GALLERY':
            if (state.id === action.id) {
                newState = {...state};
                newState.name = action.name;
                return newState;
            } else {
                return state;
            }
        case 'UPDATE_GALLERY_SORT':
            newState = {...state};
            newState.sortBy = action.sort;
            return newState;
        case 'DELETE_GALLERY':
            if (state.id === action.id) {
                return {};
            } else {
                return state;
            }
        default:
            return state;
    }
}

export default gallery;
