import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { GameItemInfo } from '../components/game/item/game-item-info.component';
import { GameItemNotFound } from '../components/game/item/game-item-not-found.component';

const GameItem = React.memo(() => {
    const match = useRouteMatch<{ id: string }>();
    const { id } = match.params;
    const itemId = Number(id);
    if (!itemId && itemId !== 0) {
        return <GameItemNotFound itemId={match.params['id']} />;
    }
    return <GameItemInfo itemId={itemId} />;
});

export const GameItemRoute = React.memo(() => <GameItem />);
