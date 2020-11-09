import { combineReducers } from 'redux';
import auth from './modules/Auth/authreducers';
import error from './modules/Error/errorreducers';
import gallery from './modules/Gallery/galleryreducers';
import galleries from './modules/Galleries/galleriesreducers';
import photos from './modules/Photos/photosreducers';
import galleriesPanel from './components/GalleriesPanel/galleriespanelreducers';
import photoGrid from './components/PhotoGrid/photogridreducers';
import photoDetailView from './components/PhotoDetailView/photodetailviewreducers';
import addPhotoView from './components/AddPhoto/addphotoreducers';

const rootReducer = combineReducers({
    auth,
    error,
    gallery,
    galleries,
    photos,
    galleriesPanel,
    photoGrid,
    photoDetailView,
    addPhotoView,
});

export default rootReducer;
