import { Icon, Typography } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React from 'react';

const StyleProps = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    py: 8,
    textAlign: 'center',
    '& .MuiIcon-root': {
        fontSize: '2.5rem'
    },
    '& > *': {
        px: 2
    }
} as SystemStyleObject<Theme>;

export const UnderConstruction = React.memo(() => (
    <Box sx={StyleProps}>
        <Icon>construction</Icon>
        <Typography variant='h4'>
            This page is under construction
        </Typography>
        <Icon>construction</Icon>
    </Box>
));
