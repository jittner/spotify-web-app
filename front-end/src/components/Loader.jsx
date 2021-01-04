import React from "react";
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import styled from 'styled-components';

const Centered = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 90vh;
`;

const Loader = () => (
    <Container fluid>
        <Centered>
            <Spinner animation="border" />
        </Centered>
    </Container>
);

export default Loader;