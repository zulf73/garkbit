import React, { PropTypes } from 'react';
import { StyleSheet, css } from 'aphrodite';

const WelcomeView = () => {
    return (
        <div className={css(styles.welcome)}>
            <h1>Welcome</h1>
            <h3>Add or Select a gallery to get started managing your photos</h3>
        </div>
    );
}

export default WelcomeView;

const styles = StyleSheet.create({
    welcome: {
        textAlign: 'center',
        marginTop: 150,
    },
});
