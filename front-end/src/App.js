import React, { useState } from 'react';

import Jumbotron from 'react-bootstrap/Jumbotron';
import CardGroup from 'react-bootstrap/CardGroup';
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
  render() {
    return (
      <div>
      {/* <Jumbotron fluid>
        <h1 className="header">Toolify</h1>
      </Jumbotron> */}
      <Router>
      <HeroHeader />
        <Switch>
          <Route exact={true} path="/">
            <MainPage />
          </Route>
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
