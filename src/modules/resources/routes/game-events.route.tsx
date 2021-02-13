import { Fragment, ReactNode } from 'react';
import { RouteComponent } from '../../../components/base/route-component';

export class GameEventsRoute extends RouteComponent {

    render(): ReactNode {
        console.log(this.props)
        return (
            <Fragment>
                <div>EVENTS</div>
                <div>{(this.props.match?.params as any)['id']}</div>
            </Fragment>
        );
    }

}
