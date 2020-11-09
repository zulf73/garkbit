const error = (state = { hasError: false, error: '', message: '' }, action) => {
    switch (action.type) {
        case 'SET_ERROR':
            return { hasError: true, error: action.error, message: action.message };
        case 'CLEAR_ERROR':
            return { hasError: false, error: '', message: '' };
        default:
            return state;
    }
}

export default error;
