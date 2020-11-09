import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Col, Button, Form, FormGroup, ControlLabel, FormControl, Glyphicon } from 'react-bootstrap';
import { addPhoto } from './addphotoactions';
import { canUseDOM } from '../../../lib/utils.js';

class AddPhoto extends React.Component {
    constructor (props) {
        super(props);
        this.state = {file: ''};
        if (canUseDOM) {
            this.reader = new FileReader();
            this.reader.onloadend = () => {
                this.setState({
                    file: this.reader.result
                });
            }
        }
    }

    handleChange = (e) => {
        e.preventDefault();

        const file = e.target.files[0];
        this.reader.readAsDataURL(file);
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const files = this.photoInput.files;
        this.props.addPhoto(files, this.props.galleryId);
    }

    handleDrop = (e) => {
        e.preventDefault();

        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length !== 0) {
            this.props.addPhoto(files, this.props.galleryId);
        }

        this.props.onDragLeave();
    }

    handleFileUploadClick = (e) => {

    }

    render () {
        return (
            <div>
                {this.props.showDropZone &&
                    <div className={css(styles.dropZoneOverlay)} onDragLeave={this.props.onDragLeave} onDragEnd={this.props.onDragLeave} onDrop={this.handleDrop}><h1 style={{display: 'inline'}}>Drop Files to Upload</h1></div>
                }
                {this.props.addPhotoView.isUploading &&
                    <div className={css(styles.uploadingIndicator)}><div className="loader"></div></div>
                }
                <form className={css(styles.addPhotoForm)} onSubmit={this.handleSubmit} type="multipart/form-data">
                    <label htmlFor="photoInput" className="btn btn-sm btn-primary">
                        <Glyphicon glyph="plus-sign" /> Photo
                    </label>
                    <input id="photoInput" className={css(styles.fileInput)} type="file" accept="image/gif, image/jpeg" onChange={this.handleSubmit} ref={(input) => this.photoInput = input}/>
                </form>
            </div>
        );
    }
}
export default AddPhoto = connect(
    (state) => {
        return {
            addPhotoView: state.addPhotoView,
        };
    },
    {addPhoto}
)(AddPhoto);

const styles = StyleSheet.create({
    addPhotoForm: {
    },
    fileInput: {
        display: 'none',
    },
    dropZoneOverlay: {
        position: 'absolute',
        zIndex: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#888888',
        color: 'white',
        border: '5px dashed #ccccff',
        opacity: '0.75',
        textAlign: 'center',
        paddingTop: '45%',
    },
    uploadingIndicator: {
        position: 'absolute',
        zIndex: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#888888',
        color: 'white',
        opacity: '0.85',
        textAlign: 'center',
        paddingTop: '45%',
    },
});
