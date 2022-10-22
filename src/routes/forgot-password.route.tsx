import React from 'react';
import { PageTitle } from '../components/text/page-title.component';
import { UnderConstruction } from '../components/utils/under-construction.component';

export const ForgotPasswordRoute = React.memo(() => {
    return <>
        <PageTitle>Forgot Password</PageTitle>
        <UnderConstruction />
    </>;
});
