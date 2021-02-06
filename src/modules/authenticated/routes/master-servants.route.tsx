import { RouteComponent } from 'internal';
import React, { ReactNode } from 'react';
import { MasterServantsList } from '../components/master/servant/master-servants-list.component';

export class MasterServantsRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <MasterServantsList />
        );
    }

}
