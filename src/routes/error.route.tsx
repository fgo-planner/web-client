import { ReactNode } from 'react';
import { RouteComponent } from '../components/base/route-component';

export class ErrorRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <div>
                ERROR
            </div>
        );
    }

}