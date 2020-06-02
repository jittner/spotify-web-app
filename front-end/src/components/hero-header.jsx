import React, { useState } from 'react';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class HeroHeader extends React.Component {
    constructor() {
        super();
        this.handleToggle = this.handleToggle.bind(this);
        this.state = {
            connected: false,
            errorMessage: ""
        };
    }
    handleToggle(event) {
        fetch('http://localhost:5000/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include'
          })
          .then(async response => {
                const authStatus = await response.json();
                if (!response.ok){
                    const error = (authStatus && authStatus.message) || response.status;
                    return Promise.reject(error);
                }
                this.setState({connected: !this.state.connected})
          })
          .catch(error => {
                this.setState({errorMessage: error})
          });
        this.setState({
            connected: !this.state.connected,
        });
    }

    render() {
        const switchButton = () => {
            if (this.state.connected) {
                return(
                    <Button variant="primary">
                        <FontAwesomeIcon icon={['fab', 'spotify']} /> Connected
                    </Button>
                );
            } else {
                return(
                    <Button variant="primary" onClick={this.handleToggle} type="submit">
                        <FontAwesomeIcon icon={['fab', 'spotify']} /> Connect with Spotify
                    </Button>
                );
            };
        }
        return (
            <Jumbotron fluid>
                <h1 className="header">Toolify</h1>
                {switchButton()}
            </Jumbotron>
        );
    }
};

export default HeroHeader;