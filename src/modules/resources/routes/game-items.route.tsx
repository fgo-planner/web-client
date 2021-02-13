import { Box } from '@material-ui/core';
import { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Container as Injectables } from 'typedi';
import { RouteComponent } from '../../../components/base/route-component';
import { GameItemService } from '../../../services/data/game/game-item.service';
import { GameItem } from '../../../types';

export class GameItemsRoute extends RouteComponent {

    private _gameItemService = Injectables.get(GameItemService);

    private _gameItems: ReadonlyArray<Readonly<GameItem>> = [];

    componentDidMount(): void {
        this._gameItemService.getItems().then(gameItems => {
            this._gameItems = gameItems;
            this.forceUpdate();
        });
    }

    render(): ReactNode {
        return (
            <Fragment>
                <div>ITEMS</div>
                {this._gameItems.slice(0, 100).map(this._renderItem)}
            </Fragment>
        );
    }

    private _renderItem(item: Readonly<GameItem>, key: number): ReactNode {
        return (
            <Box key={key} display="flex">
                <Link to={`items/${item._id}`}>
                    {item._id}
                </Link>
                <div>
                    {item.name}
                </div>
            </Box>
        );
    }

}
