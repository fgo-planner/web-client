import { RouteComponent } from 'internal';
import React, { ReactNode } from 'react';
import { RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';
import { GameItemInfo } from '../components/game/item/game-item-info.component';
import { GameItemNotFound } from '../components/game/item/game-item-not-found.component';

type Props = ReactRouteComponentProps<{ id: string }>;

export const GameItemRoute = withRouter(class extends RouteComponent<Props> {

    render(): ReactNode {
        const { match } = this.props;
        const itemId = Number(match.params['id']);
        if (!itemId && itemId !== 0) {
            return <GameItemNotFound itemId={match.params['id']} />;
        }
        return (
            <div>
                <GameItemInfo itemId={itemId} />
            </div>
        );
    }

});