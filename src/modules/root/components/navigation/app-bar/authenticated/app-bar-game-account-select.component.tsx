import { StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesProps, WithThemeProps } from 'internal';
import { PureComponent } from 'react';

type Props = WithThemeProps & WithStylesProps;

type State = {
    
};

const style = (theme: Theme) => ({
    root: {

    }
} as StyleRules);

export const AppBarGameAccountSelect = withStyles(style)(class extends PureComponent<Props, State> {

});
