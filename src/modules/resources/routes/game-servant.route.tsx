import React from 'react';
import { useRouteMatch } from 'react-router-dom';

const GameServant = React.memo(() => {
    const match = useRouteMatch<{ id: string }>();
    const { id } = match.params;
    const servantId = Number(id);
    return (
        <div>
            {isNaN(servantId) ? `Servant ID ${id} not found...` : `ID: ${servantId}`}
        </div>
    );
});

export const GameServantRoute = React.memo(() => <GameServant />);
