import React from 'react';
import { PathPattern } from 'react-router';
import { useMatch } from 'react-router-dom';
import { GameItemRouteItemInfo } from './components/GameItemRouteItemInfo';
import { GameItemRouteNotFound } from './components/GameItemRouteNotFound';

const PathMatchPattern: PathPattern = {
    path: '/resources/items/:id'
};

export const GameItemRoute = React.memo(() => {
    const match = useMatch<'id', string>(PathMatchPattern);
    const id = match?.params.id;
    const itemId = Number(id);
    if (!itemId && itemId !== 0) {
        return <GameItemRouteNotFound itemId={id} />;
    }
    return <GameItemRouteItemInfo itemId={itemId} />;
});
