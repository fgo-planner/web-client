import { Icon, IconButton, Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import React, { MouseEventHandler } from 'react';

type Props = {
    onClick?: MouseEventHandler;
};

const StyleClassPrefix = 'DialogCloseButton';

const StyleProps = (theme: Theme) => ({
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(1.25)
} as SystemStyleObject<Theme>);

export const DialogCloseButton = React.memo(({ onClick }: Props) => (
    <IconButton
        className={`${StyleClassPrefix}-root`}
        sx={StyleProps}
        onClick={onClick}
        size='large'
    >
        <Icon>close</Icon>
    </IconButton>
));
