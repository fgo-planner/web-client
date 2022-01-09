import { Plan, PlanGroup } from '@fgo-planner/types';
import { DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import { alpha, IconButton, Link as MuiLink, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React from 'react';
import { Link } from 'react-router-dom';
import { AccountPlans } from '../../../../services/data/plan/plan.service';
import { ReadonlyPartial } from '../../../../types/internal';

type Props = {
    accountPlans: AccountPlans;
    onDeletePlan?: (plan: ReadonlyPartial<Plan>) => void;
    onDeletePlanGroup?: (planGroup: ReadonlyPartial<PlanGroup>) => void;
};

const StyleClassPrefix = 'PlanList';

const StyleProps = (theme: Theme) => ({
    '& .MuiTable-root': {
        tableLayout: 'fixed',
        // minWidth: 960
    },
    [`& .${StyleClassPrefix}-data-row`]: {
        '&:hover': {
            background: alpha(theme.palette.text.primary, 0.07)
        }
    },
    [`& .${StyleClassPrefix}-action-button`]: {
        m: -3
    }
} as SystemStyleObject<Theme>);

export const PlanList = React.memo(({ accountPlans, onDeletePlan, onDeletePlanGroup }: Props) => (
    <TableContainer sx={StyleProps}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell />
                    <TableCell width={69} align="center">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {accountPlans.plans.map(plan => (
                    <TableRow key={plan._id} className={`${StyleClassPrefix}-data-row`}>
                        <TableCell className="truncate">
                            <MuiLink component={Link} to={`../master/planner/${plan._id}`} underline="none">
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
                                    className={`${StyleClassPrefix}-action-button`}
                                    color="secondary"
                                    onClick={() => onDeletePlan?.(plan)}
                                    children={<DeleteForeverIcon />}
                                    size="large" />
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
));
