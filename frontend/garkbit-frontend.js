import Config from '../config';
import Fetch from 'isomorphic-fetch';

const garkbitPhotos = {};
const garkbitGalleries = [];

const getGalleryIdFromElement = (e) => {
    return e.id.slice(3);
}

const onThumbnailsClick = (e) => {
    e.preventDefault();
    const clickedGalleryId = getGalleryIdFromElement(e.target.parentNode.parentNode);
    openPhotoSwipe(e.target.dataset.id, clickedGalleryId);
}

const getGalleryPhotos = (galleryId) => {
    return new Promise(function(resolve, reject) {
        Fetch(Config.API_URL + '/galleries/' + galleryId + '/photos')
        .then(response => response.json())
        .then(json => {
            const photos = json.photos;
            garkbitPhotos[galleryId] = photos.map(function(photo) {
                return {
                    id: galleryId + '-' + photo.id,
                    src: Config.GARKBIT_URL + '/images/photos/' + photo.sizes.original.uri,
                    msrc: Config.GARKBIT_URL + '/images/photos/' + photo.sizes.thumb.uri,
                    w: photo.sizes.original.width,
                    h: photo.sizes.original.height,
                    title: photo.caption,
                    exif: photo.exif,
                }
            });
            garkbitGalleries.push(galleryId);
            const galleryNode = document.getElementById('gb_' + galleryId);
            photos.forEach(function(photo, i) {
                const thumbNode = document.createElement("div");
                thumbNode.className = 'gb_thumbnail-wrapper';
                const thumbImageNode = document.createElement("img");
                thumbImageNode.dataset.id = galleryId + '-' + photo.id;
                thumbImageNode.className = 'gb_thumbnail';
                thumbImageNode.src = Config.GARKBIT_URL + '/images/photos/' + photo.sizes.thumb.uri;
                thumbImageNode.style.width = photo.sizes.thumb.width + 'px';
                thumbImageNode.style.height = photo.sizes.thumb.height + 'px';
                thumbImageNode.onclick = onThumbnailsClick;
                thumbNode.appendChild(thumbImageNode);
                galleryNode.appendChild(thumbNode);
            });
            resolve();
        })
        .catch(function(e) {
            console.log(e);
            reject();
        });
    });
}

const openPhotoSwipe = function(photoId, galleryId) {
    const pswpElement = document.querySelectorAll('.pswp')[0];

    const galleryItems = [];

    if (Config.COMBINE_GALLERIES) {
        garkbitGalleries.forEach(function (k, i) {
            galleryItems.push(...garkbitPhotos[k]);
        });
    } else {
        galleryItems.push(...garkbitPhotos[galleryId]);
    }

    const index = galleryItems.map(function (i) { return i.id; }).indexOf(photoId);

    const options = {
        index: parseInt(index, 10),
        //showHideOpacity: true,
        getThumbBoundsFn: function(index) {
            var thumbnail = document.querySelectorAll("[data-id='" + photoId + "']")[0],
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect();
            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
        }
    };

    const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, galleryItems, options);
    gallery.init();
}

function garkbitInit() {
    const gbGalleryElements = document.querySelectorAll('.garkbit');
    gbGalleryElements.forEach(function(e) {
        e.className = e.className + ' gb_inline-gallery clear';
    });
    const gbGalleries = [...gbGalleryElements];
    const galleryIds = gbGalleries.map(getGalleryIdFromElement);
    /* Run in series to preserve indexes */
    galleryIds.reduce((p, id) => {
        return p = p.then(() => getGalleryPhotos(id));
    }, Promise.resolve());

}

if (document.readyState !== 'loading') {
    garkbitInit()
} else {
    document.addEventListener('DOMContentLoaded', garkbitInit)
}
