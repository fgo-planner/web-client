import { Icon, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React from 'react';
import { HeaderLabel } from '../../../../../components/text/HeaderLabel';
import { TruncateText } from '../../../../../components/text/TruncateText';

export const StyleClassPrefix = 'MasterSoundtracksRouteSoundtrackListHeader';

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

export const MasterSoundtracksRouteSoundtrackListHeader = React.memo(() => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            <HeaderLabel>
                <Icon>lock_open</Icon>
            </HeaderLabel>
        </div>
        <div className={`${StyleClassPrefix}-thumbnail`} />
        <div className={`${StyleClassPrefix}-preview`} />
        <div className={`${StyleClassPrefix}-title`}>
            <HeaderLabel>
                <TruncateText>Track Title</TruncateText>
            </HeaderLabel>
        </div>
        <div className={`${StyleClassPrefix}-unlock-material`}>
            <HeaderLabel>
                Unlock Material
            </HeaderLabel>
        </div>
    </Box>
));
