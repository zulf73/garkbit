import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Modal, Glyphicon } from 'react-bootstrap';
import { DropTarget } from 'react-dnd';
import Confirm from '../../Confirm/confirm';
import { updateGallery, deleteGallery, addPhotoToGallery } from '../../../modules/Galleries/galleriesactions.js';

const ItemTypes = {
    PHOTO: 'photo'
};

function collectPhotoTarget(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
    };
}

const photoTarget = {
    canDrop(props, monitor) {
        if (props.gallery.isSet) {
            return false;
        }
        return true;
    },
    drop(props, monitor, component) {
        if (!monitor.didDrop()) {
            props.addPhotoToGallery(monitor.getItem().photoId, props.gallery.id);
        }
        return;
    },
};

class GalleryListItem extends React.Component {
    constructor (props) {
        super(props);
        this.state = {name: this.props.gallery.name, isEditing: false};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.gallery.name !== this.props.gallery.name) {
            this.setState({name: nextProps.gallery.name});
        }
    }

    startEdit = (e) => {
        this.setState({isEditing: true});
    }

    handleChange = (e) => {
        this.setState({name: e.target.value});
    }

    handleUpdate = (e) => {
        e.preventDefault();
        this.setState({isEditing : false});
        this.props.updateGallery(this.props.gallery.id, this.state.name, this.props.gallery.parentId);
    }

    handleDelete = () => {
        this.props.deleteGallery(this.props.gallery.id, this.props.gallery.parentId);
    }

    render () {
        const { gallery, children, connectDropTarget, isOver, canDrop } = this.props;

        const galleryListItemClassName = css(
                styles.galleryListItemText,
                isOver && canDrop && styles.droppable,
                isOver && !canDrop && styles.notDroppable,
        );

        if (this.state.isEditing) {
            return (
                <li className="gallery">
                    <input type="text" value={this.state.name} onChange={this.handleChange}/>
                    <input type="submit" value="Change" onClick={this.handleUpdate} />
                </li>
            );
        } else {
            return connectDropTarget(
                <li className={css(styles.galleryListItem)}>
                    <div className={css(styles.galleryListItemText)}>
                        {isOver && canDrop &&
                            <span style={{color: '#29722e'}}><Glyphicon glyph="copy" />&nbsp;</span>
                        }
                        {isOver && !canDrop &&
                            <span style={{color: '#722929'}}><Glyphicon glyph="ban-circle" />&nbsp;</span>
                        }
                        <Link to={"/gallery/" + gallery.id}>{this.state.name} <Glyphicon glyph="circle-arrow-right" /></Link>
                    </div>
                    {typeof children !== 'undefined' &&
                        <ul className={css(styles.galleryList)}>
                            {children}
                        </ul>
                    }
                </li>
            );
        }
    }
}

/* Delete button code
<Confirm
    onConfirm={this.handleDelete}
    body="Are you sure you want to delete this gallery?"
    confirmText="Delete"
    title="Delete Gallery">
    <button>Delete</button>
</Confirm>
*/

GalleryListItem.propTypes = {
    gallery: PropTypes.object.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    updateGallery: PropTypes.func.isRequired,
    deleteGallery: PropTypes.func.isRequired,
    addPhotoToGallery: PropTypes.func.isRequired,
}

GalleryListItem = DropTarget(ItemTypes.PHOTO, photoTarget, collectPhotoTarget)(GalleryListItem);
GalleryListItem = connect(
    (state, ownProps) => ownProps,
    {updateGallery, deleteGallery, addPhotoToGallery}
)(GalleryListItem);

export default GalleryListItem;

const styles = StyleSheet.create({
    galleryListItem: {
        padding: 0,
        margin: 0,
        listStyleType: 'none',
    },
    galleryListItemText: {
        padding: 0,
        margin: 0,
        lineHeight: 1.8,
        borderBottom: '1px solid #aaaaaa',
    },
    galleryList: {
        padding: 0,
        margin: 0,
        marginLeft: 10,
    },
    droppable: {
        backgroundColor: '#eeffee',
    },
    notDroppable: {
        backgroundColor: '#ffeeee',
    },
});
