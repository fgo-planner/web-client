import { makeStyles, StyleRules, Theme, Tooltip } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ReactNode } from 'react';
import NumberFormat from 'react-number-format';
import { GameItemThumbnail } from '../../../../../../components/game/item/game-item-thumbnail.component';
import { LayoutPanelScrollable } from '../../../../../../components/layout/layout-panel-scrollable.component';
import { StaticListRowContainer } from '../../../../../../components/list/static-list-row-container.component';
import { GameItemConstants } from '../../../../../../constants';
import { GameItemMap } from '../../../../../../services/data/game/game-item.service';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
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
    header: {
        display: 'flex',
        padding: theme.spacing(4, 2, 4, 4),
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        fontSize: '0.875rem',
        justifyContent: 'flex-end'
    },
    dataRow: {
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        height: 52,
        padding: theme.spacing(0, 0, 0, 4),
        fontSize: '0.875rem'
    },
    labelCell: {
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        width: '25%'
    },
    dataCell: {
        textAlign: 'center',
        width: '15%'
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

    const renderItem = (itemId: number, index: number): ReactNode => {
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
            <StaticListRowContainer key={itemId} borderBottom={index !== ItemIds.length -1} borderRight>
                <div className={classes.dataRow}>
                    <div className={classes.labelCell}>
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
                    <div className={classes.dataCell}>
                        <NumberFormat
                            thousandSeparator
                            displayType="text"
                            value={cost}
                        />
                    </div>
                    <div className={classes.dataCell}>
                        <NumberFormat
                            thousandSeparator
                            displayType="text"
                            value={used}
                        />
                    </div>
                    <div className={classes.dataCell}>
                        <NumberFormat
                            thousandSeparator
                            displayType="text"
                            value={inventory}
                        />
                    </div>
                    <div className={classes.dataCell}>
                        <NumberFormat
                            thousandSeparator
                            displayType="text"
                            value={debt}
                        />
                    </div>
                    <div className={classes.dataCell}>
                        <NumberFormat
                            thousandSeparator
                            displayType="text"
                            value={Math.max(0, debt - inventory)}
                        />
                    </div>
                </div>
            </StaticListRowContainer>
        );
    };

    return (
        <LayoutPanelScrollable
            className="p-4 full-height"
            headerContents={
                <div className={classes.header}>
                    <Tooltip title={includeUnownedServants ? CostColumnTooltipInclUnowned : CostColumnTooltip} placement="top">
                        <div className={classes.dataCell}>Total Needed</div>
                    </Tooltip>
                    <Tooltip title={UsedColumnTooltip} placement="top">
                        <div className={classes.dataCell}>Total Consumed</div>
                    </Tooltip>
                    <Tooltip title={InventoryColumnTooltip} placement="top">
                        <div className={classes.dataCell}>Current Inventory</div>
                    </Tooltip>
                    <Tooltip title={includeUnownedServants ? DebtColumnTooltipInclUnowned : DebtColumnTooltip} placement="top" >
                        <div className={classes.dataCell}>Remaining Needed</div>
                    </Tooltip>
                    <Tooltip title={DifferenceColumnTooltip} placement="top">
                        <div className={classes.dataCell}>Deficit</div>
                    </Tooltip>
                </div>
            }
            children={ItemIds.map(renderItem)}
        />
    );
});
