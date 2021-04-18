import { fade, IconButton, makeStyles, Link as MuiLink, StyleRules, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Tooltip } from '@material-ui/core';
import { DeleteForever as DeleteForeverIcon } from '@material-ui/icons';
import { WithStylesOptions } from '@material-ui/styles';
import React from 'react';
import NumberFormat from 'react-number-format';
import { Link } from 'react-router-dom';
import { MasterAccountList as MasterAccountListType } from '../../../../../../services/data/master/master-account.service';
import { MasterAccount, ReadonlyPartial } from '../../../../../../types';

type Props = {
    masterAccountList: MasterAccountListType;
    onDeleteAccount: (masterAccount: ReadonlyPartial<MasterAccount>) => void;
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
    classNamePrefix: 'MasterAccountList'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterAccountList = React.memo(({ masterAccountList, onDeleteAccount }: Props) => {
    const classes = useStyles();

    return (
        <TableContainer>
            <Table className={classes.table}>
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
                        <TableRow key={masterAccount._id} className={classes.dataRow}>
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
                                        className={classes.actionButton}
                                        color="secondary"
                                        onClick={() => onDeleteAccount(masterAccount)}
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
