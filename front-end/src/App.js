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
      <Jumbotron>
        <h1 className="header">Spotify Tools</h1>
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

// const App = () => (
//   <Container className="p-3">
//     <Jumbotron>
//       <h1 className="header">Spotify Tools</h1>
//     </Jumbotron>
//     <CardGroup>
//       <Card>
//         <Card.Body>
//           <Card.Title>Card title</Card.Title>
//           <Card.Text>
//             This is a wider card with supporting text below as a natural lead-in to
//             additional content. This content is a little bit longer.
//           </Card.Text>
//         </Card.Body>
//         <Card.Footer>
//           <small className="text-muted">Last updated 3 mins ago</small>
//         </Card.Footer>
//       </Card>
//       <Card>
//         <Card.Body>
//           <Card.Title>Card title</Card.Title>
//           <Card.Text>
//             This card has supporting text below as a natural lead-in to additional
//             content.{' '}
//           </Card.Text>
//         </Card.Body>
//         <Card.Footer>
//           <small className="text-muted">Last updated 3 mins ago</small>
//         </Card.Footer>
//       </Card>
//       <Card>
//         <Card.Body>
//           <Card.Title>Card title</Card.Title>
//           <Card.Text>
//             This is a wider card with supporting text below as a natural lead-in to
//             additional content. This card has even longer content than the first to
//             show that equal height action.
//           </Card.Text>
//         </Card.Body>
//         <Card.Footer>
//           <small className="text-muted">Last updated 3 mins ago</small>
//         </Card.Footer>
//       </Card>
//       <Card>
//         <Card.Body>
//           <Card.Title>Card title</Card.Title>
//           <Card.Text>
//             This is a wider card with supporting text below as a natural lead-in to
//             additional content. This card has even longer content than the first to
//             show that equal height action.
//           </Card.Text>
//         </Card.Body>
//         <Card.Footer>
//           <small className="text-muted">Last updated 3 mins ago</small>
//         </Card.Footer>
//       </Card>
//     </CardGroup>
//   </Container>
// );

export default App;
