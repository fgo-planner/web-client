import { RouteComponent } from 'internal';
import React, { ReactNode, Fragment } from 'react';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

export class GameAccountHomeRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <Fragment>
                Account HOME!
            </Fragment>
        )
    }

}
