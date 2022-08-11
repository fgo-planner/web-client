import { Theme } from '@mui/system';

export type StyledFunctionThemeProp = {
    theme: Theme;
};

export type StyledFunctionProps = {
    classPrefix?: string;
    forRoot?: boolean
};

export type StyledFunctionPropsWithTheme = StyledFunctionProps & StyledFunctionThemeProp;
