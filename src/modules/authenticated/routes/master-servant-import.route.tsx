import { ReactNode } from 'react';
import { RouteComponent } from '../../../components/base/route-component';
import { MasterServantImport } from '../components/master/servant/master-servant-import.component';

export default class MasterServantImportRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <MasterServantImport />
        );
    }

}
