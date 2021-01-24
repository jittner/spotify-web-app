import React from "react";
import Container from 'react-bootstrap/Container';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from "react-router-dom";
import Error from '../components/Error';
import Loader from '../components/Loader';
import { media } from '../style/media';
import theme from '../style/theme';
const { colors } = theme;

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;
const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 50px;
    ${media.tablet`
        justify-content: center;
    `};
    h2 {
        margin: 0;
    }
`;
const PlaylistsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 30px;
    width: 100%;
    margin-top: 50px;
`;
const Playlist = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
`;
const PlaylistImage = styled.img`
    width: 200px;
    height: 200px;
    object-fit: cover;
`;
const PlaylistCover = styled(Link)`
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    transition: all 0.25s cubic-bezier(0.3, 0, 0.4, 1);
    position: relative;
    width: 100%;
    margin-bottom: 20px;
    color: ${colors.white}
    &:hover {
        background-color:#000;
        opacity:0.5;
    }
`;
const PlaceholderArtwork = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    background-color: ${colors.darkGrey};
    svg {
        width: 50px;
        height: 50px;
    }
`;
const PlaceholderContent = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
`;
const PlaylistName = styled(Link)`
    display: inline;
    border-bottom: 1px solid transparent;
    color: ${colors.white};
    &:hover,
    &:focus {
        color: ${colors.white};
        text-decoration: none;
        border-bottom: 1px solid ${colors.white};
    }
`;
const TotalTracks = styled.div`
    text-transform: uppercase;
    margin: 5px 0;
    color: ${colors.lightGrey};
    font-size: 11px;
    letter-spacing: 1px;
`;
class UserPlaylists extends React.Component {
    constructor() {
        super();
        this.state = {
            playlists: null,
            errorMessage: null
        };
    }
    getData() {
        fetch('http://localhost:5000/user/playlists', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',        
            },
            credentials: 'include'
        })
        .then(async response => {
            const playlists = await response.json();
            if (!response.ok){
                const error = (playlists && playlists.message) || response.status;
                return Promise.reject(error);
            }
            this.setState({playlists: playlists})
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
                <Container className="p-2">
                    <Header>
                        <h2>Your Playlists</h2>
                    </Header>
                    <Wrapper>
                    <PlaylistsContainer>
                        {this.state.playlists ? (
                            this.state.playlists.data.map(({id, images, name, tracks}) => (
                                <Playlist key={id}>
                                    <PlaylistCover to={"/playlists/" + id}>
                                    {images.length ? (
                                        <PlaylistImage src={images[0].url} alt="Album Art" />
                                    ) : (
                                        <PlaceholderArtwork>
                                            <PlaceholderContent>
                                                <FontAwesomeIcon icon="music" size="5x" />
                                            </PlaceholderContent>
                                        </PlaceholderArtwork>
                                    )}
                                    </PlaylistCover>
                                    <div>
                                    <PlaylistName to={"/playlists/" + id}>{name}</PlaylistName>
                                    <TotalTracks>{tracks.total} Tracks</TotalTracks>
                                    </div>
                                </Playlist>
                            ))
                        )
                        :
                        (<Loader />)  
                        }
                    </PlaylistsContainer>
                    </Wrapper>
                </Container>
            </div>
        );
    }
}

export default UserPlaylists;