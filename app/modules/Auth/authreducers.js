const auth = (state = { error: '', message: '', content: '', isAuthenticated: false }, action) => {
    switch (action.type) {
        case 'LOGIN_USER':
            return { ...state, error: '', message: '', isAuthenticated: true };
        case 'LOGOUT_USER':
            return { ...state, isAuthenticated: false };
        case 'LOGIN_ERROR':
            return { ...state, error: action.message };
        default:
            return state;
    }
}

export default auth;
