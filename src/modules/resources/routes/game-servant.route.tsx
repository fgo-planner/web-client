import { RouteComponent } from 'internal';
import React, { ReactNode } from 'react';
import { RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';

type Props = ReactRouteComponentProps<{ id: string }>;

export const GameServantRoute = withRouter(class extends RouteComponent<Props> {

    render(): ReactNode {
        const { match } = this.props;
        const servantId = Number(match.params['id']);
        return (
            <div>
                {servantId ?? `Servant ID ${servantId} not found...`}
            </div>
        );
    }

});