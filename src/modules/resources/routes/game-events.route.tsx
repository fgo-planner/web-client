import React, { Fragment } from 'react';

const GameEvents = React.memo(() => (
    <Fragment>
        <div>EVENTS</div>
    </Fragment>
));

export const GameEventsRoute = React.memo(() => <GameEvents />);
