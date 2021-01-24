import { GameItem } from 'data';
import { RouteComponent } from 'internal';
import React, { Fragment, ReactNode } from 'react';
import { GameItemService } from 'services';
import { Container as Injectables } from 'typedi';

export class GameItemsRoute extends RouteComponent {

    private _gameItemService = Injectables.get(GameItemService);

    private _data: ReadonlyArray<Readonly<GameItem>> = [];

    async componentDidMount() {
        this._data = await this._gameItemService.getItems();
        this.forceUpdate();
    }

    render(): ReactNode {
        return (
            <Fragment>
                <div>ITEMS</div>
                {this._data.map(this._renderItem)}
            </Fragment>
        );
    }

    private _renderItem(item: Readonly<GameItem>, key: number) {
        return (
            <div key={key}>
                {item.name}
            </div>
        );
    }

}
