import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{}>;

const StyleClassPrefix = 'BottomBarActions';

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    '& .MuiButton-root': {
        width: theme.spacing(20),
        m: 2
    }
} as SystemStyleObject<Theme>);

export const BottomBarActions = React.memo(({ children }: Props) => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        {children}
    </Box>
));
