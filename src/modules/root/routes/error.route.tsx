import { RouteComponent } from 'internal';
import React, { ReactNode } from 'react';

export class ErrorRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <div>
                ERROR
            </div>
        );
    }

}