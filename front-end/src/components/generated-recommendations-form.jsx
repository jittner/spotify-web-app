import React from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import CreatePlaylist from "./create-playlist";

class GeneratedForm extends React.Component {
    constructor() {
      super();
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.state = {
          length: "20",
          artists: "5",
          artistsLength: "short_term",
          tracks: "0",
          tracksLength: "short_term",
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
          length: this.state.length,
          artists: this.state.artists,
          artists_length: this.state.artistsLength,
          tracks: this.state.tracks,
          tracks_length: this.state.tracksLength,
          request_type: "from_generated"
      };
      const data = JSON.stringify(sendData);
      fetch('http://localhost:5000/recommendation', {
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
      const artistsMax = () => {
          let currentTracks = Number(this.state.tracks);
          let inputLimit = 5-currentTracks;
          return inputLimit.toString();
      }
      const tracksMax = () => {
        let currentArtists = Number(this.state.artists);
        let inputLimit = 5-currentArtists;
        return inputLimit.toString();
    }
      return (
        <div>
        <div className="Input">
        <Form onSubmit={this.handleSubmit}>
        <Form.Row>
        <Col>
            <Form.Label>Top artists</Form.Label>
            <Form.Control 
                required 
                type="number"
                name="artists"
                min="0"
                max={artistsMax()}
                onChange={this.handleChange}
                value={this.state.artists}
            />
        </Col>
        <Col>
            <Form.Label>Timeframe</Form.Label>
            {' '}
            <OverlayTrigger
                key="right"
                placement="right"
                overlay={
                <Tooltip id="tooltip">
                    Over what period of time your top artists are determined.
                </Tooltip>
                }
            >
                <Form.Label><b>ⓘ</b></Form.Label>
            </OverlayTrigger>
            <Form.Control 
                required 
                as="select"
                name="artistsLength"
                onChange={this.handleChange}
            >
                <option value="short_term">Short (~4 weeks)</option>
                <option value="medium_term">Medium (~6 months)</option>
                <option value="long_term">Long (1+ years)</option>
            </Form.Control>
        </Col>
        </Form.Row>
        <Form.Row>
            <Col>
            <Form.Label>Top tracks</Form.Label>
            <Form.Control 
                type="number"
                name="tracks"
                min="0"
                max={tracksMax()}
                step="1"
                onChange={this.handleChange}
                value={this.state.tracks}
            />
            <Form.Control.Feedback type="invalid">
                Please enter a valid number.
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
                Limit: combined max of 5 artists and/or tracks
            </Form.Text>
        </Col>
        <Col>
            <Form.Label>Timeframe</Form.Label>
            {' '}
            <OverlayTrigger
                key="right"
                placement="right"
                overlay={
                <Tooltip id="tooltip">
                    Over what period of time your top tracks are determined.
                </Tooltip>
                }
            >
                <Form.Label><b>ⓘ</b></Form.Label>
            </OverlayTrigger>
            <Form.Control 
                required 
                as="select"
                name="tracksLength"
                onChange={this.handleChange}
            >
                <option value="short_term">Short (~4 weeks)</option>
                <option value="medium_term">Medium (~6 months)</option>
                <option value="long_term">Long (1+ years)</option>
            </Form.Control>
        </Col>
        </Form.Row>
        <Form.Group>
            <Form.Label>Number of recommendations</Form.Label>
            <Form.Control 
                placeholder="Enter the target number of song recommendations" 
                type="number"
                name="length"
                min="1"
                max="100"
                step="1"
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
                <Row>
                <Col>
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
                </Col>
                <Col>
                    <CreatePlaylist data={this.state.data} />
                </Col>
                </Row>
            </div>
            :
            <div />
        }
        </div>
      );
    }
  }

  
export default GeneratedForm;