import { LockOpen } from '@mui/icons-material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React from 'react';
import { ThemeConstants } from '../../../../styles/theme-constants';

export const StyleClassPrefix = 'MasterServantCostumesListHeader';

const StyleProps = {
    display: 'flex',
    alignItems: 'center',
    pr: ThemeConstants.ScrollbarWidthScale,
    py: 4,
    fontFamily: ThemeConstants.FontFamilyGoogleSans,
    fontWeight: 500,
    fontSize: '0.875rem',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'divider',
    [`& .${StyleClassPrefix}-unlocked-status`]: {
        display: 'flex',
        justifyContent: 'center',
        width: 42,
        px: 2
    },
    [`& .${StyleClassPrefix}-thumbnail`]: {
        width: 48
    },
    [`& .${StyleClassPrefix}-collection-no`]: {
        width: 64,
        textAlign: 'center'
    },
    [`& .${StyleClassPrefix}-name`]: {
        flex: 1
    },
    [`& .${StyleClassPrefix}-unlock-materials`]: {
        width: 256,
        pr: 24,
        textAlign: 'center'
    }
} as SystemStyleObject<Theme>;

export const MasterServantCostumesListHeader = React.memo(() => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            <LockOpen fontSize='small' />
        </div>
        <div className={`${StyleClassPrefix}-thumbnail`} />
        <div className={`${StyleClassPrefix}-collection-no`}>
            No.
        </div>
        <div className={`${StyleClassPrefix}-name`}>
            Costume Name
        </div>
        <div className={`${StyleClassPrefix}-unlock-materials`}>
            Unlock Materials
        </div>
    </Box>
));
