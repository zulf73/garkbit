export const photoGrid = (state = { 'showCannotSortDialog': false, 'hasError': false, 'error': null }, action) => {
    let newState = {};
    switch (action.type) {
        case 'TOGGLE_CANNOT_SORT_DIALOG':
            newState = {...state};
            if (state.showCannotSortDialog) {
                newState.showCannotSortDialog = false;
            } else {
                newState.showCannotSortDialog = true;
            }
            return newState;
        case 'ADD_PHOTO_ERROR':
            newState = {...state};
            newState.hasError = true;
            newState.error = action.error;
            return newState;
        default:
            return state;
    }
}

export default photoGrid;
