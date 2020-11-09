import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Glyphicon } from 'react-bootstrap';
import { toggleAddGalleryModal } from './galleriespanelactions';
import { loadGalleries } from '../../modules/Galleries/galleriesactions';
import AddGallery from '../AddGallery/addgallery';
import GalleryList from '../GalleryList/gallerylist';

class GalleriesPanel extends React.Component {
    constructor (props) {
        super(props);
    }

    componentWillMount = () => {
        this.props.loadGalleries();
    }

    handleButtonClick = (e) => {
        e.stopPropagation();
        let addSet = false;
        if (e.target.id === 'addGallerySetButton') {
            addSet = true;
        }
        return this.props.toggleAddGalleryModal(addSet);
    }

    render () {
        const props = this.props;
        return (
            <div>
                <h3>Galleries</h3>
                <Button bsStyle="primary" bsSize="xsmall" onClick={this.handleButtonClick} id="addGalleryButton"><Glyphicon glyph="plus-sign" /> Gallery</Button>
                {' '}
                <Button bsStyle="primary" bsSize="xsmall" onClick={this.handleButtonClick} id="addGallerySetButton"><Glyphicon glyph="plus-sign" /> Gallery Set</Button>
                <AddGallery galleries={props.galleries} show={props.galleriesPanel.showAddGalleryModal} addSet={props.galleriesPanel.addSet} onHide={props.toggleAddGalleryModal} />
                <GalleryList data={props.galleries} />
            </div>
        );
    }
}

GalleriesPanel.PropTypes = {
    galleries: PropTypes.array.isRequired,
    galleriesPanel: PropTypes.object.isRequired,
    toggleAddGalleryModal: PropTypes.func.isRequired,
}

GalleriesPanel = connect(
    (state) => {
        return {
            galleriesPanel: state.galleriesPanel,
            galleries: state.galleries
        };
    },
    { loadGalleries, toggleAddGalleryModal }
)(GalleriesPanel);

export default GalleriesPanel;

const styles = StyleSheet.create({
    addGalleryModal: {
        position: 'absolute',
        zIndex: '1000',
        backgroundColor: '#888888',
        width: '500px',
        height: '500px',
        marginLeft: '-250px',
        marginTop: '-250px',
        left: '50%',
        top: '50%',
    }
});
