import React from "react";
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link,
    Redirect
  } from "react-router-dom";
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { media } from '../style/media';
import theme from '../style/theme';
const { colors } = theme;

const Container = styled.nav`
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);   
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: AvenirNext, sans-serif;
    flex-direction: column;
    min-height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    width: ${theme.navWidth};
    background-color: ${colors.navBlack};
    text-align: center;
    z-index: 99;
    ${media.tablet`
        top: auto;
        bottom: 0;
        right: 0;
        width: 100%;
        min-height: ${theme.navHeight};
        height: ${theme.navHeight};
        flex-direction: row;
    `};
    & > * {
        width: 100%;
        ${media.tablet`
            height: 100%;
        `};
    }
`;
const Logo = styled.div`
    color: ${colors.green};
    margin-top: 30px;
    width: 70px;
    height: 70px;
    ${media.tablet`
        display: none;
    `};
    a {
        transition: all 0.25s cubic-bezier(0.3, 0, 0.4, 1);
        color: ${colors.green};
        &:hover,
        &:focus {
            color: ${colors.offGreen};
        }
    }
    svg {
        width: 50px;
    }
`;
const Github = styled.div`
    color: ${colors.lightGrey};
    width: 45px;
    height: 45px;
    margin-bottom: 30px;
    ${media.tablet`
        display: none;
    `};
    a {
        color: ${colors.lightGrey};
        &:hover,
        &:focus,
        &.active {
            color: ${colors.blue};
        }
        svg {
            width: 30px;
        }
    }
`;
const Menu = styled.ul`
    display: flex;
    flex-direction: column;
    list-style-type: none;
    padding-left: 0;
    padding: 0;
    margin: 0;
    ${media.tablet`
        flex-direction: row;
        align-items: flex-end;
        justify-content: center;
    `};
`;
const MenuItem = styled.li`
    color: ${colors.lightGrey};
    font-size: 12px;
    ${media.tablet`
        flex-grow: 1;
        flex-basis: 100%;
        height: 100%;
    `};
    a {
        color: ${colors.lightGrey};
        display: block;
        padding: 15px 0;
        border-left: 5px solid transparent;
        width: 100%;
        height: 100%;
        &:hover,
        &:focus,
        &.active {
            color: ${colors.white};
            background-color: ${colors.black};
            border-left: 5px solid ${colors.offGreen};
            text-decoration: none;
            ${media.tablet`
                border-left: 0;
                border-top: 3px solid ${colors.offGreen};
            `};
        }
        ${media.tablet`
            flex-grow: 1;
            flex-basis: 100%;
            height: 100%;
            width: 100%;
        `};
    }
    svg {
        width: 20px;
        height: 20px;
        margin-bottom: 7px;
    }
`;

const isActive = ({ isCurrent }) => (isCurrent ? { className: 'active' } : null);

const NavLink = props => <Link getProps={isActive} {...props} />;

const Navbar = () => (
    <Container>
        <Logo>
        <Link to="/">
            <FontAwesomeIcon icon={['fab', 'spotify']} size="4x" />
        </Link>
        </Logo>
        <Menu>
        <MenuItem>
            <NavLink to="/">
            <FontAwesomeIcon icon='user' size="2x" />
            <div>Profile</div>
            </NavLink>
        </MenuItem>
        <MenuItem>
            <NavLink to="/top-artists">
            <FontAwesomeIcon icon='guitar' size="2x" />
            <div>Top Artists</div>
            </NavLink>
        </MenuItem>
        <MenuItem>
            <NavLink to="/top-tracks">
            <FontAwesomeIcon icon='music' size="2x" />
            <div>Top Tracks</div>
            </NavLink>
        </MenuItem>
        <MenuItem>
            <NavLink to="/playlists">
            <FontAwesomeIcon icon='bars' size="2x" />
            <div>Playlists</div>
            </NavLink>
        </MenuItem>
        </Menu>
        <Github>
        <a
            href="https://github.com/jittner/spotify-web-app"
            target="_blank"
            rel="noopener noreferrer">
            <FontAwesomeIcon icon={['fab', 'github']} size="3x" />
        </a>
        </Github>
    </Container>
);

export default Navbar;