import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, FormControl, FormGroup, ControlLabel, Row, Col } from 'react-bootstrap';
import { addGallery } from '../../modules/Galleries/galleriesactions.js';

class AddGallery extends React.Component {
    constructor () {
        super();
        this.defaultState = {
            galleryName: '',
            parentGallery: '',
            galleryNameValid: null,
        };
        this.state = this.defaultState;
    }

    handleInputChange = (e) => {
        const target = e.target;

        if (target.name === 'galleryName' && target.value.length > 0) {
            this.setState({ 'galleryNameValid': 'success' });
        }

        this.setState({
            [target.name]: target.value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const name = this.state.galleryName.trim();
        const parentGallery = this.state.parentGallery;
        const isSet = this.props.addSet;
        if (!name) {
            this.setState({ 'galleryNameValid': 'error' });
            return false;
        }
        this.props.addGallery(name, parentGallery, isSet);
        this.handleClose();
    }

    handleClose = (e) => {
        this.setState(this.defaultState);
        this.props.onHide();
    }

    render () {
        const props = this.props;
        let title = 'Add Gallery';
        let placeholder = 'Enter a name for your new gallery';
        if (props.addSet) {
            title = 'Add Gallery Set';
            placeholder = 'Enter a name for your new gallery set'
        }
        const parentGalleryOptions = props.galleries.filter(g => g.isSet)
            .map(function(gallery) {
                return (
                    <option value={gallery.id} key={gallery.id}>{gallery.name}</option>
                );
            });
        return (
            <Modal show={props.show} onHide={this.handleClose}>
                <Form className="gallery-form" onSubmit={this.handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FormGroup validationState={this.state.galleryNameValid}>
                            <ControlLabel>Gallery {props.addSet && 'Set'} Name</ControlLabel>
                            <FormControl
                                name="galleryName"
                                type="text"
                                placeholder={placeholder}
                                onChange={this.handleInputChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Add to gallery set</ControlLabel>
                            <FormControl name="parentGallery" componentClass="select" placeholder="select" onChange={this.handleInputChange}>
                                <option value="">--</option>
                                {parentGalleryOptions}
                            </FormControl>
                        </FormGroup>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button onClick={this.handleClose}>Cancel</Button>
                      <Button type="submit" bsStyle="primary">Add Gallery {props.addSet && 'Set'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

AddGallery.PropTypes = {
    show: PropTypes.bool.isRequired,
    addSet: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    addGallery: PropTypes.func.isRequired,
};

AddGallery = connect(
    (state, ownProps) => ownProps,
    {addGallery}
)(AddGallery);

export default AddGallery;
