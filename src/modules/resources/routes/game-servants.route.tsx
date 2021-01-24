import { GameServant } from 'data';
import { RouteComponent } from 'internal';
import React, { Fragment, ReactNode } from 'react';
import { GameServantService } from 'services';
import { Container as Injectables } from 'typedi';

export class GameServantsRoute extends RouteComponent {

    private _gameServantService = Injectables.get(GameServantService);

    private _data: ReadonlyArray<Readonly<GameServant>> = [];

    async componentDidMount() {
        this._data = await this._gameServantService.getServants();
        this.forceUpdate();
    }

    render(): ReactNode {
        return (
            <Fragment>
                <div>SERVANTS</div>
                {this._data.map(this._renderServant)}
            </Fragment>
        );
    }

    private _renderServant(servant: Readonly<GameServant>, key: number) {
        return (
            <div key={key}>
                {servant.collectionNo} {servant.name}
            </div>
        );
    }

}
