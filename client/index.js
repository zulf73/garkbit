import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistory, routeReducer } from 'react-router-redux';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import Routes from '../app/routes';
import configureStore from '../app/store';

const initialState = window.__INITIAL_STATE__;

const store = configureStore(initialState);

/*
const token = Cookie.load('token');
if (token) {
    store.dispatch({ type: 'LOGIN_USER' });
}
*/

render(
    <Provider store={store}>
        <Router children={Routes} history={browserHistory}/>
    </Provider>,
    document.getElementById('app')
);
