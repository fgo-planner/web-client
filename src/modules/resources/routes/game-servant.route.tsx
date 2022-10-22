import React from 'react';
import { PathPattern } from 'react-router';
import { useMatch } from 'react-router-dom';
import { UnderConstruction } from '../../../components/utils/under-construction.component';

const PathMatchPattern: PathPattern = {
    path: '/resources/servants/:id'
};

const GameServant = React.memo(() => {
    const match = useMatch<'id', string>(PathMatchPattern);
    const id = match?.params.id;
    const servantId = Number(id);
    return (
        <div>
            {isNaN(servantId) ? `Servant ID ${id} not found...` : `ID: ${servantId}`}
            <UnderConstruction />
        </div>
    );
});

export const GameServantRoute = React.memo(() => <GameServant />);
