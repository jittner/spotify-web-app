import React from "react";
import CardColumns from 'react-bootstrap/CardColumns';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";

class MainPage extends React.Component {
    render() {
    return (
        <Container className="p-3">
        <CardColumns>
          <Card as={Link} to="/playlist-recommendations" className="feature-card">
            <Card.Body>
              <Card.Text>
                Use an existing playlist to generate recommended songs
              </Card.Text>
            </Card.Body>
          </Card>
          <Card as={Link} to="/recommendations" className="feature-card">
            <Card.Body>
              <Card.Text>
                Generate personalized song recommendations
              </Card.Text>
            </Card.Body>
          </Card>
          <Card as={Link} to="/copy-playlist" className="feature-card">
            <Card.Body>
              <Card.Text>
                Copy an existing playlist to another
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>Card title</Card.Title>
              <Card.Text>
                This is a wider card with supporting text below as a natural lead-in to
                additional content. This card has even longer content than the first to
                show that equal height action.
              </Card.Text>
            </Card.Body>
            <Card.Footer>
              <small className="text-muted">Last updated 3 mins ago</small>
            </Card.Footer>
          </Card>
        </CardColumns>
      </Container>
    );
    }
};
  
export default MainPage;