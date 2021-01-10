import { TextField } from '@material-ui/core';
import { RouteComponent } from 'internal';
import React, { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type State = {
    test: string;
}

export class HomeRoute extends RouteComponent<{}, State> {

    constructor(props: {}) {
        super(props);
        this.state = {
            test: 'asdf'
        };
    }

    render(): ReactNode {
        console.log("Rendered")
        return (
            <Fragment>
                <h2>Home!</h2>
                <div>Welcome</div>
                <Link to="/resources">Resources</Link>
            </Fragment>
        );
    }

    testHandler(event: any) {
        this.setState({test: event.target.value});
    }

}
