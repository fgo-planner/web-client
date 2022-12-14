import React from 'react';
import { useMatch} from 'react-router-dom';
import { GameItemInfo } from '../components/game/item/game-item-info.component';
import { GameItemNotFound } from '../components/game/item/game-item-not-found.component';
import { PathPattern } from 'react-router';

const PathMatchPattern: PathPattern = {
    path: '/resources/items/:id'
};

const GameItem = React.memo(() => {
    const match = useMatch<'id', string>(PathMatchPattern);
    const id = match?.params.id;
    const itemId = Number(id);
    if (!itemId && itemId !== 0) {
        return <GameItemNotFound itemId={id} />;
    }
    return <GameItemInfo itemId={itemId} />;
});

export const GameItemRoute = React.memo(() => <GameItem />);
