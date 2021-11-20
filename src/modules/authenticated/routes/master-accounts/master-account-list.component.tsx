import { MasterAccount } from '@fgo-planner/types';
import { DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import { alpha, IconButton, Link as MuiLink, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React from 'react';
import NumberFormat from 'react-number-format';
import { Link } from 'react-router-dom';
import { MasterAccountList as MasterAccountListType } from '../../../../services/data/master/master-account.service';
import { ReadonlyPartial } from '../../../../types/internal';

type Props = {
    masterAccountList: MasterAccountListType;
    onDeleteAccount: (masterAccount: ReadonlyPartial<MasterAccount>) => void;
};

export const StyleClassPrefix = 'MasterAccountList';

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
        margin: theme.spacing(-3)
    }
} as SystemStyleObject<Theme>);

export const MasterAccountList = React.memo(({ masterAccountList, onDeleteAccount }: Props) => (
    <TableContainer sx={StyleProps}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Account Name</TableCell>
                    <TableCell align="center">Friend ID</TableCell>
                    <TableCell />
                    <TableCell width={69} align="center">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {masterAccountList.map((masterAccount, i) => (
                    <TableRow key={masterAccount._id} className={`${StyleClassPrefix}-data-row`}>
                        <TableCell>
                            <MuiLink component={Link} to='./master' underline="none">
                                {masterAccount.name || `Account ${i + 1}`}
                            </MuiLink>
                        </TableCell>
                        <TableCell align="center">
                            {!masterAccount.friendId ? '\u2013' :
                                <NumberFormat
                                    thousandSeparator
                                    displayType="text"
                                    value={masterAccount.friendId}
                                />
                            }
                        </TableCell>
                        <TableCell />
                        <TableCell align="center">
                            <Tooltip title="Delete account" placement="left">
                                <IconButton
                                    className={`${StyleClassPrefix}-action-button`}
                                    color="secondary"
                                    onClick={() => onDeleteAccount(masterAccount)}
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
