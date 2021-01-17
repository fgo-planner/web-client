import { RouteComponent } from 'internal';
import React, { ReactNode } from 'react';
import { GameAccountItems } from '../components/game-account-items/game-account-items.component';

export class GameAccountItemsRoute extends RouteComponent {

    render(): ReactNode {
        return (
            <GameAccountItems />
        );
    }

}
