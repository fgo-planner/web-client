import { Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

export const UserSettingsRoute = React.memo(() => {
    return (
        <div className="p-4">
            <Button component={Link} to="settings/theme">
                Edit Theme
            </Button>
        </div>
    );
});

