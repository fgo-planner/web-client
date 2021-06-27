import { makeStyles, StyleRules, Theme, Tooltip } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ReactNode } from 'react';
import { useMemo } from 'react';
import NumberFormat from 'react-number-format';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';
import { LayoutPanelScrollable } from '../../../../components/layout/layout-panel-scrollable.component';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { GameItemConstants } from '../../../../constants';
import { GameItemMap } from '../../../../services/data/game/game-item.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { MasterItemStats, MasterItemStatsFilterOptions } from './master-item-stats.utils';

type Props = {
    stats: MasterItemStats;
    gameItemMap: GameItemMap;
    filter: Readonly<MasterItemStatsFilterOptions>;
};

const CostColumnTooltip = 'Amount needed for servant enhancements';

const CostColumnTooltipInclUnowned = `${CostColumnTooltip}, including servants that have not yet been summoned`;

const CostColumnTooltipInclSoundtracks = `${CostColumnTooltip} and soundtracks unlocks`;

const CostColumnTooltipInclUnownedAndSoundtracks = `${CostColumnTooltipInclUnowned}, and soundtracks unlocks`;

const UsedColumnTooltip = 'Amount used for servant enhancements';

const UsedColumnTooltipInclSoundtrack = `${UsedColumnTooltip} and soundtracks unlocks`;

const InventoryColumnTooltip = 'Current amount in inventory';

const DebtColumnTooltip = 'Amount needed for remaining servant enhancements';

const DebtColumnTooltipInclUnowned = `${DebtColumnTooltip}, including servants that have not yet been summoned`;

const DebtColumnTooltipInclSoundtracks = `${DebtColumnTooltip} and soundtracks unlocks`;

const DebtColumnTooltipInclUnownedAndSoundtracks = `${DebtColumnTooltipInclUnowned}, and soundtracks unlocks`;

const DifferenceColumnTooltip = 'Additional amount that needs to be acquired in order to fullfil the \'Remaining Needed\' column';

const ItemIds = [
    ...GameItemConstants.SkillGems,
    ...GameItemConstants.BronzeEnhancementMaterials,
    ...GameItemConstants.SilverEnhancementMaterials,
    ...GameItemConstants.GoldEnhancementMaterials,
    ...GameItemConstants.AscensionStatues,
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
        justifyContent: 'flex-end',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider
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

export const MasterItemStatsTable = React.memo(({ stats, gameItemMap, filter }: Props) => {

    const { includeUnownedServants, includeSoundtracks } = filter;

    const classes = useStyles();

    const costColumnTooltip = useMemo(() => {
        if (!includeUnownedServants && !includeSoundtracks) {
            return CostColumnTooltip;
        } else if (includeUnownedServants) {
            return CostColumnTooltipInclUnowned;
        } else if (includeSoundtracks) {
            return CostColumnTooltipInclSoundtracks;
        } else {
            return CostColumnTooltipInclUnownedAndSoundtracks;
        }
    }, [includeUnownedServants, includeSoundtracks]);

    const usedColumnTooltip = useMemo(() => {
        if (!includeSoundtracks) {
            return UsedColumnTooltip;
        } else {
            return UsedColumnTooltipInclSoundtrack;
        }
    }, [includeSoundtracks]);

    const debtColumnTooltip = useMemo(() => {
        if (!includeUnownedServants && !includeSoundtracks) {
            return DebtColumnTooltip;
        } else if (includeUnownedServants) {
            return DebtColumnTooltipInclUnowned;
        } else if (includeSoundtracks) {
            return DebtColumnTooltipInclSoundtracks;
        } else {
            return DebtColumnTooltipInclUnownedAndSoundtracks;
        }
    }, [includeUnownedServants, includeSoundtracks]);

    const renderItem = (itemId: number, index: number): ReactNode => {
        const item = gameItemMap[itemId];
        const stat = stats[itemId];
        if (!item || !stat) {
            // TODO Throw exception
            return null;
        }

        const { inventory, used, cost, debt } = stat;

        return (
            <StaticListRowContainer key={itemId} borderBottom={index !== ItemIds.length -1}>
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
            className="pr-4 py-4 full-height scrollbar-track-border"
            headerContents={
                <div className={classes.header}>
                    <Tooltip title={costColumnTooltip} placement="top">
                        <div className={classes.dataCell}>Total Needed</div>
                    </Tooltip>
                    <Tooltip title={usedColumnTooltip} placement="top">
                        <div className={classes.dataCell}>Total Consumed</div>
                    </Tooltip>
                    <Tooltip title={InventoryColumnTooltip} placement="top">
                        <div className={classes.dataCell}>Current Inventory</div>
                    </Tooltip>
                    <Tooltip title={debtColumnTooltip} placement="top" >
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
