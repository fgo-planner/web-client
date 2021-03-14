import { makeStyles, StyleRules, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Tooltip } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ReactNode } from 'react';
import NumberFormat from 'react-number-format';
import { GameItemThumbnail } from '../../../../../../components/game/item/game-item-thumbnail.component';
import { GameItemConstants } from '../../../../../../constants';
import { GameItemMap } from '../../../../../../services/data/game/game-item.service';
import { ItemStats } from '../../../../../../utils/master/master-item-stats.utils';

type Props = {
    stats: ItemStats;
    gameItemMap: GameItemMap;
    includeUnownedServants?: boolean;
};

const ColumnWidth = '17%';

const ItemIds = [
    ...GameItemConstants.SkillGems,
    ...GameItemConstants.AscensionStatues,
    ...GameItemConstants.BronzeEnhancementMaterials,
    ...GameItemConstants.SilverEnhancementMaterials,
    ...GameItemConstants.GoldEnhancementMaterials,
    ...GameItemConstants.OtherEnhancementMaterials,
    5
];

const style = (theme: Theme) => ({
    tableContainer: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    table: {
        tableLayout: 'fixed',
        minWidth: 960
    },
    cell: {
        borderBottom: 'none',
    },
    dataRow: {
        borderTop: `1px solid ${theme.palette.divider}`,
        '& .MuiTableCell-root': {
            borderBottom: 'none'
        }
    },
    thumbnailContainer: {
        margin: theme.spacing(-3, 0)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantStats'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterItemStatsTable = React.memo(({ stats, gameItemMap, includeUnownedServants }: Props) => {
    const classes = useStyles();

    const renderItem = (itemId: number): ReactNode => {
        const item = gameItemMap[itemId];
        const stat = stats[itemId];
        if (!item || !stat) {
            // TODO Throw exception
            return null;
        }
        const { inventory, used, ownedServantsDebt, allServantsDebt } = stat;
        const target = includeUnownedServants ? allServantsDebt : ownedServantsDebt;
        return (
            <TableRow key={itemId} className={classes.dataRow}>
                <TableCell>
                    <div className="flex align-center">
                        <div className={classes.thumbnailContainer}>
                            <GameItemThumbnail
                                item={item}
                                size={42}
                                showBackground
                                enableLink
                            />
                        </div>
                        <div className="pl-4">
                            {/* TODO Make this a link */}
                            {item.name}
                        </div>
                    </div>
                </TableCell>
                <TableCell align="center">
                    <NumberFormat
                        thousandSeparator
                        displayType="text"
                        value={inventory}
                    />
                </TableCell>
                <TableCell align="center">
                    <NumberFormat
                        thousandSeparator
                        displayType="text"
                        value={used}
                    />
                </TableCell>
                <TableCell align="center">
                    <NumberFormat
                        thousandSeparator
                        displayType="text"
                        value={target}
                    />
                </TableCell>
                <TableCell align="center">
                    <NumberFormat
                        thousandSeparator
                        displayType="text"
                        value={Math.max(0, target - inventory)}
                    />
                </TableCell>
            </TableRow>
        );
    };

    return (
        <TableContainer className={classes.tableContainer}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell align="center" width={ColumnWidth}>
                            <Tooltip title="Current amount in inventory" placement="top">
                                <div>Inventory</div>
                            </Tooltip>
                        </TableCell>
                        <TableCell align="center" width={ColumnWidth}>
                            <Tooltip title="Amount used for servant upgrades" placement="top">
                                <div>Used</div>
                            </Tooltip>
                        </TableCell>
                        <TableCell align="center" width={ColumnWidth}>
                            <Tooltip title="Amount needed to max out remaining servants" placement="top">
                                <div>Max Upgrades</div>
                            </Tooltip>
                        </TableCell>
                        <TableCell align="center" width={ColumnWidth}>
                            <Tooltip title="Additional amount needed to fullfil the 'Max Upgrades' column" placement="top">
                                <div>Short</div>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {ItemIds.map(renderItem)}
                </TableBody>
            </Table>
        </TableContainer>
    );
});
