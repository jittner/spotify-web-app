import React from "react";
import styled from 'styled-components';
import Modal from 'react-bootstrap/Modal';
import { media } from '../style/media';
import theme from '../style/theme';
const { colors, fontSizes, spacing } = theme;

const formatWithCommas = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const ModalContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    text-align: center;
    font-family: Circular, sans-serif;
`;
const Stats = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 10px;
    margin-top: ${spacing.sm};
    margin-bottom: ${spacing.lg};
    text-align: center;
`;
const Stat = styled.div``;
const Number = styled.div`
    color: ${colors.blue};
    font-weight: 700;
    font-size: ${fontSizes.lg};
    text-transform: capitalize;
    ${media.tablet`
        font-size: ${fontSizes.md};
    `};
`;
const Genre = styled.div`
    font-size: ${fontSizes.md};
`;
const NumLabel = styled.p`
    color: ${colors.lightGrey};
    font-size: ${fontSizes.xs};
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: ${spacing.xs};
`;
const ArtistContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
`;
const ArtistArtwork = styled.div`
    display: inline-block;
    position: relative;
    width: 200px;
    height: 200px;
    transition: all 0.25s cubic-bezier(0.3, 0, 0.4, 1);
    img {
        border-radius: 100%;
        object-fit: cover;
        width: 200px;
        height: 200px;
    }
    &:hover {
        background-color:#000;
        opacity:0.5;
        cursor: pointer;
    }
`;
const ArtistName = styled.a`
    margin: 30px 0;
    color: #FFFFFF;
    &:hover {
        border-bottom: 1px solid ${colors.white};
        color: ${colors.white};
        cursor: pointer;
    }
`;
const ArtistLink = styled.a`
    color: ${colors.black};
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.3, 0, 0.4, 1);
    &:hover {
        color: ${colors.blue};
        text-decoration: none;
    }
`;

class Artist extends React.Component {
    constructor() {
        super();
        this.state = {
            show: null
        };
    }
    render() {
        const handleClose = () => this.setState({show: false});
        const handleShow = () => this.setState({show: true});
        const artist = this.props
        return (
            <ArtistContainer>
                <ArtistArtwork>
                    {artist.images.length && <img src={artist.images[1].url} alt="Artist" onClick={handleShow} />}
                </ArtistArtwork>
                <ArtistName onClick={handleShow}>
                    {artist.name}
                </ArtistName>
                <Modal show={this.state.show} onHide={handleClose} centered>
                    <Modal.Header closeButton className="border-0" />
                    <Modal.Body>
                        <ModalContainer>
                            <ArtistLink href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                                <h2>{artist.name}</h2>
                            </ArtistLink>
                            <Stats>
                                <Stat>
                                    <NumLabel>Followers</NumLabel>
                                    <Number>{formatWithCommas(artist.followers.total)}</Number>
                                </Stat>
                                {artist.genres && (
                                    <Stat>
                                        <NumLabel>Genres</NumLabel>
                                        <Number>
                                        {artist.genres.map(genre => (
                                            <Genre key={genre}>{genre}</Genre>
                                        ))}
                                        </Number>
                                    </Stat>
                                )}
                                <Stat>
                                    <NumLabel>Popularity</NumLabel>
                                    <Number>{artist.popularity}/100</Number>
                                </Stat>
                            </Stats>
                        </ModalContainer>
                    </Modal.Body>
                </Modal>
            </ArtistContainer>
        );
    }
}

export default Artist;