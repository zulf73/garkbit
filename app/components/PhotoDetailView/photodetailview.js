import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Modal, Form, FormControl, FormGroup, ControlLabel, Grid, Row, Col } from 'react-bootstrap';
import { updatePhoto, clearMessages } from './photodetailviewactions.js';

class PhotoDetailView extends React.Component {
    constructor (props) {
        super(props);
        this.state = { 'caption': props.photo.caption }
    }

    handleInputChange = (e) => {
        const target = e.target;

        this.props.clearMessages();

        this.setState({
            [target.name]: target.value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const caption = this.state.caption ? this.state.caption.trim() : '';
        this.props.updatePhoto(this.props.photo.id, caption);
        return;
    }

    handleClose = (e) => {
        this.props.clearMessages();
        this.props.onClose();
    }

    render () {
        const props = this.props;
        const photo = props.photo;

        return (
            <Modal bsSize="large" show={props.show} onHide={this.handleClose}>
                <Form className="" onSubmit={this.handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{photo.fn}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col xs={4}>
                                <img src={'/images/photos/' + photo.sizes.thumb.uri} alt={photo.title} />
                            </Col>
                            <Col xs={8}>
                                {props.photoDetailView.isSaved &&
                                    <Alert bsSize="small" bsStyle="success" onDismiss={props.clearMessages}>
                                        Photo details saved
                                    </Alert>
                                }
                                {props.photoDetailView.isError &&
                                    <Alert bsSize="small" bsStyle="warning" onDismiss={props.clearMessages}>
                                        There was a problem saving the updates
                                    </Alert>
                                }
                                <FormGroup>
                                    <ControlLabel>Caption</ControlLabel>
                                    <FormControl
                                        componentClass="textarea"
                                        name="caption"
                                        type="text"
                                        placeholder="Enter photo caption"
                                        value={this.state.caption || ''}
                                        onChange={this.handleInputChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button onClick={this.handleClose}>Cancel</Button>
                      <Button type="submit" bsStyle="primary">Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

PhotoDetailView.PropTypes = {
    show: PropTypes.bool,
    photo: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
}

PhotoDetailView = connect(
    (state) => {
        return {
            photoDetailView: state.photoDetailView,
        };
    },
    { updatePhoto, clearMessages }
)(PhotoDetailView);

export default PhotoDetailView;
