import React from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


class CreatePlaylist extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            name: "",
            privacy: ""
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
            playlist: this.props.data,
            name: this.state.name,
            privacy: this.state.privacy
        };
        const data = JSON.stringify(sendData);
        // console.log(data);
        fetch('http://localhost:5000/create_playlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                                  
            },
            body: data,
            credentials: 'include'
          });
    }
    render() {
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
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
                <Button variant="primary" type="submit">
                <FontAwesomeIcon icon={['fab', 'spotify']} /> Save to Spotify
                </Button>
                </Form>
            </div>
        );
    }
}

export default CreatePlaylist;