import React, { Fragment } from 'react';
import { PageTitle } from '../../components/text/PageTitle';
import { UnderConstruction } from '../../components/utils/UnderConstruction';

export const AboutRoute = React.memo(() => (
    <Fragment>
        <PageTitle>About FGO Servant Planner</PageTitle>
        <UnderConstruction />
    </Fragment>
));
