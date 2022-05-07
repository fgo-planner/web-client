import { Typography } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { PropsWithChildren } from 'react';
import { ComponentStyleProps } from '../../types/internal';

type Props = PropsWithChildren<{}> & Pick<ComponentStyleProps, 'className'>;

const StyleProps = {
    fontSize: '1.125rem',
    fontWeight: 'normal',
    px: 6,
    py: 4
} as SystemStyleObject<Theme>;

export const SectionTitle = React.memo(({ children, className }: Props) => (
    <Typography variant='h6' className={className} sx={StyleProps}>
        {children}
    </Typography>
));
