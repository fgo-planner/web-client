import { Close as CloseIcon, SvgIconComponent } from '@mui/icons-material';
import { IconButton, Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import React, { MouseEventHandler } from 'react';

type Props = {
    icon?: SvgIconComponent,
    onClick?: MouseEventHandler;
};

const DefaultIcon = CloseIcon;

const StyleClassPrefix = 'DialogCloseButton';

const StyleProps = (theme: Theme) => ({
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2)
} as SystemStyleObject<Theme>);

export const DialogCloseButton = React.memo(({ icon, onClick }: Props) => {

    const Icon = icon || DefaultIcon;

    return (
        <IconButton
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            onClick={onClick}
            size="large"
        >
            <Icon />
        </IconButton>
    );

});
