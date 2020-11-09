import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Modal, OverlayTrigger, Popover, Row, Col, FormControl } from 'react-bootstrap';
import PhotoGrid from '../PhotoGrid/photogrid';
import AddPhoto from '../AddPhoto/addphoto';
import GallerySortSelect from './GallerySortSelect/gallerysortselect';
import GalleryHeader from './GalleryHeader/galleryheader';
import { loadGallery, unloadGallery } from '../../modules/Gallery/galleryactions';
import { loadPhotosByGallery } from '../../modules/Photos/photosactions';

class GalleryView extends React.Component {
    constructor (props, context) {
        super(props, context);
        this.state = { 'showDropZone': false };
    }

    componentWillMount() {
        this.props.loadGallery(this.props.params.galleryId);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.galleryId !== this.props.params.galleryId) {
            this.props.loadGallery(nextProps.params.galleryId);
        }

        /* Reload if we've changed galleries
           OR if we've changed the sort method for a gallery
           BUT NOT if we've deleted the gallery
        */
        if (
            (nextProps.gallery.id !== this.props.gallery.id && !_.isUndefined(nextProps.gallery.id))
            || nextProps.gallery.sortBy !== this.props.gallery.sortBy
        ) {
            this.props.loadPhotosByGallery(nextProps.gallery.id);
        }
    }

    componentWillUnmount() {
        // Unload the gallery to force a reload when we navigate away (someplace outside of galleries) and then back to this gallery
        this.props.unloadGallery();
    }

    handleFileDragEnter = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (this.props.gallery.isSet || !_.includes(e.dataTransfer.types, 'Files')) {
            return false;
        }

        this.setState({ 'showDropZone': true });
    }

    handleFileDragOver = (e) => {
        if (_.includes(e.dataTransfer.types, 'Files')) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    handleFileDragLeave = (e) => {
        if (!_.isUndefined(e)) {
            e.preventDefault();
        }

        this.setState({ 'showDropZone': false });
    }

    render () {
        const props = this.props;

        const embedLink = '<div class="garkbit" id="gb_' + props.gallery.id + '"></div>';

        const embedPop = (
            <Popover id="embedCode" title="Embed Code" bsStyle={css(styles.overlay)}>
                <div className={css(styles.embedLinkBox)}>{embedLink}</div>
            </Popover>
        );

        return (
            <div className={css(styles.galleryView)} ref="photoDrop" onDragOver={this.handleFileDragOver} onDragEnter={this.handleFileDragEnter}>
                <GalleryHeader gallery={props.gallery} />
                <div className={css(styles.galleryOptions) + ' clear'}>
                    {!props.gallery.isSet &&
                        <div className={css(styles.left)} style={{ marginRight: 10 }}>
                            <AddPhoto galleryId={props.gallery.id} showDropZone={this.state.showDropZone} onDragLeave={this.handleFileDragLeave} />
                        </div>
                    }
                    <div className={css(styles.left)}>
                        <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={embedPop}>
                            <Button bsSize="small">Get Embed Code</Button>
                        </OverlayTrigger>
                    </div>
                    <div className={css(styles.right)}>
                        <GallerySortSelect gallery={props.gallery} />
                    </div>
                </div>
                <PhotoGrid photos={props.photos} gallery={props.gallery} />
            </div>
        );
    }
}

GalleryView.PropTypes = {
    gallery: PropTypes.object.isRequired,
    loadGallery: PropTypes.func.isRequired,
    unloadGallery: PropTypes.func.isRequired,
    photos: PropTypes.array.isRequired,
}

GalleryView = connect(
    (state) => {
        return {
            gallery: state.gallery,
            photos: state.photos,
        };
    },
    { loadGallery, unloadGallery, loadPhotosByGallery }
)(GalleryView);

export default GalleryView;

const styles = StyleSheet.create({
    overlay: {
        width: 400,
    },
    galleryView: {
        position: 'relative',
        height: '100%',
    },
    galleryOptions: {
        padding: 20,
    },
    embedLinkBox: {
        border: '1px solid #888888',
        backgroundColor: '#eeeeee',
        padding: 4,
    },
    left: {
        float: 'left',
    },
    right: {
        float: 'right',
    },
});
