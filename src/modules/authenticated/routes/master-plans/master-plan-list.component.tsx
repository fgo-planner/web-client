import { MasterPlan } from '@fgo-planner/types';
import { fade, IconButton, Link as MuiLink, makeStyles, StyleRules, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Tooltip } from '@material-ui/core';
import { DeleteForever as DeleteForeverIcon } from '@material-ui/icons';
import { WithStylesOptions } from '@material-ui/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { ReadonlyPartial, ReadonlyPartialArray } from '../../../../types/internal';

type Props = {
    masterPlans: ReadonlyPartialArray<MasterPlan>;
    onDeletePlan: (masterPlan: ReadonlyPartial<MasterPlan>) => void;
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
    classNamePrefix: 'MasterPlanList'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterPlanList = React.memo(({ masterPlans, onDeletePlan }: Props) => {
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
                    {masterPlans.map(masterPlan => (
                        <TableRow key={masterPlan._id} className={classes.dataRow}>
                            <TableCell className="truncate">
                                <MuiLink component={Link} to='./master' underline="none">
                                    {masterPlan.name || 'No Name'}
                                </MuiLink>
                            </TableCell>
                            <TableCell className="truncate">
                                {masterPlan.description || '\u2013'}
                            </TableCell>
                            <TableCell />
                            <TableCell align="center">
                                <Tooltip title="Delete account" placement="left">
                                    <IconButton
                                        className={classes.actionButton}
                                        color="secondary"
                                        onClick={() => onDeletePlan(masterPlan)}
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
