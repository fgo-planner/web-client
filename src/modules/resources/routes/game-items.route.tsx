import React, { Fragment, PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { GameItemService } from '../../../services/data/game/game-item.service';
import { GameItem } from '../../../types';

class GameItems extends PureComponent {

    private _gameItems: ReadonlyArray<Readonly<GameItem>> = [];

    componentDidMount(): void {
        GameItemService.getItems().then(gameItems => {
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
            <div key={key} className="flex">
                <Link to={`items/${item._id}`}>
                    {item._id}
                </Link>
                <div>
                    {item.name}
                </div>
            </div>
        );
    }

}

export const GameItemsRoute = React.memo(() => <GameItems />);
