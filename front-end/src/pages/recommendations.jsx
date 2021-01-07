import React from "react";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import styled from 'styled-components';
import CreatePlaylist from '../components/CreatePlaylist';
import Attributes from '../components/Attributes';
import Error from '../components/Error';
import Loader from '../components/Loader';
import TrackObject from '../components/TrackObject';
import { media } from '../style/media';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import theme from '../style/theme';
const { colors } = theme;

const TracksContainer = styled.ul`
    list-style-type: none;
    padding-left: 0;
`;
const Header = styled.h3`
    margin-top: 50px;
    margin-bottom: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    ${media.tablet`
        display: block;
        text-align: center;
    `};
`;
const BodyHeader = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
`;
const Features = styled.p`
    font-size: 19px;
    font-weight: bold;
    margin-top: 50px;
`;
const Icon = styled.p`
    color: ${colors.lightGrey}
`;
const FeaturesContainer = styled.div`
    text-align: center;
`;

class Recommendations extends React.Component {
    constructor() {
        super();
        this.state = {
            data: null,
            errorMessage: null,
            show: null
        };
    }
    getData() {
        const pathname = window.location.pathname.split('/')
        const playlist_id = pathname[pathname.length - 1]
        fetch(`http://localhost:5000/playlists/${playlist_id}/recommendations`, {
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
        const data = this.state.data;
        const error = this.state.errorMessage;
        const handleClose = () => this.setState({show: false});
        const handleShow = () => this.setState({show: true});
        if (error) {
            return (<Error />);
        }
        return (
            <Container className="p-2">
                {data ? (
                    <Row>
                        <Col lg={true}>
                            <Header>Based on...
                                <OverlayTrigger
                                    key="right"
                                    placement="right"
                                    overlay={
                                    <Tooltip id="tooltip">
                                        By clustering your playlist into groups of songs based 
                                        on their audio features, these tracks were picked to represent
                                        the playlist.
                                    </Tooltip>
                                    }
                                >
                                    <Icon><FontAwesomeIcon icon="question-circle" /></Icon>
                                </OverlayTrigger>
                            </Header>
                            <TracksContainer>
                                {data.recommendations.seeds &&
                                data.recommendations.seeds.map((track, i) => (
                                    <TrackObject track={track} key={i} />
                                ))}
                            </TracksContainer>
                            <FeaturesContainer>
                                <Features>Seed Track Audio Features</Features>
                                <Attributes data={data.seedAttributes} />
                            </FeaturesContainer>
                        </Col>
                        <Col lg={true}>
                            <Header>
                                Recommended songs
                                <Button onClick={handleShow}>
                                    Save to Spotify
                                </Button>
                                <Modal show={this.state.show} onHide={handleClose} centered>
                                    <Modal.Header closeButton className="border-0">
                                    </Modal.Header>
                                    <Modal.Body>
                                        <BodyHeader><h4>Create a new playlist</h4></BodyHeader>
                                        <CreatePlaylist tracks={data.recommendations.tracks.map((track, i) => (
                                            track.id
                                        ))}/>
                                    </Modal.Body>
                                </Modal>
                            </Header>
                            <TracksContainer>
                                {data.recommendations.tracks &&
                                data.recommendations.tracks.map((track, i) => (
                                    <TrackObject track={track} key={i} />
                                ))}
                            </TracksContainer>
                        </Col>
                    </Row>
                )
                :
                (<Loader />)  
                }
            </Container>
        );
    }
}

export default Recommendations;