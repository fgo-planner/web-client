import { MasterAccount } from '@fgo-planner/types';
import { FormatListBulleted as FormatListBulletedIcon, GetApp as GetAppIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { NavigationRail } from '../../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useGameSoundtrackList } from '../../../../hooks/data/use-game-soundtrack-list.hook';
import { Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { MasterItemStatsFilter } from './master-item-stats-filter.component';
import { MasterItemStatsTable } from './master-item-stats-table.component';
import { MasterItemStats, MasterItemStatsFilterOptions, MasterItemStatsUtils } from './master-item-stats.utils';

export const MasterItemStatsRoute = React.memo(() => {
    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [filter, setFilter] = useState<MasterItemStatsFilterOptions>();

    const gameServantMap = useGameServantMap();
    const gameItemMap = useGameItemMap();
    const gameSoundtrackList = useGameSoundtrackList();

    const stats: MasterItemStats | undefined = useMemo(() => {
        if (!masterAccount || !gameServantMap || !gameSoundtrackList || !filter) {
            return undefined;
        }
        return MasterItemStatsUtils.generateStats(gameServantMap, gameSoundtrackList, masterAccount, filter);
    }, [filter, gameServantMap, gameSoundtrackList, masterAccount]);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes: ReactNode = useMemo(() => {
        return [
            <Tooltip key="items" title="Back to item list" placement="right">
                <div>
                    <IconButton
                        component={Link}
                        to="../master/items"
                        children={<FormatListBulletedIcon />}
                        size="large" />
                </div>
            </Tooltip>,
            <Tooltip key="export" title="Download item stats" placement="right">
                <div>
                    {/* TODO Implement this */}
                    <IconButton children={<GetAppIcon />} disabled size="large" />
                </div>
            </Tooltip>
        ];
    }, []);

    const statsTableNode: ReactNode = useMemo(() => {
        if (!stats || !gameItemMap || !filter) {
            return null;
        }
        return (
            <MasterItemStatsTable
                stats={stats}
                gameItemMap={gameItemMap}
                filter={filter}
            />
        );
    }, [filter, gameItemMap, stats]);

    return (
        <div className="flex column full-height">
            <PageTitle>Item Stats</PageTitle>
            <div className="flex overflow-hidden">
                <NavigationRail>
                    {navigationRailChildNodes}
                </NavigationRail>
                <div className="flex column flex-fill">
                    <MasterItemStatsFilter onFilterChange={setFilter} />
                    {statsTableNode}
                </div>
            </div>
        </div>
    );
});
