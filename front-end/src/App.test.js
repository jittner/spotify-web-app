import React, { useState } from 'react';

import Jumbotron from 'react-bootstrap/Jumbotron';
import CardGroup from 'react-bootstrap/CardGroup';
import CardColumns from 'react-bootstrap/CardColumns';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect
} from "react-router-dom";

import MainPage from "./pages";
import PlaylistRecommendations from "./pages/playlist-recommendations";
import Recommendations from "./pages/recommendations";
import CopyPlaylist from "./pages/copy-playlist";
import HeroHeader from "./components/hero-header";
import './App.css';

library.add(fab);

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      homeView = true,
    }
    this.changeView = this.changeView.bind(this);
  }

  changeView(event) {
    this.setState({homeView: !this.state.homeView});
  }

  render() {
    return (
      <div>
      <Router>
      <HeroHeader />
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
        <Switch>
          {/* <Route exact={true} path="/">
            <MainPage />
          </Route> */}
          <Route path="/playlist-recommendations">
            <PlaylistRecommendations />
          </Route>
          <Route path="/recommendations">
            <Recommendations />
          </Route>
          <Route path="/copy-playlist">
            <CopyPlaylist />
          </Route>
        </Switch>
      </Router>
      </div>
    );
  }
}

export default App;
