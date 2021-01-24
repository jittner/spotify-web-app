import React from "react";
import Container from 'react-bootstrap/Container';
import styled from 'styled-components';
import Artist from '../components/Artist';
import Error from '../components/Error';
import Loader from '../components/Loader';
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
const ArtistsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 20px;
    margin-top: 50px;
`;

class TopArtists extends React.Component {
    constructor() {
        super();
        this.state = {
            activeRange: 'long_term',
            topArtists: {
                'long_term': null,
                'medium_term': null,
                'short_term': null,
            },
            errorMessage: null,
        };
    }
    getData(range) {
        fetch(`http://localhost:5000/user/top-artists/${range}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',        
            },
            credentials: 'include'
        })
        .then(async response => {
            const topArtists = await response.json();
            if (!response.ok){
                const error = (topArtists && topArtists.message) || response.status;
                return Promise.reject(error);
            }
            const newState = Object.assign({}, this.state);
            newState.topArtists[range] = topArtists;
            this.setState(newState);
        })
        .catch(error => {
            this.setState({errorMessage: error})
        });
    }
    async changeRange(range) {
        if (!this.state.topArtists[range]) {
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
        const topArtists = this.state.topArtists[activeRange];
        if (error) {
            return (<Error errorCode={error}/>);
        }
        return (
            <div>
                <Container className="p-2">
                    <Header>
                        <h2>Top Artists</h2>
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
                    <ArtistsContainer>
                        {topArtists ? (
                            topArtists.data.map(({ id,  external_urls, images, name, followers, genres, popularity }, idx) => (
                                <Artist 
                                    external_urls={external_urls} 
                                    images={images} 
                                    name={name} 
                                    followers={followers} 
                                    genres={genres} 
                                    popularity={popularity}
                                    key={idx}
                                />
                            ))
                        )
                        :
                        (
                        <Loader />
                        )
                        }    
                    </ArtistsContainer>
                </Container>
            </div>
        );
    } 
}

export default TopArtists;