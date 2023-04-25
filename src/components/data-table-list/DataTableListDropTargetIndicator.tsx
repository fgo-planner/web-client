
import { Theme } from '@mui/material';
import { CSSInterpolation, MuiStyledOptions, styled } from '@mui/system';
import { StyledFunctionPropsWithTheme } from '../../types';

// This component does not need StyleClassPrefix.

const StyledOptions = {
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions;

const Thickness = 3;

const StyleProps = (props: StyledFunctionPropsWithTheme) => {

    const { palette } = props.theme as Theme;

    return {
        height: 0,
        width: '100%',
        position: 'relative',
        top: -Thickness / 2,
        zIndex: 2,
        '>div': {
            pointerEvents: 'none',
            height: Thickness,
            width: '100%',
            backgroundColor: palette.secondary.main
        }
    } as CSSInterpolation;
};

export const RootComponent = styled('div', StyledOptions)(StyleProps);

export const DataTableListDropTargetIndicator: React.FC = () => (
    <RootComponent>
        <div />
    </RootComponent>
);
