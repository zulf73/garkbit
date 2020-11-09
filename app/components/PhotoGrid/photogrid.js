import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Alert, Button, Modal } from 'react-bootstrap';
import Confirm from '../Confirm/confirm';
import GridThumbnail from './GridThumbnail/gridthumbnail';
import PhotoDetailView from '../PhotoDetailView/photodetailview';
import { toggleCannotSortDialog } from './photogridactions';
import { deletePhoto, removePhotoFromGallery } from '../../modules/Photos/photosactions';

class PhotoGrid extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            'photoForDetailView': {},
            'showPhotoDetailView': false,
            'selectedPhotoIds': [],
            'showConfirmRemoveDialog': false,
            'confirmRemoveDialogBody': "Are you sure you want to remove the selected photos from this gallery?",
            'showConfirmDeleteDialog': false,
            'confirmDeleteDialogBody': "Are you sure you want to delere the selected photosy?"
        };
    }

    componentWillReceiveProps (nextProps) {
        const selectedPhotos = nextProps.photos.filter(function (p) {
            return p.isSelected;
        });
        const selectedPhotoIds = selectedPhotos.map(p => p.id);
        this.setState({ 'selectedPhotoIds': selectedPhotoIds });
    }

    handleDeleteKeyPress = (e) => {
        if (e.keyCode === 46) {
            // Don't allow deleting photos from a gallery set
            if (this.props.gallery && this.props.gallery.isSet) {
                this.toggleCannotRemoveDialog();
                return false;
            }
            if (this.state.selectedPhotoIds.length > 0) {
                if (this.props.gallery) {
                    this.setState({
                        'showConfirmRemoveDialog': true,
                        'confirmRemoveDialogBody': 'Are you sure you want to remove ' + this.state.selectedPhotoIds.length + ' selected photos from this gallery?',
                    });
                } else {
                    this.setState({
                        'showConfirmDeleteDialog': true,
                        'confirmDeleteDialogBody': 'Are you sure you want to delete ' + this.state.selectedPhotoIds.length + ' selected photos?',
                    });
                }
            }
        }
    }

    handleRemoveDialogCancel = () => {
        this.setState({ 'showConfirmRemoveDialog': false });
    }

    handleDeleteDialogCancel = () => {
        this.setState({ 'showConfirmDeleteDialog': false });
    }

    handleRemoveFromGallery = () => {
        const props = this.props;
        this.state.selectedPhotoIds.forEach(function (p) {
            props.removePhotoFromGallery(props.gallery.id, p);
        });
        this.setState({ 'showConfirmRemoveDialog': false });
    }

    handleDelete = () => {
        const props = this.props;
        this.state.selectedPhotoIds.forEach(function (p) {
            props.deletePhoto(p);
        });
        this.setState({ 'showConfirmDeleteDialog': false });
    }

    toggleCannotRemoveDialog = () => {
        this.setState({ 'showCannotRemoveDialog': !this.state.showCannotRemoveDialog });
        return;
    }

    openPhotoDetailView = (photo) => {
        this.setState({ 'photoForDetailView': photo, 'showPhotoDetailView': true });
        return;
    }

    closePhotoDetailView = () => {
        this.setState({ 'photoForDetailView': {}, 'showPhotoDetailView': false });
        return;
    }

    render () {
        const props = this.props;
        const state = this.state;
        const openPhotoDetailView = this.openPhotoDetailView;

        let canSort = true;
        let cannotSortDialogBody = '';
        if (!props.gallery) {
            canSort = false;
            cannotSortDialogBody = 'Photos cannot be custom sorted in the All Photos view';
        } else {
            if (props.gallery.isSet) {
                canSort = false;
                cannotSortDialogBody = 'Photos cannot be custom sorted in a gallery set. You can sort them in the individual gallery.';
            }
            if (!props.gallery.isSet && props.gallery.sortBy !== 'pos') {
                canSort = false;
                cannotSortDialogBody = 'You must change the sort order for this gallery to "custom" before manually sorting.';
            }
        }

        let galleryId;
        let isGallerySet;
        if (props.gallery) {
            galleryId = props.gallery.id;
            isGallerySet = props.gallery.isSet;
        }

        const photos = props.photos.map(function(photo, i) {
            return (
                <GridThumbnail key={photo.id} galleryId={galleryId} isGallerySet={isGallerySet} photo={photo} i={i} canSort={canSort} selectedPhotoIds={state.selectedPhotoIds} onOpenDetailView={openPhotoDetailView} />
            );
        });

        return (
            <div className={css(styles.photoGrid) + ' clear'} tabIndex="0" onKeyUp={this.handleDeleteKeyPress}>
                {props.photoGrid.hasError &&
                    <Alert bsSize="small" bsStyle="danger">
                        <h4>Error</h4>
                        There was a problem uploading the following images: {props.photoGrid.error.errorFiles.join(", ")}.
                        This is likely because they are not valid JPEG images.
                    </Alert>
                }
                <Confirm
                    onConfirm={this.handleRemoveFromGallery}
                    onCancel={this.handleRemoveDialogCancel}
                    showActionButton={false}
                    show={this.state.showConfirmRemoveDialog}
                    body={this.state.confirmRemoveDialogBody}
                    confirmText="Remove"
                    title="Remove Photos from Gallery">
                </Confirm>
                <Confirm
                    onConfirm={this.handleDelete}
                    onCancel={this.handleDeleteDialogCancel}
                    showActionButton={false}
                    show={this.state.showConfirmDeleteDialog}
                    body={this.state.confirmDeleteDialogBody}
                    confirmText="Delete"
                    title="Delete Photos">
                </Confirm>
                <Modal show={this.state.showCannotRemoveDialog} onHide={this.toggleCannotRemoveDialog} >
                    <Modal.Header closeButton>
                        <Modal.Title>Cannot Remove Photos from Gallery Set</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        You cannot remove photos directly from a gallery set. Remove the photo from
                        the gallery it is in.
                    </Modal.Body>
                </Modal>
                <Modal show={props.photoGrid.showCannotSortDialog} onHide={props.toggleCannotSortDialog} >
                    <Modal.Header closeButton>
                        <Modal.Title>Cannot Sort Photo</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {cannotSortDialogBody}
                    </Modal.Body>
                </Modal>
                {this.state.showPhotoDetailView &&
                    <PhotoDetailView photo={this.state.photoForDetailView} show={this.state.showPhotoDetailView} onClose={this.closePhotoDetailView} />
                }
                {photos}
            </div>
        );
    }
}

PhotoGrid.PropTypes = {
    photos: PropTypes.array.isRequired,
    gallery: PropTypes.object,
    deletePhoto: PropTypes.func.isRequired,
    removePhotoFromGallery: PropTypes.func.isRequired,
    toggleCannotSortDialog: PropTypes.func.isRequired,
}

export default connect(
    (state) => {
        return {
            photoGrid: state.photoGrid,
        };
    },
    { deletePhoto, removePhotoFromGallery, toggleCannotSortDialog }
)(PhotoGrid);

const styles = StyleSheet.create({
    photoGrid: {
        padding: '15px',
        ':focus': {
            outline: 'none',
            boxShadow: 'none',
        }
    },
});
