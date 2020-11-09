import _ from 'lodash';
import React, { PropTypes } from 'react';
import { StyleSheet, css } from 'aphrodite';
import GalleryListItem from './GalleryListItem/gallerylistitem';

const GalleryList = (props) => {
    let galleries = props.data.map(function(gallery) {
        let subGalleries = [];
        if (!_.isUndefined(gallery.children)) {
            subGalleries = gallery.children.map(function(sub) {
                return (
                    <GalleryListItem gallery={sub} key={sub.id} />
                );
            });
        }
        return (
            <GalleryListItem gallery={gallery} key={gallery.id}>
                {subGalleries}
            </GalleryListItem>
        );
    });
    return (
        <ul className={css(styles.galleryList)}>
            {galleries}
        </ul>
    );
}

GalleryList.PropTypes = {
    data: PropTypes.array.isRequired,
};

export default GalleryList;

const styles = StyleSheet.create({
    galleryList: {
        padding: 0,
        paddingTop: 10,
        paddingBottom: 10,
        margin: 0,
        fontSize: 12,
    },
});
