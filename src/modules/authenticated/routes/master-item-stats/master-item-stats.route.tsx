import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import React, { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { MasterAccount, Nullable } from '../../../../types';
import { MasterItemStats, MasterItemStatsFilterOptions, MasterItemStatsUtils } from './master-item-stats.utils';
import { MasterItemStatsTable } from './master-item-stats-table.component';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { useGameSoundtrackList } from '../../../../hooks/data/use-game-soundtrack-list.hook';

export const MasterItemStatsRoute = React.memo(() => {
    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [filter, setFilter] = useState<MasterItemStatsFilterOptions>({
        includeUnownedServants: false,
        includeCostumes: true,
        includeSoundtracks: false
    });

    const gameServantMap = useGameServantMap();
    const gameItemMap = useGameItemMap();
    const gameSoundtrackList = useGameSoundtrackList();

    const stats: MasterItemStats | undefined = useMemo(() => {
        if (!masterAccount || !gameServantMap || !gameSoundtrackList) {
            return undefined;
        }
        return MasterItemStatsUtils.generateStats(gameServantMap, gameSoundtrackList, masterAccount, filter);
    }, [filter, gameServantMap, gameSoundtrackList, masterAccount]);

    /*
     * Master account subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(account => {
                setMasterAccount(account);
            });

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

    const handleIncludeUnownedServantsChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const includeUnownedServants = event.target.checked;
        if (includeUnownedServants === filter.includeUnownedServants) {
            return;
        }
        setFilter({
            ...filter,
            includeUnownedServants
        });
    }, [filter]);

    const handleIncludeCostumesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const includeCostumes = event.target.checked;
        if (includeCostumes === filter.includeCostumes) {
            return;
        }
        setFilter({
            ...filter,
            includeCostumes
        });
    }, [filter]);

    const handleIncludeSoundtracksChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const includeSoundtracks = event.target.checked;
        if (includeSoundtracks === filter.includeSoundtracks) {
            return;
        }
        setFilter({
            ...filter,
            includeSoundtracks
        });
    }, [filter]);

    const statsTableNode: ReactNode = useMemo(() => {
        if (!stats || !gameItemMap) {
            return null;
        }
        return (
            <MasterItemStatsTable
                stats={stats}
                gameItemMap={gameItemMap}
                filter={filter} />
        );
    }, [filter, gameItemMap, stats]);

    return (
        <div className="flex column full-height">
            <PageTitle>Item Stats</PageTitle>
            <div className="px-6 pt-8 pb-2">
                <FormGroup row>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="includeUnownedServants"
                                checked={filter.includeUnownedServants}
                                onChange={handleIncludeUnownedServantsChange}
                            />
                        }
                        label="Un-summoned servants"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="includeCostumes"
                                checked={filter.includeCostumes}
                                onChange={handleIncludeCostumesChange}
                            />
                        }
                        label="Costumes"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="includeSoundtracks"
                                checked={filter.includeSoundtracks}
                                onChange={handleIncludeSoundtracksChange}
                            />
                        }
                        label="Soundtracks"
                    />
                </FormGroup>
            </div>
            {statsTableNode}
        </div>
    );
});
