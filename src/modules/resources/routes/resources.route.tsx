import { RouteComponent } from 'internal';
import React, { ReactNode, Fragment } from 'react';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

export class ResourcesRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <Fragment>
                <div>RESOURCES</div>
                <Button variant="contained"
                        color="primary"
                        component={Link}
                        to={`${this.props.location.pathname}/servants`}>
                    Servants
                </Button>
                <Button variant="contained"
                        color="primary" 
                        component={Link}
                        to={`${this.props.location.pathname}/events`}>
                     Events
                </Button>
            </Fragment>

        );
    }

}
