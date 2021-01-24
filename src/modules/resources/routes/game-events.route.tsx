import { RouteComponent } from 'internal';
import React, { ReactNode, Fragment } from 'react';

export class GameEventsRoute extends RouteComponent {

    render(): ReactNode {
        console.log(this.props)
        return (
            <Fragment>
                <div>EVENTS</div>
                <div>{(this.props.match?.params as any)['id']}</div>
            </Fragment>
        );
    }

}
