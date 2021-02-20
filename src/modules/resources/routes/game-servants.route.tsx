import React, { Fragment, PureComponent, ReactNode } from 'react';
import { GameServantService } from '../../../services/data/game/game-servant.service';
import { GameServant } from '../../../types';

class GameServants extends PureComponent {

    private _gameServants: ReadonlyArray<Readonly<GameServant>> = [];

    componentDidMount(): void {
        GameServantService.getServants().then(gameServants => {
            this._gameServants = gameServants;
            this.forceUpdate();
        });
    }

    render(): ReactNode {
        return (
            <Fragment>
                <div>SERVANTS</div>
                {this._gameServants.map(this._renderServant)}
            </Fragment>
        );
    }

    private _renderServant(servant: Readonly<GameServant>, key: number): ReactNode {
        return (
            <div key={key}>
                {servant.collectionNo} {servant.name}
            </div>
        );
    }

}

export const GameServantsRoute = React.memo(() => <GameServants />);
