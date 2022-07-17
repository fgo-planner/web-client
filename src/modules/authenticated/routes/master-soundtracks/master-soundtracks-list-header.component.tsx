import { LockOpen } from '@mui/icons-material';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React from 'react';
import { TruncateText } from '../../../../components/text/truncate-text.component';
import { ThemeConstants } from '../../../../styles/theme-constants';

export const StyleClassPrefix = 'MasterSoundtracksListHeader';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette,
        spacing
    } = theme as Theme;

    return {
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        py: 4,
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        fontSize: '0.9375rem',
        backgroundColor: palette.background.paper,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        zIndex: 2,
        [`& .${StyleClassPrefix}-unlocked-status`]: {
            display: 'flex',
            justifyContent: 'center',
            width: 42,
            px: 2
        },
        [`& .${StyleClassPrefix}-thumbnail`]: {
            width: 96,
            mr: 6,
            [breakpoints.down('sm')]: {
                display: 'none'
            }
        },
        [`& .${StyleClassPrefix}-preview`]: {
            width: spacing(14)  // 56px
        },
        [`& .${StyleClassPrefix}-title`]: {
            flex: 1
        },
        [`& .${StyleClassPrefix}-unlock-material`]: {
            minWidth: spacing(30),  // 120px
            pr: 8,
            textAlign: 'right',
            [breakpoints.down('sm')]: {
                pr: 6
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterSoundtracksListHeader = React.memo(() => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            <LockOpen fontSize='small' />
        </div>
        <div className={`${StyleClassPrefix}-thumbnail`} />
        <div className={`${StyleClassPrefix}-preview`} />
        <TruncateText className={`${StyleClassPrefix}-title`}>
            Track Title
        </TruncateText>
        <div className={`${StyleClassPrefix}-unlock-material`}>
            Unlock Material
        </div>
    </Box>
)
);
