import { RouteComponent } from 'internal';
import React, { ReactNode } from 'react';
import { MasterItems } from '../components/master/item/master-items.component';

export class MasterItemsRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <MasterItems />
        );
    }

}
