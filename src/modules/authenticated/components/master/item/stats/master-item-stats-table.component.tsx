import { fade, makeStyles, StyleRules, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, Tooltip } from '@material-ui/core';
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

const CostColumnTooltip = 'Amount needed for servant enhancements';

const CostColumnTooltipInclUnowned = `${CostColumnTooltip}, including servants that have not yet been summoned`;

const UsedColumnTooltip = 'Amount used for servant enhancements';

const InventoryColumnTooltip = 'Current amount in inventory';

const DebtColumnTooltip = 'Amount needed for remaining servant enhancements';

const DebtColumnTooltipInclUnowned = `${DebtColumnTooltip}, including servants that have not yet been summoned`;

const DifferenceColumnTooltip = 'Additional amount that needs to be acquired in order to fullfil the \'Remaining Needed\' column';

const ColumnWidth = '15%';

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
        },
        '&:hover': {
            background: fade(theme.palette.text.primary, 0.07)
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
        const {
            ownedServantsCost,
            allServantsCost,
            inventory,
            used,
            ownedServantsDebt,
            allServantsDebt
        } = stat;
        const cost = includeUnownedServants ? allServantsCost : ownedServantsCost;
        const debt = includeUnownedServants ? allServantsDebt : ownedServantsDebt;
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
                        value={cost}
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
                        value={inventory}
                    />
                </TableCell>
                <TableCell align="center">
                    <NumberFormat
                        thousandSeparator
                        displayType="text"
                        value={debt}
                    />
                </TableCell>
                <TableCell align="center">
                    <NumberFormat
                        thousandSeparator
                        displayType="text"
                        value={Math.max(0, debt - inventory)}
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
                            <Tooltip title={includeUnownedServants ? CostColumnTooltipInclUnowned : CostColumnTooltip} placement="top">
                                <div>Total Needed</div>
                            </Tooltip>
                        </TableCell>
                        <TableCell align="center" width={ColumnWidth}>
                            <Tooltip title={UsedColumnTooltip} placement="top">
                                <div>Total Consumed</div>
                            </Tooltip>
                        </TableCell>
                        <TableCell align="center" width={ColumnWidth}>
                            <Tooltip title={InventoryColumnTooltip} placement="top">
                                <div>Current Inventory</div>
                            </Tooltip>
                        </TableCell>
                        <TableCell align="center" width={ColumnWidth}>
                            <Tooltip title={includeUnownedServants ? DebtColumnTooltipInclUnowned : DebtColumnTooltip} placement="top" >
                                <div>Remaining Needed</div>
                            </Tooltip>
                        </TableCell>
                        <TableCell align="center" width={ColumnWidth}>
                            <Tooltip title={DifferenceColumnTooltip} placement="top">
                                <div>Deficit</div>
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
