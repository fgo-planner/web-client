import { fade, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/styles';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { GameServantClassIcon } from '../../../../components/game/servant/game-servant-class-icon.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { MasterAccount, Nullable } from '../../../../types';
import { StyleUtils } from '../../../../utils/style.utils';
import { MasterServantStatsFilter, MasterServantStatsFilterResult } from './master-servant-stats-filter.component';
import { MasterServantStatsTable } from './master-servant-stats-table.component';
import { MasterServantStatsGroupedByClass, MasterServantStatsGroupedByRarity, MasterServantStatsUtils } from './master-servant-stats.utils';

const renderRarityHeaderLabel = (value: string | number): ReactNode => {
    if (value === 'overall') {
        return 'Overall';
    }
    return `${value} \u2605`;
};

const renderClassHeaderLabel = (value: string | number): ReactNode => {
    if (value === 'overall') {
        return 'Overall';
    }
    return (
        <div className="flex justify-center">
            <GameServantClassIcon
                servantClass={value as any}
                rarity={3}
                size={24}
                tooltip
                tooltipPlacement="top"
            />
        </div>
    );
};

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
    expandable: {
        cursor: 'pointer',
    },
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
    },
    accordionTableBody: {
        '& >:first-child': {
            borderTop: 'none'
        }
    },
    accordionFirstCell: {
        paddingLeft: theme.spacing(10)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantStats'
};

const useStyles = makeStyles(style, styleOptions);

/**
 * TODO Merge this into the `master-servant-stats.route.tsx` file.
 */
export const MasterServantStatsRoute = React.memo(() => {
    const classes = useStyles();
    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [filter, setFilter] = useState<MasterServantStatsFilterResult>();
    const [stats, setStats] = useState<MasterServantStatsGroupedByRarity | MasterServantStatsGroupedByClass>();

    const gameServantMap = useGameServantMap();

    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(setMasterAccount);

        const onCurrentMasterAccountUpdatedSubscription = MasterAccountService.onCurrentMasterAccountUpdated
            .subscribe(account => {
                if (account == null) {
                    return;
                }
                setMasterAccount(account);
            });

        return () => {
            onCurrentMasterAccountChangeSubscription.unsubscribe();
            onCurrentMasterAccountUpdatedSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!gameServantMap || !masterAccount || !filter) {
            return;
        }
        let stats;
        if (filter.groupBy === 'rarity') {
            stats = MasterServantStatsUtils.generateStatsGroupedByRarity(gameServantMap, masterAccount, filter);
        } else {
            stats = MasterServantStatsUtils.generateStatsGroupedByClass(gameServantMap, masterAccount, filter);
        }
        setStats(stats);
    }, [gameServantMap, masterAccount, filter]);

    /*
     * Render the stats table.
     */
    const statsTableNode: ReactNode = useMemo(() => {
        if (!filter || !stats) {
            return null;
        }
        let dataColumnWidth: string;
        let headerLabelRenderer: (value: string | number) => ReactNode;
        if (filter.groupBy === 'rarity') {
            dataColumnWidth = '11%';
            headerLabelRenderer = renderRarityHeaderLabel;
        } else {
            dataColumnWidth = '8.5%';
            headerLabelRenderer = renderClassHeaderLabel;
        }
        return (
            <MasterServantStatsTable
                classes={classes}
                stats={stats}
                dataColumnWidth={dataColumnWidth}
                headerLabelRenderer={headerLabelRenderer}
            />
        );
    }, [classes, filter, stats]);

    return (
        <div>
            <PageTitle>Servant Stats</PageTitle>
            <div className="px-4">
                <MasterServantStatsFilter onFilterChange={setFilter}></MasterServantStatsFilter>
            </div>
            {statsTableNode}
        </div>
    );

});
