import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import PhotoGrid from '../PhotoGrid/photogrid';
import { loadAllPhotos, unloadPhotos } from '../../modules/Photos/photosactions';

class PhotosView extends React.Component {
    constructor (props) {
        super(props);
    }

    componentWillMount() {
        this.props.loadAllPhotos();
    }

    componentWillUnmount() {
        // Unload the gallery to force a reload when we navigate away (someplace outside of galleries) and then back to this gallery
        this.props.unloadPhotos();
    }

    render () {
        const props = this.props;

        return (
            <div className={css(styles.allPhotosView)}>
                <div className={css(styles.allPhotosHeader) + ' clear'}>
                    <h2 className={css(styles.allPhotosHeaderTitle)}>All Photos</h2>
                </div>
                <PhotoGrid photos={props.photos} />
            </div>
        );

    }
}

PhotosView.PropTypes = {
    photos: PropTypes.array.isRequired,
};

export default connect(
    (state) => {
        return {
            photos: state.photos,
        };
    },
    { loadAllPhotos, unloadPhotos }
)(PhotosView);

const styles = StyleSheet.create({
    allPhotosView: {
        position: 'relative',
    },
    allPhotosHeader: {
        backgroundColor: '#fcfcfc',
        borderBottom: '1px solid #f8f8f8',
        padding: '20px',
    },
    allPhotosHeaderTitle: {
        float: 'left',
        paddingTop: '0.25em',
    },
});
