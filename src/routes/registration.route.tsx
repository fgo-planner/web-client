import { ReactNode } from 'react';
import { RouteComponent } from '../components/base/route-component';
import { PageTitle } from '../components/text/page-title.component';

export class RegistrationRoute extends RouteComponent {

    render(): ReactNode {
        return <PageTitle>Create Account</PageTitle>;
    }
    
}