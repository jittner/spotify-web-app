import React from 'react';
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
`;

const NotFound = () => (
    <Container className="p-2">
        <Centered>
            <IconContainer>
                <FontAwesomeIcon icon="ghost" size="8x"/>
            </IconContainer>
            <MessageContainer>
                <h1>404</h1>
                <h2>Page not found</h2>
            </MessageContainer>
        </Centered>
    </Container>
);

export default NotFound;

