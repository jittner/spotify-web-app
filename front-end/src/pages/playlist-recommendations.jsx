import React from "react";
import Jumbotron from 'react-bootstrap/Jumbotron';
import CardGroup from 'react-bootstrap/CardGroup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Link } from "react-router-dom";

class MyForm extends React.Component {
    constructor() {
      super();
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.state = {
        //   playlist: "",
        //   length: "",
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
      // format data body using state values, i.e:
      // const json = JSON.stringify(this.state);
      // const data = new FormData(event.target);
    //   const formData = new FormData();
    //   formData.append('playlist', this.state.playlist);
    //   formData.append('length', this.state.length);
      const sendData = {
          playlist: this.state.playlist,
          length: this.state.length
      };
      const data = JSON.stringify(sendData);
    //   console.log(sendData);
    //   console.log(data);
      fetch('http://localhost:5000/playlist_recommendation', {
        method: 'POST',
        headers: {
            // 'Content-Type': 'multipart/form-data',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
                              
        },
        // body: formData,
        body: data,
        credentials: 'include'
      })
      .then(async response => {
            const recommendations = await response.json();
            // console.log(recommendations);
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
                {
                    this.state.data.tracks.map((track, index) =>  (
                        <li key={index}>
                            {track.name}
                        </li>
                    ))
                }
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
                Submit a playlist 
                </Card.Text>
                <MyForm />
            </Card.Body>
        </Card>
        </Container>
    );
    }
};
  
export default PlaylistRecommendations;