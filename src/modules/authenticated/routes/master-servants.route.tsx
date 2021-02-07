import { RouteComponent } from 'internal';
import React, { ReactNode } from 'react';
import { MasterServants } from '../components/master/servant/master-servants.component';

export class MasterServantsRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <MasterServants />
        );
    }

}
