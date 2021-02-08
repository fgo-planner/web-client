import { Box, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React from 'react';
import { ThemeConstants } from 'styles';
import { ViewModeColumnWidths } from './master-servant-list-column-widths';

type Props = {
    editMode?: boolean;
    viewLayout?: any; // TODO Make use of this
};

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        padding: theme.spacing(8, 0, 4, 4),
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        textAlign: 'center',
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantListHeader'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantListHeader = React.memo(({ editMode }: Props) => {
    const classes = useStyles();
    if (editMode) {
        return (
            <div className={classes.root}>
                // TODO Implement this
            </div>
        );
    }
    return (
        <div className={classes.root}>
            <Box flex={ViewModeColumnWidths.name}>
                Servant
            </Box>
            <Box flex={ViewModeColumnWidths.noblePhantasmLevel}>
                NP
            </Box>
            <Box flex={ViewModeColumnWidths.level}>
                Level
            </Box>
            <Box flex={ViewModeColumnWidths.fouHp}>
                Fou (HP)
            </Box>
            <Box flex={ViewModeColumnWidths.fouAtk}>
                Fou (Attack)
            </Box>
            <Box flex={ViewModeColumnWidths.skillLevels}>
                Skills
            </Box>
            <Box flex={ViewModeColumnWidths.bondLevel}>
                Bond
            </Box>
            <Box width={ViewModeColumnWidths.actions}>
                Actions
            </Box>
        </div>
    );
});
