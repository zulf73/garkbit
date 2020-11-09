import React from 'react';
import { Button, Modal } from 'react-bootstrap';

class Confirm extends React.Component {
    constructor(props) {
        super(props);
        if (!this.props.show) {
            this.state = { 'show': false };
        } else {
            this.state = { 'show': true };
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.show) {
            this.state = { 'show': false };
        } else {
            this.state = { 'show': true };
        }
    }

    onClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ 'show': true });
    }

    onHide = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ 'show': false });
    }

    onConfirm = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ 'show': false });
        this.props.onConfirm();
    }

    render () {
        let onCancel;
        if (typeof this.props.onCancel === 'undefined') {
            onCancel = this.onHide;
        } else {
            onCancel = this.props.onCancel;
        }

        const modal = (
            <Modal show={this.state.show} onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.props.body}
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="default" onClick={onCancel}>{this.props.cancelText}</Button>
                    <Button bsStyle="primary" onClick={this.onConfirm}>{this.props.confirmText}</Button>
                </Modal.Footer>
            </Modal>
        );

        let content;
        if (this.props.children) {
            var btn = React.Children.only(this.props.children);
            content = React.cloneElement(btn, {
                onClick: this.onClick
            }, btn.props.children, modal);
        } else {
            if (this.props.showActionButton) {
                content = (
                    <Button onClick={this.onClick}>
                        {this.props.buttonText}
                        {modal}
                    </Button>
                );
            } else {
                content = modal;
            }
        }
        return content;
    }
}

Confirm.propTypes = {
    body: React.PropTypes.node.isRequired,
    buttonText: React.PropTypes.node,
    cancelText: React.PropTypes.node,
    confirmBSStyle: React.PropTypes.string,
    confirmText: React.PropTypes.node,
    onConfirm: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func,
    title: React.PropTypes.node.isRequired,
    show: React.PropTypes.bool,
    showActionButton: React.PropTypes.bool,
};

Confirm.defaultProps = {
    cancelText: 'Cancel',
    confirmText: 'Confirm',
    confirmBSStyle: 'danger',
    showActionButton: true,
};

export default Confirm;
