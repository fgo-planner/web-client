import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { ThemeConstants } from '../../../styles/theme-constants';

type Props = PropsWithChildren<{
    show?: boolean;
}>;

const TransitionDuration = 100;

const StyleClassPrefix = 'BottomBar';

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    height: 0,
    transition: `height ${TransitionDuration}ms ease-in-out`,
    [`& .${StyleClassPrefix}-content`]: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        height: theme.spacing(ThemeConstants.BottomBarHeightScale),
        background: theme.palette.background.paper
    },
    '&.show': {
        height: theme.spacing(ThemeConstants.BottomBarHeightScale),
    }
} as SystemStyleObject<Theme>);

export const BottomBar = React.memo((props: Props) => {

    const {
        show, 
        children
    } = props;

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, show && 'show')} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-content`}> 
                {children}
            </div>
        </Box>
    );

});
