import React from "react";
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styled from 'styled-components';
import Error from '../components/Error';
import Loader from '../components/Loader';
import TrackObject from '../components/TrackObject';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const colors = {
    green: '#1DB954',
    offGreen: '#1ed760',
    blue: '#509bf5',
    navBlack: '#040306',
    black: '#181818',
    white: '#FFFFFF',
    lightestGrey: '#b3b3b3',
    lightGrey: '#9B9B9B',
    grey: '#404040',
    darkGrey: '#282828',
};
const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
const Number = styled.div`
    color: ${colors.green};
    font-weight: 700;
    font-size: 23px;
`;
const NumLabel = styled.p`
    color: ${colors.lightGrey};
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 0;
`;
const ColumnContainer = styled.ul`
    list-style-type: none;
    padding-left: 0;
    margin-top: 40px;
    font-family: AvenirNext;
`;
const Artist = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 24px;
`;
const ArtistArtwork = styled.div`
    display: inline-block;
    position: relative;
    width: 60px;
    min-width: 60px;
    margin-right: 20px;
    img {
        width: 50px;
        min-width: 60px;
        height: 60px;
        margin-right: 20px;
        border-radius: 100%;
    }
`;
const ArtistName = styled.div`
    flex-grow: 1;
    span {
        border-bottom: 1px solid transparent;
        &:hover,
        &:focus {
        border-bottom: 1px solid #FFFFFF;
        }
    }
`;

class User extends React.Component {
    constructor() {
        super();
        this.state = {
            data: null,
            errorMessage: null,
        };
    }
    getData() {
        fetch('http://localhost:5000/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',        
            },
            credentials: 'include'
        })
        .then(async response => {
            const profile = await response.json();
            if (!response.ok){
                const error = (profile && profile.message) || response.status;
                return Promise.reject(error);
            }
            this.setState({data: profile})
        })
        .catch(error => {
            this.setState({errorMessage: error})
        });
    }
    componentDidMount() {
        this.getData();
    }
    render() {
        const error = this.state.errorMessage;
        if (error) {
            return (<Error errorCode={error}/>);
        }
        return (
            <div>
            {this.state.data ?
            <Container fluid>
                <Jumbotron fluid>
                    <Row className="justify-content-center">
                        {this.state.data.image ? (
                            <img src={this.state.data.image} class="profile-picture" alt="user profile"/>
                        )
                        :
                        <FontAwesomeIcon icon='user' size="6x" />
                        }
                    </Row>
                    <Row className="justify-content-center"><h1>{this.state.data.name}</h1></Row>
                    <Col>
                        <Row className="justify-content-center">
                            <Number>{this.state.data.followers}</Number>
                        </Row>
                        <Row className="justify-content-center">
                            <NumLabel>Followers</NumLabel>
                        </Row>
                    </Col>
                </Jumbotron>
                <Container className="p-2">
                    <Row>
                        <Col lg={true}>
                            <Header>
                                <h4>Your all-time top artists</h4>
                                <Button variant="outline-light" href={'/top-artists'}>
                                    See more
                                </Button>
                            </Header>
                            <ColumnContainer>
                            {
                                this.state.data.top_artists.map((artist, idx) => (
                                    <li key={idx}>
                                        <Artist>
                                            <ArtistArtwork>
                                            {artist.images.length && (
                                            <img src={artist.images[2].url} alt="Artist" />
                                            )}
                                            </ArtistArtwork>
                                            <ArtistName>
                                            <span>{artist.name}</span>
                                            </ArtistName>
                                        </Artist>
                                    </li>
                                ))
                            }
                            </ColumnContainer>
                        </Col>
                        <Col lg={true}>
                            <Header>
                                <h4>Your all-time top tracks</h4>
                                <Button variant="outline-light" href={'/top-tracks'}>
                                    See more
                                </Button>
                            </Header>
                            <ColumnContainer>
                            {
                                this.state.data.top_tracks.map((track, idx) => (
                                    <TrackObject track={track} key={idx} />
                                ))
                            }
                            </ColumnContainer>
                        </Col>
                    </Row>
                </Container>
            </Container>
            :
            <Loader />
            }
            </div>
        );
    }
}

export default User;
