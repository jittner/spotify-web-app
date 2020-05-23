import React from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import { Link } from "react-router-dom";

class MyForm extends React.Component {
    constructor() {
      super();
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.state = {
          length: "20",
          data: null,
          errorMessage: null
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
          playlist: this.state.playlist,
          length: this.state.length
      };
      const data = JSON.stringify(sendData);
      fetch('http://localhost:5000/playlist_recommendation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
                              
        },
        body: data,
        credentials: 'include'
      })
      .then(async response => {
            const recommendations = await response.json();
            if (!response.ok){
                const error = (recommendations && recommendations.message) || response.status;
                return Promise.reject(error);
            }
            this.setState({data: recommendations})
      })
      .catch(error => {
            this.setState({errorMessage: error})
      });
    }
  
    render() {
      return (
        <div>
        <div className="Input">
        <Form onSubmit={this.handleSubmit}>
        <Form.Group controlId="formPlaylist">
            <Form.Label>Source playlist</Form.Label>
            <Form.Control 
                required 
                type="text"
                name="playlist"
                placeholder="Enter playlist link or URI" 
                onChange={this.handleChange}
                value={this.state.playlist}
            />
        </Form.Group>
        <Form.Group controlId="formLength">
            <Form.Label>Number of recommendations</Form.Label>
            <Form.Control 
                placeholder="Enter the target number of song recommendations" 
                type="number"
                name="length"
                min="1"
                max="100"
                step="1"
                defaultValue="20"
                onChange={this.handleChange}
                value={this.state.length}
            />
            <Form.Control.Feedback type="invalid">
                Please enter a valid number.
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
                Limits: 1-100
            </Form.Text>
        </Form.Group>
        <Button variant="primary" type="submit">
            Get recommendations
        </Button>
        </Form>
        </div>
        {this.state.data ?
            <div className="Output">
                <p />
                <Accordion>
                {
                    this.state.data.tracks.map((track, index) =>  (
                        <Card key={index}>
                        <Accordion.Toggle as={Card.Header} eventKey={index} key={index}>
                            "{track.name}" - {track.artist_names}
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={index}>
                        <Card.Body>
                            <iframe src={track.embed_url} width="300" height="80" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                        </Card.Body>
                        </Accordion.Collapse>
                        </Card>
                    ))
                }
                </Accordion>
            </div>
            :
            <div />
        }
        </div>
      );
    }
  }

class PlaylistRecommendations extends React.Component {
    render() {
    return (
        <Container className="p-3">
        <Card>
            <Card.Header as="h5">
                <Link to="/"> {'<'} </Link>
            </Card.Header>
            <Card.Body>
                <Card.Title>Get recommendations from a playlist</Card.Title>
                <Card.Text>
                </Card.Text>
                <MyForm />
            </Card.Body>
        </Card>
        </Container>
    );
    }
};
  
export default PlaylistRecommendations;