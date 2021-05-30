import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import React, { ReactNode, useEffect, useState } from 'react';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { MasterAccount, Nullable } from '../../../../types';
import { MasterItemStats, MasterItemStatsUtils } from './master-item-stats.utils';
import { MasterItemStatsTable } from './master-item-stats-table.component';

export const MasterItemStatsRoute = React.memo(() => {
    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [stats, setStats] = useState<MasterItemStats>();
    const [includeUnownedServants, setIncludeUnownedServants] = useState<boolean>(false);

    const gameServantMap = useGameServantMap();
    const gameItemMap = useGameItemMap();

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
