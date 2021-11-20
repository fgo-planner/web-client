import { LockOpen } from '@mui/icons-material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React from 'react';
import { ThemeConstants } from '../../../../styles/theme-constants';

export const StyleClassPrefix = 'MasterSoundtracksListHeader';

const StyleProps = {
    display: 'flex',
    height: 52,
    alignItems: 'center',
    pr: ThemeConstants.ScrollbarWidthScale,
    fontFamily: ThemeConstants.FontFamilyGoogleSans,
    fontWeight: 500,
    fontSize: '0.875rem',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'divider',
    [`& .${StyleClassPrefix}-unlocked-status`]: {
        width: 42,
        px: 2,
        textAlign: 'center'
    },
    [`& .${StyleClassPrefix}-thumbnail`]: {
        width: 96,
        mr: 6,
    },
    [`& .${StyleClassPrefix}-title`]: {
        flex: 1
    },
    [`& .${StyleClassPrefix}-unlock-material`]: {
        textAlign: 'right'
    },
    [`& .${StyleClassPrefix}-preview`]: {
        width: 48,
        pr: 24,
        pl: 4
    }
}  as SystemStyleObject<Theme>;

export const MasterSoundtracksListHeader = React.memo(() => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            <LockOpen fontSize="small" />
        </div>
        <div className={`${StyleClassPrefix}-thumbnail`} />
        <div className={`${StyleClassPrefix}-title`}>
            Track Title
        </div>
        <div className={`${StyleClassPrefix}-unlock-material`}>
            Unlock Material
        </div>
        <div className={`${StyleClassPrefix}-preview`} />
    </Box>
)
);
