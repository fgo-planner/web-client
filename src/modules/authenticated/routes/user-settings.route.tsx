import { Button } from '@mui/material';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { PageTitle } from '../../../components/text/page-title.component';

export const UserSettingsRoute = React.memo(() => (
    <Fragment>
        <PageTitle>User Settings</PageTitle>
        <div className='p-4'>
            <Button component={Link} to='theme'>
                Edit Theme
            </Button>
        </div>
    </Fragment>
));
