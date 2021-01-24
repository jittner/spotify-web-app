import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import theme from '../style/theme';
const { colors } = theme;

const Centered = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 90vh;
`;
const IconContainer = styled.div`
    margin-right: 50px;
`;
const MessageContainer = styled.div`
    display: block;
    text-align: center;
    color: ${colors.green};
    h1 {
        font-size: 70px;
        font-weight: bold;
    }
    h2 {
        font-size: 40px;
    }
    h4 {
        margin-bottom: 30px;
    }
`;

const Error = ({errorCode}) => (
    <Container className="p-2">
        {errorCode == 401 ? 
            (
                <Centered>
                    <IconContainer>
                        <FontAwesomeIcon icon="times-circle" size="6x"/>
                    </IconContainer>
                    <MessageContainer>
                        <h1>401</h1>
                        <h2>Hmmm...something went wrong</h2>
                        <h4>Check if third-party cookies are enabled, then try signing in again</h4>
                        <Button href="http://localhost:5000/">
                            <FontAwesomeIcon icon={['fab', 'spotify']} /> Connect with Spotify
                        </Button>
                    </MessageContainer>
                </Centered>
            )
            :
            (
                <Centered>
                    <IconContainer>
                        <FontAwesomeIcon icon="robot" size="6x"/>
                    </IconContainer>
                    <MessageContainer>
                        <h1>500</h1>
                        <h2>Hmmm...something went wrong</h2>
                        <h4>If you manually entered the URL, it might be incorrect</h4>
                    </MessageContainer>
                </Centered>
            )
        }
    </Container>
);

export default Error;
