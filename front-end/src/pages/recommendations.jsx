import React from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import { Link } from "react-router-dom";

import PlaylistForm from "../components/playlist-recommendations-form";
import GeneratedForm from "../components/generated-recommendations-form";
import ButtonGroup from 'react-bootstrap/ButtonGroup';

class Recommendations extends React.Component {
    constructor(){
        super();
        this.state = {
            currentView: "playlist"
        };
    }

    render() {
        const switchView = () => {
            switch(this.state.currentView){
                case "playlist": return <PlaylistForm />;
                case "generated": return <GeneratedForm />;
                default: return <PlaylistForm />;
            }
        }
        return(
            <Container className="p-3">
            <Card>
            <Card.Header as="h5">
            <Link to="/"> {'<'} </Link>
            </Card.Header>
            <Card.Body>
                <ButtonGroup>
                    <Button onClick={(e) => this.setState({currentView: "playlist"})}>From playlist</Button>
                    <Button onClick={(e) => this.setState({currentView: "generated"})}>From top tracks/artists</Button>
                </ButtonGroup>
                {
                    switchView()
                }
            </Card.Body>
            </Card>
            </Container>
        );
    }

};

export default Recommendations;