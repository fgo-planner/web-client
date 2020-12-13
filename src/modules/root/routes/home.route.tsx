import { RouteComponent } from 'internal';
import React, { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export class HomeRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <Fragment>
                <h2>Home!</h2>
                <div>Welcome</div>
                <Link to="/resources">Resources</Link>
            </Fragment>
        );
    }

}
