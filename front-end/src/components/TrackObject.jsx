import React from "react";
import styled from 'styled-components';

const formatDuration = millis => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
const colors = {
    white: '#FFFFFF',
    lightGrey: '#9B9B9B',
};
const TrackContainer = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    margin-bottom: 20px;
`;
const TrackLeft = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 1px;
`;
const TrackRight = styled.span``;
const TrackArtwork = styled.div`
    display: inline-block;
    position: relative;
    width: 50px;
    min-width: 50px;
    margin-right: 30px;
`;
const TrackName = styled.span`
    margin-bottom: 5px;
    border-bottom: 1px solid transparent;
    &:hover,
    &:focus {
        border-bottom: 1px solid #FFFFFF;
    }
`;
const TrackAlbum = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 1px;
    margin-top: 3px;
    color: #9B9B9B;
    font-size: 14px;
`;
const TrackMeta = styled.div`
    display: grid;
    grid-template-columns: 1fr max-content;
    grid-gap: 10px;
`;
const TrackDuration = styled.span`
    color: #9B9B9B;
    font-size: 14px;
`;

const TrackObject = ({track}) => (
    <li>
    <TrackContainer>
        <TrackArtwork>
            {track.album.images.length && <img src={track.album.images[2].url} alt="Album Artwork" />}
        {/* <Image src={track.album.images[0].url} thumbnail width={100} height={100}/> */}
        </TrackArtwork>
        <TrackMeta>
            <TrackLeft>
                {track.name && <TrackName>{track.name}</TrackName>}
                {track.artists && track.album && (
                <TrackAlbum>
                {track.artists &&
                    track.artists.map(({ name }, i) => (
                    <span key={i}>
                        {name}
                        {track.artists.length > 0 && i === track.artists.length - 1 ? '' : ','}{' '}
                    </span>
                    ))}
                {' '}&middot;{'  '}
                {track.album.name}
                </TrackAlbum>
            )}
            </TrackLeft>
            <TrackRight>
                {track.duration_ms && <TrackDuration>{formatDuration(track.duration_ms)}</TrackDuration>}
            </TrackRight>
        </TrackMeta>
    </TrackContainer>
</li> 
);

export default TrackObject;