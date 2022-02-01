import React, { Fragment } from 'react';
import { PageTitle } from '../../../components/text/page-title.component';
import { UnderConstruction } from '../../../components/utils/under-construction.component';

export const MasterAccountHomeRoute = React.memo(() => {
    return (
        <Fragment>
            <PageTitle>Master Account Dashboard</PageTitle>
            <UnderConstruction />
        </Fragment>
    );
});
