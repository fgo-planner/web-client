import { ReactNode } from 'react';
import { RouteComponent } from '../components/base/route-component';
import { PageTitle } from '../components/page-title.component';

export class ForgotPasswordRoute extends RouteComponent {

    render(): ReactNode {
        return <PageTitle>Forgot Password</PageTitle>;
    }
    
}