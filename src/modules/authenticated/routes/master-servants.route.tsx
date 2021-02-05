import { RouteComponent } from 'internal';
import React, { Fragment, ReactNode } from 'react';
import { MasterServantsList } from '../components/master/servant/master-servants-list.component';

export class MasterServantsRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <Fragment>
                <div>MY SERVANTS</div>
                <MasterServantsList />
            </Fragment>
        );
    }

}
