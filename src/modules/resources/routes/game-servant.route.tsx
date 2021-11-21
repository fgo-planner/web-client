import React from 'react';
import { useMatch } from 'react-router-dom';

const GameServant = React.memo(() => {
    const match = useMatch<'id'>('/resources/servants/:id');
    const id = match?.params.id;
    const servantId = Number(id);
    return (
        <div>
            {isNaN(servantId) ? `Servant ID ${id} not found...` : `ID: ${servantId}`}
        </div>
    );
});

export const GameServantRoute = React.memo(() => <GameServant />);
