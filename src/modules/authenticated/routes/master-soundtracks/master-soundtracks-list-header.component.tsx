import { Icon, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React from 'react';
import { HeaderLabel } from '../../../../components/text/header-label.component';
import { TruncateText } from '../../../../components/text/truncate-text.component';

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
        backgroundColor: palette.background.paper,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        zIndex: 2,
        [`& .${StyleClassPrefix}-unlocked-status`]: {
            display: 'flex',
            justifyContent: 'center',
            width: 42,
            px: 2,
            '& .MuiIcon-root': {
                fontSize: '1.25rem'
            }
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
            flex: 1,
            textAlign: 'left'
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
        <HeaderLabel className={`${StyleClassPrefix}-unlocked-status`}>
            <Icon>lock_open</Icon>
        </HeaderLabel>
        <div className={`${StyleClassPrefix}-thumbnail`} />
        <HeaderLabel className={`${StyleClassPrefix}-preview`} />
        <HeaderLabel className={`${StyleClassPrefix}-title`}>
            <TruncateText>Track Title</TruncateText>
        </HeaderLabel>
        <HeaderLabel className={`${StyleClassPrefix}-unlock-material`}>
            Unlock Material
        </HeaderLabel>
    </Box>
)
);
