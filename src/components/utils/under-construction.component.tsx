import { Construction as ConstructionIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React from 'react';

const StyleProps = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    py: 8,
    textAlign: 'center',
    '& > *': {
        px: 2
    }
} as SystemStyleObject<Theme>;

export const UnderConstruction = React.memo(() => (
    <Box sx={StyleProps}>
        <ConstructionIcon fontSize='large' />
        <Typography variant="h4">This page is under construction</Typography>
        <ConstructionIcon fontSize='large' />
    </Box>
));
