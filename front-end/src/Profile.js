import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link,
    Redirect
  } from "react-router-dom";

import UserPlaylists from "./pages/UserPlaylists";
import Playlist from "./pages/Playlist";
import User from './pages/User';
import TopArtists from './pages/TopArtists';
import TopTracks from './pages/TopTracks';
import Recommendations from './pages/Recommendations';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import styled from 'styled-components';
import { media } from './style/media';
import theme from './style/theme';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faMusic, faUser, faGuitar, faBars, faQuestionCircle, faGhost, faRobot } from '@fortawesome/free-solid-svg-icons'

library.add(fab, faMusic, faUser, faGuitar, faBars, faQuestionCircle, faGhost, faRobot);

const NavbarPadding = styled.div`
    padding-left: ${theme.navWidth};
    ${media.tablet`
        padding-left: 0;
        padding-bottom: 50px;
    `};
`;

class Profile extends React.Component {
    render() {
        return (
            <NavbarPadding>
                <Router>
                    <Navbar />
                    <Switch>
                        <Route exact path="/">
                            <User />
                        </Route>
                        <Route path="/top-artists">
                            <TopArtists />
                        </Route>
                        <Route path="/top-tracks">
                            <TopTracks />
                        </Route>
                        <Route exact path="/playlists">
                            <UserPlaylists />
                        </Route>
                        <Route path="/playlists/:id">
                            <Playlist />
                        </Route>
                        <Route path="/recommendations/:id">
                            <Recommendations />
                        </Route>
                        <Route component={NotFound} />
                    </Switch>
                </Router>
            </NavbarPadding>
        );
    }
}

export default Profile;