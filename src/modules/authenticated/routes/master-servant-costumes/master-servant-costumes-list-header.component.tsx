import { Icon, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React from 'react';
import { HeaderLabel } from '../../../../components/text/header-label.component';
import { TruncateText } from '../../../../components/text/truncate-text.component';

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
        backgroundColor: palette.background.paper,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
        zIndex: 2,
        [`& .${StyleClassPrefix}-unlocked-status`]: {
            display: 'flex',
            justifyContent: 'center',
            minWidth: 42,
            px: 2,
            '& .MuiIcon-root': {
                fontSize: '1.25rem'
            }
        },
        [`& .${StyleClassPrefix}-thumbnail`]: {
            width: spacing(13)  // 52px
        },
        [`& .${StyleClassPrefix}-collection-no`]: {
            width: 64
        },
        [`& .${StyleClassPrefix}-name`]: {
            flex: '1 1',
            textAlign: 'left',
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
        <HeaderLabel className={`${StyleClassPrefix}-unlocked-status`}>
            <Icon>lock_open</Icon>
        </HeaderLabel>
        <div className={`${StyleClassPrefix}-thumbnail`} />
        <HeaderLabel className={`${StyleClassPrefix}-collection-no`}>
            ID
        </HeaderLabel>
        <HeaderLabel className={`${StyleClassPrefix}-name`}>
            <TruncateText>Costume Name</TruncateText>
        </HeaderLabel>
        <HeaderLabel className={`${StyleClassPrefix}-unlock-materials`}>
            Unlock Materials
        </HeaderLabel>
    </Box>
));
