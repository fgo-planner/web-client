import { makeStyles, StyleRules, Theme, Typography } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren } from 'react';
import { CustomStyleProps } from '../../types';
import { StyleUtils } from '../../utils/style.utils';

type Props = PropsWithChildren<{}> & CustomStyleProps;

const style = (theme: Theme) => ({
    root: {
        // padding: theme.spacing(4, 6, 8, 6)
        padding: theme.spacing(4, 6, 0, 6)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'PageTitle'
};

const useStyles = makeStyles(style, styleOptions);

export const PageTitle = React.memo((props: Props) => {
    const { children, className } = props;
    const styles = useStyles(props);
    const classNames = StyleUtils.appendClassNames(styles.root, className);
    return (
        <Typography variant="h6" className={classNames}>
            {children}
        </Typography>
    );
});
