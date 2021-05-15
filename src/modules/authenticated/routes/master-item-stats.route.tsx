import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import React, { ReactNode, useEffect, useState } from 'react';
import { PageTitle } from '../../../components/text/page-title.component';
import { GameItemMap, GameItemService } from '../../../services/data/game/game-item.service';
import { GameServantMap, GameServantService } from '../../../services/data/game/game-servant.service';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { MasterAccount, Nullable } from '../../../types';
import { ItemStats, MasterItemStatsUtils } from '../../../utils/master/master-item-stats.utils';
import { MasterItemStatsTable } from '../components/master/item/stats/master-item-stats-table.component';

export const MasterItemStatsRoute = React.memo(() => {
    const [gameServantMap, setGameServantMap] = useState<GameServantMap>();
    const [gameItemMap, setGameItemMap] = useState<GameItemMap>();
    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [stats, setStats] = useState<ItemStats>();
    const [includeUnownedServants, setIncludeUnownedServants] = useState<boolean>(false);

    /*
     * Retrieve game servant map.
     */
    useEffect(() => {
        GameServantService.getServantsMap().then(gameServantMap => {
            setGameServantMap(gameServantMap);
        });
    }, []);

    /*
     * Retrieve game item map.
     */
    useEffect(() => {
        GameItemService.getItemsMap().then(gameItemMap => {
            setGameItemMap(gameItemMap);
        });
    }, []);


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

    useEffect(() => {
        if (!gameServantMap || !masterAccount) {
            return;
        }
        const stats = MasterItemStatsUtils.generateStats(gameServantMap, masterAccount);
        setStats(stats);
    }, [gameServantMap, masterAccount]);

    let statsTable: ReactNode = null;
    if (stats && gameItemMap) {
        statsTable = (
            <MasterItemStatsTable
                stats={stats}
                gameItemMap={gameItemMap}
                includeUnownedServants={includeUnownedServants} />
        );
    }

    return (
        <div className="flex column full-height">
            <PageTitle>Item Stats</PageTitle>
            <div className="px-6 pt-8 pb-2">
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="noExpire"
                                checked={includeUnownedServants}
                                onChange={e => setIncludeUnownedServants(e.target.checked)}
                            />
                        }
                        label="Include un-summoned servants"
                    />
                </FormGroup>
            </div>
            {statsTable}
        </div>
    );
});
