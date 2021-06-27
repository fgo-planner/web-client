import { IconButton, Tooltip } from '@material-ui/core';
import { FormatListBulleted as FormatListBulletedIcon, GetApp as GetAppIcon } from '@material-ui/icons';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { NavigationRail } from '../../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useGameSoundtrackList } from '../../../../hooks/data/use-game-soundtrack-list.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { MasterAccount, Nullable } from '../../../../types';
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
     * Master account subscriptions
     */
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

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes: ReactNode = useMemo(() => {
        return [
            <Tooltip key="items" title="Back to item list" placement="right">
                <div>
                    <IconButton
                        component={Link}
                        to="../items"
                        children={<FormatListBulletedIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="export" title="Download item stats" placement="right">
                <div>
                    {/* TODO Implement this */}
                    <IconButton children={<GetAppIcon />} disabled />
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
