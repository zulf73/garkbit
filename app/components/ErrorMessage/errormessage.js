import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Button, Modal } from 'react-bootstrap';

class ErrorMessage extends React.Component {
    render () {
        return (
            <Modal show={this.props.show} onHide={this.props.clearError}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.props.error.message}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.clearError}>OK</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default ErrorMessage;
