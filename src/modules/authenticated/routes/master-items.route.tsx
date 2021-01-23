import { Box } from '@material-ui/core';
import { RouteComponent } from 'internal';
import React, { ReactNode } from 'react';
import { MasterItemsList } from '../components/master/item/master-items-list.component';

export class MasterItemsRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <Box py={2}>
                <MasterItemsList />
            </Box>
        );
    }

}
