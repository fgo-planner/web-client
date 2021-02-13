import { ReactNode } from 'react';
import { RouteComponent } from '../../../components/base/route-component';
import { MasterServants } from '../components/master/servant/master-servants.component';

export class MasterServantsRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <MasterServants />
        );
    }

}
