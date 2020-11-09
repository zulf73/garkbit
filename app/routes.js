import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/index';
import Login from './components/Login/login';
import WelcomeView from './components/WelcomeView/welcomeview';
import PhotosView from './components/PhotosView/photosview';
import GalleriesPanel from './components/GalleriesPanel/galleriespanel';
import GalleryView from './components/GalleryView/galleryview';

export default (
    <div>
        <Route name="app" component={ App } path="/">
            <IndexRoute components={{ sidebar: GalleriesPanel, content: WelcomeView }} />
            <Route path="/photos" components={{ sidebar: GalleriesPanel, content: PhotosView }} />
            <Route path="/gallery/:galleryId" components={{ sidebar: GalleriesPanel, content: GalleryView }} />
        </Route>
        <Route name="login" component={ Login } path="/login" />
    </div>
);
