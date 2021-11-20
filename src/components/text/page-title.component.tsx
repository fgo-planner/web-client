import { Typography } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { PropsWithChildren } from 'react';
import { ComponentStyleProps } from '../../types/internal';

type Props = PropsWithChildren<{}> & Pick<ComponentStyleProps, 'className'>;

const styles = {
    px: 6,
    pt: 4
} as SystemStyleObject<Theme>;

export const PageTitle = React.memo(({ children, className }: Props) => (
    <Typography variant="h6" className={className} sx={styles}>
        {children}
    </Typography>
));
