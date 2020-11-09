import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Modal, Glyphicon } from 'react-bootstrap';
import Confirm from '../../Confirm/confirm';
import { updateGallery, deleteGallery } from '../../../modules/Gallery/galleryactions.js';

class GalleryHeader extends React.Component {
    constructor (props) {
        super(props);
        this.state = { isEditing: false };
    }

    startEdit = () => {
        this.setState({ 'name': this.props.gallery.name, 'isEditing': true });
    }

    handleChange = (e) => {
        this.setState({ 'name': e.target.value });
    }

    handleEnterKey = (e) => {
        if (e.keyCode === 13) {
            this.handleUpdate(e);
        }
        return false;
    }

    handleUpdate = (e) => {
        e.preventDefault();
        if (this.props.gallery.name !== this.state.name) {
            this.props.updateGallery(this.props.gallery.id, this.state.name, this.props.gallery.parentId);
        }
        this.setState({ 'isEditing': false });
    }

    handleDelete = (e) => {
        this.props.deleteGallery(this.props.gallery.id, this.props.gallery.parentId);
    }

    render () {
        if (this.state.isEditing) {
            return (
                <div className={css(styles.galleryHeader) + ' clear'}>
                    <input type="text" className={css(styles.galleryEditInput)} value={this.state.name} onChange={this.handleChange} onBlur={this.handleUpdate} onKeyUp={this.handleEnterKey} autoFocus={true} />
                </div>
            );
        } else {

            let deleteConfirmMessage = "Are you sure you want to delete this gallery? Note: Photos will not be deleted.";
            if (this.props.gallery.isSet) {
                deleteConfirmMessage = "Are you sure you want to delete this gallery set and all its galleries? Note: Photos will not be deleted.";
            }

            return (
                <div className={css(styles.galleryHeader) + ' clear'}>
                    <h2 className={css(styles.galleryHeaderTitle)} onClick={this.startEdit}>{this.props.gallery.name}</h2>
                    <span className={css(styles.editIcon)}><Glyphicon glyph="edit" onClick={this.startEdit}/></span>
                    <div className={css(styles.galleryHeaderOptions)}>
                        <Confirm
                            onConfirm={this.handleDelete}
                            body={deleteConfirmMessage}
                            confirmText="Delete"
                            title="Delete Gallery">
                            <Button bsStyle="danger" bsSize="small"><Glyphicon glyph="trash"/></Button>
                        </Confirm>
                    </div>
                </div>
            );
        }
    }
}

GalleryHeader.PropTypes = {
    gallery: PropTypes.object.isRequired,
    updateGallery: PropTypes.func.isRequired,
    deleteGallery: PropTypes.func.isRequired,
};

GalleryHeader = connect(
    (state, ownProps) => ownProps,
    { updateGallery, deleteGallery }
)(GalleryHeader);

export default GalleryHeader;

const styles = StyleSheet.create({
    galleryHeader: {
        backgroundColor: '#fcfcfc',
        borderBottom: '1px solid #f8f8f8',
        padding: '20px',
    },
    galleryHeaderTitle: {
        float: 'left',
        paddingTop: '0.25em',
    },
    galleryHeaderOptions: {
        float: 'right',
        textAlign: 'right',
    },
    galleryEditInput: {
        backgroundColor: 'transparent',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '1px solid black',
        fontSize: 24,
        padding: 0,
        margin: 0,
        ':focus': {
            outline: 'none',
        }
    },
    editIcon: {
        color: '#dddddd',
        lineHeight: '32px',
        verticalAlign: 'bottom',
        paddingLeft: 5,
    }
});
