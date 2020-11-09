import React, { PropTypes } from 'react';
import { StyleSheet, css } from 'aphrodite';

const Thumbnail = ({ photo, isDragging, canDrop, onImageClick }) => {

    const className = css(
        styles.thumbnail,
        photo.isSelected && styles.selected,
        isDragging && styles.dragging,
        isDragging && !canDrop && styles.notDroppable,
        isDragging && canDrop && styles.droppable,
    );

    return (
        <div className={className}>
            <img data-id={photo.id} src={'/images/photos/' + photo.sizes.thumb.uri} alt={photo.fn} onClick={onImageClick}/>
        </div>
    );
}

Thumbnail.PropTypes = {
    photo: PropTypes.object.isRequired,
    isDragging: PropTypes.bool,
    canDrop: PropTypes.bool,
    onImageClick: PropTypes.func,
};

export default Thumbnail;

const styles = StyleSheet.create({
    thumbnail: {
        border: '1px solid #ccc',
        padding: 5,
        WebkitBorderRadius: 5,
        MozBorderRadius: 5,
        borderRadius: 5,
        ':hover': {
            border: '1px solid #333',
        },
        ':active': {
            border: '1px solid #333',
        },
    },
    selected: {
        border: '1px solid #006dcc',
        backgroundColor: '#eee',
    },
    dragging: {
        opacity: 0.2,
    },
    notDroppable: {
        border: '1px dashed red',
    },
    droppable: {
        border: '1px dashed black',
        ':hover': {
            border: '1px dashed black',
        },
        ':active': {
            border: '1px dashed black',
        },
    },
});
