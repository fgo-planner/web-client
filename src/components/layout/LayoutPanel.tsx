import { FilteringStyledOptions } from '@emotion/styled/types/base';
import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, PropsWithChildren } from 'react';
import { ComponentStyleProps } from '../../types';

type Props = PropsWithChildren<{

}> & Pick<ComponentStyleProps, 'className'> & DOMAttributes<HTMLDivElement>;

export const StyleClassPrefix = 'LayoutPanel';

const StyledOptions = {
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions & FilteringStyledOptions<Props>;

const RootComponent = styled('div', StyledOptions)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(4),
    overflow: 'hidden'
}));

export const LayoutPanel = React.memo((props: Props) => {

    const {
        children,
        className,
        ...componentProps
    } = props;

    return (
        <RootComponent className={clsx(`${StyleClassPrefix}-root`, className)} {...componentProps}>
            {children}
        </RootComponent>
    );

});
