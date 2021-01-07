import React from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

const BodyContainer = styled.div`
    font-family: AvenirNext, sans-serif;
`;
const ButtonContainer = styled.div`
    display: flex; 
    justify-content: center;
    margin-bottom: 30px;
`;

class CreatePlaylist extends React.Component {
    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            name: "",
            privacy: "",
            buttonStatus: "noSubmit",
            playlistURL: null
        };
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({buttonStatus: "loading"});
        const sendData = {
            playlist: this.props.tracks,
            name: this.state.name,
            privacy: this.state.privacy
        };
        const data = JSON.stringify(sendData);
        // console.log(data);
        fetch('http://localhost:5000/user/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                                  
            },
            body: data,
            credentials: 'include'
          })
          .then(async response => {
              const data = await response.json();
              this.setState({playlistURL: data});
              this.setState({buttonStatus: "success"});
          });
    }
    render() {
        const switchButton = () => {
            switch(this.state.buttonStatus) {
                case "noSubmit": return (
                    <Button variant="primary" type="submit">
                        <FontAwesomeIcon icon={['fab', 'spotify']} /> Save
                    </Button>
                );
                case "loading": return (
                    <Button variant="secondary" disabled>
                        <Spinner animation="border" />
                    </Button>
                );
                case "success": return (
                    <Button variant="secondary" disabled>
                        Playlist created!
                    </Button>
                );
            }
        }
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    <BodyContainer>
                        <Form.Group>
                            <Form.Control 
                            required 
                            type="text"
                            name="name"
                            placeholder="Playlist name" 
                            onChange={this.handleChange}
                            value={this.state.name}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                inline
                                defaultChecked
                                type="radio"
                                label="Public"
                                id="public"
                                name="privacy"
                                value="public"
                                onChange={this.handleChange}
                            />
                            <Form.Check
                                inline
                                type="radio"
                                label="Private"
                                name="privacy"
                                id="private"
                                value="private"
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                    </BodyContainer>
                    <ButtonContainer>
                        {switchButton()}
                    </ButtonContainer>
                </Form>
            </div>
        );
    }
}

export default CreatePlaylist;