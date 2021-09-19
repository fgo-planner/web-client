import { Plan } from '@fgo-planner/types';
import { fade, IconButton, Link as MuiLink, makeStyles, StyleRules, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Tooltip } from '@material-ui/core';
import { DeleteForever as DeleteForeverIcon } from '@material-ui/icons';
import { WithStylesOptions } from '@material-ui/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { ReadonlyPartial, ReadonlyPartialArray } from '../../../../types/internal';

type Props = {
    plans: ReadonlyPartialArray<Plan>;
    onDeletePlan: (plan: ReadonlyPartial<Plan>) => void;
};

const style = (theme: Theme) => ({
    table: {
        tableLayout: 'fixed',
        // minWidth: 960
    },
    dataRow: {
        '&:hover': {
            background: fade(theme.palette.text.primary, 0.07)
        }
    },
    actionButton: {
        margin: theme.spacing(-3)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'PlanList'
};

const useStyles = makeStyles(style, styleOptions);

export const PlanList = React.memo(({ plans, onDeletePlan }: Props) => {
    const classes = useStyles();

    return (
        <TableContainer>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell />
                        <TableCell width={69} align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {plans.map(plan => (
                        <TableRow key={plan._id} className={classes.dataRow}>
                            <TableCell className="truncate">
                                <MuiLink component={Link} to='../master' underline="none">
                                    {plan.name || 'No Name'}
                                </MuiLink>
                            </TableCell>
                            <TableCell className="truncate">
                                {plan.description || '\u2013'}
                            </TableCell>
                            <TableCell />
                            <TableCell align="center">
                                <Tooltip title="Delete account" placement="left">
                                    <IconButton
                                        className={classes.actionButton}
                                        color="secondary"
                                        onClick={() => onDeletePlan(plan)}
                                        children={<DeleteForeverIcon />}
                                    />
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
});
