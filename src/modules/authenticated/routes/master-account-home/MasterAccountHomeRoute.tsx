import React from 'react';
import { PageTitle } from '../../../../components/text/PageTitle';
import { UnderConstruction } from '../../../../components/utils/UnderConstruction';

export const MasterAccountHomeRoute = React.memo(() => {
    return <>
        <PageTitle>Master Account Dashboard</PageTitle>
        <UnderConstruction />
    </>;
});
