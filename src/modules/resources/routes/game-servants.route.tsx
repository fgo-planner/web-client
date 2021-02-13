import { Fragment, ReactNode } from 'react';
import { Container as Injectables } from 'typedi';
import { RouteComponent } from '../../../components/base/route-component';
import { GameServantService } from '../../../services/data/game/game-servant.service';
import { GameServant } from '../../../types';

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
