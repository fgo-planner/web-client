import { FilteringStyledOptions } from '@emotion/styled/types/base';
import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, PropsWithChildren } from 'react';
import { ComponentStyleProps } from '../../types/internal';

type Props = PropsWithChildren<{

}> & Pick<ComponentStyleProps, 'className'> & DOMAttributes<HTMLDivElement>;

export const StyleClassPrefix = 'LayoutPanel';

const StyleOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions & FilteringStyledOptions<Props>;

const RootComponent = styled('div', StyleOptions)(({ theme }) => ({
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
