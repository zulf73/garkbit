import _ from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Modal, Form, FormControl, FormGroup, ControlLabel, Grid, Row, Col } from 'react-bootstrap';
import { loginUser } from '../../modules/Auth/authactions.js';

class Login extends React.Component {
    constructor () {
        super();
        this.defaultState = {
            email: '',
            password: '',
        };
        this.state = this.defaultState;
    }

    handleInputChange = (e) => {
        const target = e.target;

        this.setState({
            [target.name]: target.value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const email = this.state.email.trim();
        const password = this.state.password.trim();
        this.props.loginUser(email, password);
    }

    render () {
        return (
            <div style={{ marginTop: 50 }} >
                <Grid>
                    <Row className="row-full-height">
                        <Col sm={6} smOffset={3} className="login">
                            <img className="logo" src="/images/gb_logo.png" alt="Garkbit"/>
                            {this.props.auth.error &&
                                <Alert bsSize="small" bsStyle="warning">
                                    {this.props.auth.error}
                                </Alert>
                            }
                            <Form className="gallery-form" onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <ControlLabel>Email</ControlLabel>
                                    <FormControl
                                        name="email"
                                        type="text"
                                        placeholder="Enter your email address"
                                        onChange={this.handleInputChange}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <ControlLabel>Password</ControlLabel>
                                    <FormControl
                                        name="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        onChange={this.handleInputChange}
                                    />
                                </FormGroup>
                                <Button type="submit" bsStyle="primary">Login</Button>
                            </Form>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }

}

Login = connect(
    (state) => {
        return {
            auth: state.auth,
        };
    },
    { loginUser }
)(Login);

export default Login;
