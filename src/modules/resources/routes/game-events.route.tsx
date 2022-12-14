import React, { Fragment } from 'react';
import { PageTitle } from '../../../components/text/page-title.component';
import { UnderConstruction } from '../../../components/utils/under-construction.component';

export const GameEventsRoute = React.memo(() => (
    <Fragment>
        <PageTitle>Events</PageTitle>
        <UnderConstruction />
    </Fragment>
));
