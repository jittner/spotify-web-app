import React from "react";
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    min-height: 100vh;
    h1 {
        font-size: 80px;
        margin-bottom: 30px;
    }
`;

class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            url: null,
            errorMessage: null,
        };
    }
    handleClick(event) {
        sessionStorage.setItem('authState', 'authorized');
        window.location.replace('http://localhost:5000/');
    }
    render() {
        return (
            <LoginContainer>
                <h1>Toolify</h1>
                <Button onClick={this.handleClick}>
                    <FontAwesomeIcon icon={['fab', 'spotify']} /> Connect with Spotify
                </Button>
            </LoginContainer>
        );
    }
}

export default Login;