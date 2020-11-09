const addPhotoView = (state = { 'isUploading': false }, action) => {
    let newState = {};
    switch (action.type) {
        case 'START_UPLOAD':
            return { 'isUploading': true };
        case 'END_UPLOAD':
            return { 'isUploading': false };
        default:
            return state;
    }
}

export default addPhotoView;
