
import { Icon, Theme } from '@mui/material';
import { CSSInterpolation, MuiStyledOptions, styled } from '@mui/system';
import { DOMAttributes } from 'react';
import { ComponentStyleProps, StyledFunctionPropsWithTheme } from '../../types';

type Props = {
    disabled?: boolean;
} & Pick<ComponentStyleProps, 'className'> & Omit<DOMAttributes<HTMLDivElement>, 'draggable'>;

const StyleClassPrefix = 'DataTableDragHandle';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'disabled'
);

const StyledOptions = {
    name: StyleClassPrefix,
    shouldForwardProp,
    skipSx: true,
    skipVariantsResolver: true,
    slot: 'root'
} as MuiStyledOptions;

const StyleProps = (props: Props & StyledFunctionPropsWithTheme) => {

    const { spacing } = props.theme as Theme;

    return {
        cursor: 'grab',
        margin: spacing(0, 2),
        opacity: 0.5,
        zIndex: 1
    } as CSSInterpolation;
};

const DisabledStyleProps = (props: Props & StyledFunctionPropsWithTheme) => {
    if (!props.disabled) {
        return;
    }

    const { palette } = props.theme as Theme;

    return {
        cursor: 'initial',
        color: palette.text.disabled
    } as CSSInterpolation;
};

export const RootComponent = styled('div', StyledOptions)<Props>(
    StyleProps,
    DisabledStyleProps
);

export const DataTableDragHandle: React.FC<Props> = (props: Props) => {

    const {
        disabled,
        className,
        ...domAttributes
    } = props;

    return (
        <RootComponent
            className={className}
            draggable={!disabled}
            {...domAttributes}
        >
            <Icon>drag_indicator</Icon>
        </RootComponent>
    );
};
