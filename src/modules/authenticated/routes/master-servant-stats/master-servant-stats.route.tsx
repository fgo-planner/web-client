import { MasterAccount } from '@fgo-planner/types';
import { IconButton, Tooltip } from '@material-ui/core';
import { FormatListBulleted as FormatListBulletedIcon, GetApp as GetAppIcon } from '@material-ui/icons';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameServantClassIcon } from '../../../../components/game/servant/game-servant-class-icon.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { Nullable } from '../../../../types/internal';
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

export const MasterServantStatsRoute = React.memo(() => {

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

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes: ReactNode = useMemo(() => {
        return [
            <Tooltip key="servants" title="Back to servant list" placement="right">
                <div>
                    <IconButton
                        component={Link}
                        to="../servants"
                        children={<FormatListBulletedIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="export" title="Download servant stats" placement="right">
                <div>
                    {/* TODO Implement this */}
                    <IconButton children={<GetAppIcon />} disabled />
                </div>
            </Tooltip>
        ];
    }, []);

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
                stats={stats}
                dataColumnWidth={dataColumnWidth}
                headerLabelRenderer={headerLabelRenderer}
            />
        );
    }, [filter, stats]);

    return (
        <div className="flex column full-height">
            <PageTitle>Servant Stats</PageTitle>
            <div className="flex overflow-hidden">
                <NavigationRail children={navigationRailChildNodes} />
                <div className="flex column flex-fill">
                    <MasterServantStatsFilter onFilterChange={setFilter}></MasterServantStatsFilter>
                    {statsTableNode}
                </div>
            </div>
        </div>
    );

});
