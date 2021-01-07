import React from "react";
import Container from 'react-bootstrap/Container';
import styled from 'styled-components';
import Error from '../components/Error';
import Loader from '../components/Loader';
import TrackObject from '../components/TrackObject';
import { media } from '../style/media';
import theme from '../style/theme';
const { colors } = theme;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 50px;
    ${media.tablet`
        display: block;
        text-align: center;
    `};
    h2 {
        margin: 0;
    }
`;
const Ranges = styled.div`
    display: flex;
    margin-right: -11px;
`;
const RangeButton = styled.button`
    background-color: transparent;
    border-width: 0;
    color: ${props => (props.isActive ? colors.white : colors.lightGrey)};
    font-size: 20px;
    font-weight: 500;
    padding: 10px;
    span {
        padding-bottom: 2px;
        border-bottom: 1px solid ${props => (props.isActive ? colors.green : `transparent`)};
        line-height: 1.5;
        white-space: nowrap;
    };
    &:focus {
        outline: none;
    };
    &:hover {
        color: #FFFFFF;
    }
`;
const TracksContainer = styled.ul`
    margin-top: 50px;
    list-style-type: none;
    padding-left: 0;
`;

class TopTracks extends React.Component {
    constructor() {
        super();
        this.state = {
            activeRange: 'long_term',
            topTracks: {
                'long_term': null,
                'medium_term': null,
                'short_term': null,
            },
            errorMessage: null,
        };
    }
    getData(range) {
        fetch(`http://localhost:5000/user/top-tracks/${range}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',        
            },
            credentials: 'include'
        })
        .then(async response => {
            const topTracks = await response.json();
            if (!response.ok){
                const error = (topTracks && topTracks.message) || response.status;
                return Promise.reject(error);
            }
            const newState = Object.assign({}, this.state);
            newState.topTracks[range] = topTracks;
            this.setState(newState);
        })
        .catch(error => {
            this.setState({errorMessage: error})
        });
    }
    async changeRange(range) {
        if (!this.state.topTracks[range]) {
            this.getData(range);
        }
        this.setState({activeRange: range});
    }
    componentDidMount() {
        this.getData('long_term');
    }
    render() {
        const error = this.state.errorMessage;
        const activeRange = this.state.activeRange;
        const topTracks = this.state.topTracks[activeRange];
        if (error) {
            return (<Error />);
        }
        return (
            <div>
                <Container className="p-2">
                    <Header>
                        <h2>Top Tracks</h2>
                        <Ranges>
                            <RangeButton
                                isActive={activeRange === 'long_term'}
                                onClick={() => this.changeRange('long_term')}>
                                <span>All Time</span>
                            </RangeButton>
                            <RangeButton
                                isActive={activeRange === 'medium_term'}
                                onClick={() => this.changeRange('medium_term')}>
                                <span>Last 6 Months</span>
                            </RangeButton>
                            <RangeButton
                                isActive={activeRange === 'short_term'}
                                onClick={() => this.changeRange('short_term')}>
                                <span>Last 4 Weeks</span>
                            </RangeButton>
                        </Ranges>
                    </Header>
                    <TracksContainer>
                        {topTracks ? (
                            topTracks.data.map((track) => (
                                <TrackObject track={track} />
                            ))
                        )
                        :
                        (<Loader />)  
                        }
                    </TracksContainer>
                </Container>
            </div>
        );
    }
}

export default TopTracks;