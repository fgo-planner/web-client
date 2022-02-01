import React, { Fragment } from 'react';
import { PageTitle } from '../components/text/page-title.component';
import { UnderConstruction } from '../components/utils/under-construction.component';

export const AboutRoute = React.memo(() => (
    <Fragment>
        <PageTitle>About FGO Servant Planner</PageTitle>
        <UnderConstruction />
    </Fragment>
));
