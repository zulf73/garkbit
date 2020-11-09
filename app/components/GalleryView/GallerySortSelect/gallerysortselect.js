import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { updateGallerySort } from './gallerysortselectactions';

class GallerySortSelector extends React.Component {
    constructor (props) {
        super(props);
    }

    handleChange = (e) => {
        e.preventDefault();
        this.props.updateGallerySort(this.props.gallery.id, e.target.value);
        return false;
    }

    render () {
        const props = this.props;

        return (
            <Form inline className={css(styles.gallerySortSelect)}>
                <FormGroup bsSize="small">
                    <ControlLabel>Sort:&nbsp;</ControlLabel>
                    <FormControl componentClass="select" name="gallerySortSelector" value={props.gallery.sortBy} ref="gallerySortSelector" onChange={this.handleChange}>
                        <option value="date">Photo Date</option>
                        <option value="filename">Filename</option>
                        {!props.gallery.isSet &&
                            <option value="pos">Custom</option>
                        }
                    </FormControl>
                </FormGroup>
            </Form>
        )
    }
}

GallerySortSelector.PropTypes = {
    gallery: PropTypes.object.isRequired,
};

GallerySortSelector = connect(
    (state, ownProps) => ownProps,
    {updateGallerySort}
)(GallerySortSelector);

export default GallerySortSelector;

const styles = StyleSheet.create({
    gallerySortSelect: {
    },
});
