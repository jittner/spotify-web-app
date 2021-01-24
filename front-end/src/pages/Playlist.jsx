import React from "react";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Attributes from '../components/Attributes';
import Error from '../components/Error';
import Loader from '../components/Loader';
import TrackObject from '../components/TrackObject';

const colors = {
    white: '#FFFFFF',
    lightGrey: '#9B9B9B',
    darkGrey: '#282828',
};
const PlaylistContainer = styled.div`
    display: flex;
    margin-top: 50px;
`;
const Left = styled.div`
    text-align: center;
    tspan {
        fill: ${colors.white};
    }
`;
const Right = styled.div`
    flex-grow: 1;
    margin-left: 50px;
`;
const TracksContainer = styled.ul`
    list-style-type: none;
    padding-left: 0;
`;
const PlaylistCover = styled.div`
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    margin-bottom: 20px;
`;
const PlaylistImage = styled.img`
    width: 300px;
    height: 300px;
    object-fit: cover;
`;
const Name = styled.a`
    font-weight: 700;
    font-size: 30px;
    color: ${colors.white};
    transition: all 0.25s cubic-bezier(0.3, 0, 0.4, 1);
    &:hover,
    &:focus {
        text-decoration: none;
        color: ${colors.green};
    }
    h3 {
        font-size: 30px;
    }
`;
const Description = styled.p`
    font-size: 14px;
    color: ${colors.lightGrey};
    a {
        color: ${colors.white};
        border-bottom: 1px solid transparent;
        &:hover,
        &:focus {
            border-bottom: 1px solid ${colors.white};
        }
    }
`;
const Owner = styled.p`
    font-size: 14px;
    color: ${colors.lightGrey};
`;
const TotalTracks = styled.p`
    font-size: 14px;
    color: ${colors.white};
    margin-top: 20px;
`;
const Features = styled.p`
    font-size: 19px;
    font-weight: bold;
`;

class Playlist extends React.Component {
    constructor() {
        super();
        this.state = {
            data: null,
            errorMessage: null
        };
    }
    getData() {
        const pathname = window.location.pathname.split('/')
        const playlist_id = pathname[pathname.length - 1]
        fetch(`http://localhost:5000/playlists/${playlist_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',        
            },
            credentials: 'include'
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok){
                const error = (data && data.message) || response.status;
                return Promise.reject(error);
            }
            this.setState({data: data})
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
        const playlist = this.state.data;
        if (error) {
            return (<Error errorCode={error}/>);
        }      
        return (
            <div>
                <Container className="p-2">
                    {playlist ? (
                        <PlaylistContainer>
                            <Row>
                                <Col lg={true} className="mb-5">
                                    <Left>
                                        {playlist.info.images.length && (
                                            <PlaylistCover>
                                                <PlaylistImage src={playlist.info.images[0].url} alt="Album Art" />
                                            </PlaylistCover>
                                        )}
                                        <Name href={playlist.info.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                                            <h3>{playlist.info.name}</h3>
                                        </Name>
                                        <Owner>By {playlist.info.owner.display_name}</Owner>
                                        {playlist.info.description && (
                                            <Description dangerouslySetInnerHTML={{ __html: playlist.info.description }} />
                                        )}
                                        <TotalTracks>{playlist.length} Tracks</TotalTracks>
                                        <Features>Average Audio Features</Features>
                                        <Attributes data={playlist.attributes} />
                                        <Button variant="primary" href={'/recommendations/' + playlist.info.id}>
                                            Get recommendations
                                        </Button>
                                    </Left>
                                </Col>
                                <Col lg={true}>
                                    <TracksContainer>
                                        {playlist.tracks &&
                                        playlist.tracks.map(({ track }, i) => (
                                        <TrackObject track={track} key={i} />
                                        ))}
                                    </TracksContainer>
                                </Col>
                            </Row>
                        </PlaylistContainer>
                    )
                    :
                    (<Loader />)  
                    }
                </Container>
            </div>
        );
    }
}

export default Playlist;