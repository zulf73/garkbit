export const photoDetailView = (state = { 'isSaved': false, 'isError': false }, action) => {
    let newState = {};
    switch (action.type) {
        case 'UPDATE_PHOTO':
            newState = {...state};
            if (action.success) {
                newState.isSaved = true;
                newState.isError = false;
            } else {
                newState.isSaved = false;
                newState.isError = true;
            }
            return newState;
        case 'CLEAR_MESSAGES':
            return { 'isSaved': false, 'isError': false };
        default:
            return state;
    }
}

export default photoDetailView;
