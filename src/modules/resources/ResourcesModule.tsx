import React from 'react';
import { Navigate, useRoutes } from 'react-router';
import { GameEventsRoute } from './routes/game-events/GameEventsRoute';
import { GameItemRoute } from './routes/game-item/GameItemRoute';
import { GameItemsRoute } from './routes/game-items/GameItemsRoute';
import { GameServantRoute } from './routes/game-servant/GameServantRoute';
import { GameServantsRoute } from './routes/game-servants/GameServantsRoute';

console.log('ResourcesModule loaded');

const ModuleRoutes = [
    {
        path: '/',
        element: <Navigate to='./servants' />
    },
    {
        path: '/servants',
        element: <GameServantsRoute />
    },
    {
        path: '/servants/:id',
        element: <GameServantRoute />
    },
    {
        path: '/items',
        element: <GameItemsRoute />
    },
    {
        path: '/items/:id',
        element: <GameItemRoute />
    },
    {
        path: '/events',
        element: <GameEventsRoute />
    }
];

const ResourcesModule = React.memo(() => {
    return useRoutes(ModuleRoutes);
});

export default ResourcesModule;
