import { ReactNode } from 'react';
import { RouteComponent } from '../../../components/base/route-component';
import { MasterItems } from '../components/master/item/master-items.component';

export class MasterItemsRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <div className="py-2">
                <MasterItems />
            </div>
        );
    }

}
