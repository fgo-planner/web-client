import { Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { PageTitle } from '../../../../components/text/PageTitle';
import { UnderConstruction } from '../../../../components/utils/UnderConstruction';

export const UserSettingsRoute = React.memo(() => <>
    <PageTitle>User Settings</PageTitle>
    <div className='p-4'>
        <div>
            <p>
                This page contains the global settings for your entire user account.
            </p>
            <p>
                Click <Link to='../master/settings'>here</Link> to manage the settings for the currently active master account instead.
            </p>
        </div>
        <Button component={Link} to='theme'>
            Edit Theme
        </Button>
        <UnderConstruction />
    </div>
</>);
