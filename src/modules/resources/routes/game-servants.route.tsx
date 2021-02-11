import { GameServant } from 'data';
import { RouteComponent } from 'internal';
import React, { Fragment, ReactNode } from 'react';
import { GameServantService } from 'services';
import { Container as Injectables } from 'typedi';

export class GameServantsRoute extends RouteComponent {

    private _gameServantService = Injectables.get(GameServantService);

    private _gameServants: ReadonlyArray<Readonly<GameServant>> = [];

    componentDidMount(): void {
        this._gameServantService.getServants().then(gameServants => {
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
