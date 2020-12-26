import { Theme, withStyles } from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { WithStylesProps, WithThemeProps } from 'internal';
import { PureComponent } from 'react';
import { ThemeConstants } from 'styles';
import { ThemeUtils } from 'utils';

type Props = WithThemeProps & WithStylesProps;

type State = {
    
};

const style = (theme: Theme) => ({
    root: {

    }
} as StyleRules);

export const AppBarGameAccountSelect = withStyles(style)(class extends PureComponent<Props, State> {

});
