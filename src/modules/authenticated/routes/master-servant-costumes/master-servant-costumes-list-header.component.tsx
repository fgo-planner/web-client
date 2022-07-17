import { LockOpen } from '@mui/icons-material';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React from 'react';
import { TruncateText } from '../../../../components/text/truncate-text.component';
import { ThemeConstants } from '../../../../styles/theme-constants';

export const StyleClassPrefix = 'MasterServantCostumesListHeader';

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
            minWidth: 42,
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
            flex: '1 1',
            [breakpoints.down('sm')]: {
                visibility: 'hidden',
                maxWidth: spacing(8),  // 32px
            }
        },
        [`& .${StyleClassPrefix}-unlock-materials`]: {
            minWidth: spacing(75),  // 300px
            pr: 8,
            textAlign: 'right',
            [breakpoints.down('sm')]: {
                pr: 6
            }
        }
    } as SystemStyleObject<SystemTheme>;
};


export const MasterServantCostumesListHeader = React.memo(() => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            <LockOpen fontSize='small' />
        </div>
        <div className={`${StyleClassPrefix}-thumbnail`} />
        <div className={`${StyleClassPrefix}-collection-no`}>
            ID
        </div>
        <TruncateText className={`${StyleClassPrefix}-name`}>
            Costume Name
        </TruncateText>
        <div className={`${StyleClassPrefix}-unlock-materials`}>
            Unlock Materials
        </div>
    </Box>
));
