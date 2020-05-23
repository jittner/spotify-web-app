import React, { useState } from 'react';

import Jumbotron from 'react-bootstrap/Jumbotron';
import CardGroup from 'react-bootstrap/CardGroup';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect
} from "react-router-dom";

import MainPage from "./pages";
import PlaylistRecommendations from "./pages/playlist-recommendations";
import './App.css';


class App extends React.Component {
  render() {
    return (
      <div>
      <Jumbotron fluid>
        <h1 className="header">Tools for Spotify</h1>
      </Jumbotron>
      <Router>
        <Switch>
          <Route exact={true} path="/">
            <MainPage />
          </Route>
          <Route path="/playlist-recommendations">
            <PlaylistRecommendations />
          </Route>
        </Switch>
      </Router>
      </div>
    );
  }
}

export default App;
