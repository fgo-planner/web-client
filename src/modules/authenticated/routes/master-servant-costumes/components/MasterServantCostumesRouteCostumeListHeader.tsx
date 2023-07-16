import { Icon, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React from 'react';
import { HeaderLabel } from '../../../../../components/text/HeaderLabel';
import { TruncateText } from '../../../../../components/text/TruncateText';

export const StyleClassPrefix = 'MasterServantCostumesRouteCostumeListHeader';

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
                maxWidth: spacing(8)  // 32px
            }
        },
        [`& .${StyleClassPrefix}-no-cost-status`]: {
            display: 'flex',
            justifyContent: 'center',
            minWidth: 42,
            px: 2,
            '& .MuiIcon-root': {
                fontSize: '1.25rem'
            }
        },
        [`& .${StyleClassPrefix}-unlock-materials`]: {
            minWidth: 300,
            pr: 8,
            textAlign: 'right',
            [breakpoints.down('sm')]: {
                pr: 6
            }
        }
    } as SystemStyleObject<SystemTheme>;
};


export const MasterServantCostumesRouteCostumeListHeader = React.memo(() => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            <HeaderLabel>
                <Icon>lock_open</Icon>
            </HeaderLabel>
        </div>
        <div className={`${StyleClassPrefix}-thumbnail`} />
        <div className={`${StyleClassPrefix}-collection-no`}>
            <HeaderLabel>
                ID
            </HeaderLabel>
        </div>
        <div className={`${StyleClassPrefix}-name`}>
            <HeaderLabel>
                <TruncateText>Costume Name</TruncateText>
            </HeaderLabel>
        </div>
        <div className={`${StyleClassPrefix}-no-cost-status`}>
            <HeaderLabel>
                <Icon>money_off</Icon>
            </HeaderLabel>
        </div>
        <div className={`${StyleClassPrefix}-unlock-materials`}>
            <HeaderLabel>
                Unlock Materials
            </HeaderLabel>
        </div>
    </Box>
));
