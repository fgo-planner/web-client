import { Box } from '@material-ui/core';
import { ReactNode } from 'react';
import { RouteComponent } from '../../../components/base/route-component';
import { MasterItems } from '../components/master/item/master-items.component';

export class MasterItemsRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <Box py={2}>
                <MasterItems />
            </Box>
        );
    }

}
