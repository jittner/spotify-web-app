import React from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class CopyPlaylist extends React.Component {
    constructor(){
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleNewPlaylistSubmit = this.handleNewPlaylistSubmit.bind(this);
        this.state = {
            source: "",
            destination: "",
            show: false,
            privacy: "",
            name: ""
        };
    }
    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }
    handleSubmit(event) {
        event.preventDefault();
        const sendData = {
            source: this.state.source,
            destination: this.state.destination
        };
        const data = JSON.stringify(sendData);
        fetch('http://localhost:5000/copy_playlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                                  
            },
            body: data,
            credentials: 'include'
          });
    }
    handleNewPlaylistSubmit(event) {
        event.preventDefault();
        let isPublic = true;
        if (this.state.privacy === "private") {
            isPublic = false
        };
        const sendData = {
            name: this.state.name,
            privacy: isPublic
        };
        const data = JSON.stringify(sendData);
        fetch('http://localhost:5000/create_empty_playlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                                  
            },
            body: data,
            credentials: 'include'
          })
          .then(async response => {
            const playlist = await response.json();
            this.setState({destination: playlist.spotify});
          });
    }

    render() {
        const handleClose = () => this.setState({show: false});
        const handleShow = () => this.setState({show: true});
        return(
            <Container className="p-3">
            <Card>
            <Card.Header as="h5">
            <Link to="/"> {'<'} </Link>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={this.handleSubmit}>
                <Form.Group>
                    <Form.Label>Source playlist</Form.Label>
                    <Form.Control 
                        required 
                        type="text"
                        name="source"
                        placeholder="Enter playlist link or URI" 
                        onChange={this.handleChange}
                        value={this.state.source}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Destination playlist</Form.Label>
                    <Form.Control  
                        type="text"
                        name="destination"
                        placeholder="Enter playlist link or URI" 
                        onChange={this.handleChange}
                        value={this.state.destination}
                    />
                </Form.Group>
                <Button variant="link" onClick={handleShow}>
                    Or create a new destination playlist
                </Button>
                <Modal show={this.state.show} onHide={handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>Create a new playlist</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.handleNewPlaylistSubmit}>
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
                                name="privacy"
                                value="public"
                                onChange={this.handleChange}
                            />
                            <Form.Check
                                inline
                                type="radio"
                                label="Private"
                                name="privacy"
                                value="private"
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Button variant="primary" onClick={handleClose} type="submit">
                        <FontAwesomeIcon icon={['fab', 'spotify']} /> Create new playlist
                        </Button>
                        </Form>
                    </Modal.Body>
                    {/* <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        Close
                    </Button>
                    </Modal.Footer> */}
                </Modal>
                <Button variant="primary" type="submit">
                <FontAwesomeIcon icon={['fab', 'spotify']} /> Copy playlist
                </Button>
                </Form>
            </Card.Body>
            </Card>
            </Container>
        );
    }

};

export default CopyPlaylist;