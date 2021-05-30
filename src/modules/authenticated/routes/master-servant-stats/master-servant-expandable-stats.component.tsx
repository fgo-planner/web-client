import { Accordion, AccordionDetails, AccordionSummary, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren } from 'react';
import { StyleUtils } from '../../../../utils/style.utils';

type Props = PropsWithChildren<{
    expanded: boolean
}>;

const style = (theme: Theme) => ({
    accordion: {
        margin: '0 !important',
        boxShadow: StyleUtils.insetBoxShadow(theme.shadows[1]),
        backgroundColor: theme.palette.background.default,
        '&:before': {
            display: 'none',
        },
    },
    accordionSummary: {
        display: 'none'
    },
    accordionDetails: {
        zIndex: -1,
        padding: theme.spacing(0),
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantStatsExpandablePanel'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantStatsExpandablePanel = React.memo(({ children, expanded }: Props) => {
    const classes = useStyles();
    return (
        <Accordion className={classes.accordion} expanded={expanded}>
            <AccordionSummary className={classes.accordionSummary} />
            <AccordionDetails className={classes.accordionDetails}>
                {children}
            </AccordionDetails>
        </Accordion>
    );
});
