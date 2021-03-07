import { GameServantMap } from '../../services/data/game/game-servant.service';
import { GameServant, GameServantEnhancement, MasterAccount, MasterServant } from '../../types';
import { MapUtils } from '../map.utils';

export type ItemStat = {
    inventory: number;
    used: number;
    ownedServantsDebt: number;
    allServantsDebt: number;
};

export type ItemStats = Record<number, ItemStat>;

export class MasterItemStatsUtils {

    // TODO Move this to constants file
    private static readonly _QPItemId = 5;

    static generateStats(gameServantMap: GameServantMap, masterAccount: MasterAccount): ItemStats {

        const start = window.performance.now();

        const stats: Record<number, ItemStat> = {};

        this._populateInventory(stats, masterAccount);

        const ownedServants = new Set<number>();
        for (const masterServant of masterAccount.servants) {
            const servantId = masterServant.gameId;
            const servant = gameServantMap[servantId];
            if (!servant) {
                // TODO Log/throw error
                continue;
            }
            ownedServants.add(masterServant.gameId);
            this._updateForOwnedServant(stats, servant, masterServant);
        }

        for (const servant of Object.values(gameServantMap)) {
            const servantId = servant._id;
            if (ownedServants.has(servantId)) {
                continue;
            }
            this._updateForUnownedServant(stats, servant);
        }

        const end = window.performance.now();
        console.log(`Stats by class took ${(end - start).toFixed(2)}ms to compute.`);
        console.log(stats);
        return stats;

    }

    private static _populateInventory(stats: Record<number, ItemStat>, masterAccount: MasterAccount): void {
        for (const masterItem of masterAccount.items) {
            const stat = this._instantiateItemStat();
            stat.inventory = masterItem.quantity;
            stats[masterItem.itemId] = stat;
        }
        const stat = this._instantiateItemStat();
        stat.inventory = masterAccount.qp;
        stats[this._QPItemId] = stat;
    }

    private static _updateForOwnedServant(stats: Record<number, ItemStat>, servant: GameServant, masterServant: MasterServant): void {
        const skill1 = masterServant.skills[1];
        const skill2 = masterServant.skills[2] ?? 0;
        const skill3 = masterServant.skills[3] ?? 0;

        let skillLevel = 1;
        for (const skillUpgrade of Object.values(servant.skillMaterials)) {

            const skillUpgradeCount =
                (skill1 > skillLevel ? 1 : 0) +
                (skill2 > skillLevel ? 1 : 0) +
                (skill3 > skillLevel ? 1 : 0);

            this._updateForEnhancement(stats, skillUpgrade, true, 3, skillUpgradeCount);
            skillLevel++;
        }

        // Some servants (Mash) don't have ascension materials
        if (servant.ascensionMaterials) {
            let ascensionLevel = 1;
            for (const ascension of Object.values(servant.ascensionMaterials)) {
                const ascended =  masterServant.ascension >= ascensionLevel;
                this._updateForEnhancement(stats, ascension, true, 1, ascended ? 1 : 0);
                ascensionLevel++;
            }
        }

        // TODO Add costumes
    }

    private static _updateForUnownedServant(stats: Record<number, ItemStat>, servant: GameServant): void {
        for (const skillUpgrade of Object.values(servant.skillMaterials)) {
            this._updateForEnhancement(stats, skillUpgrade, false, 3);
        }
        if (servant.ascensionMaterials) {
            for (const ascension of Object.values(servant.ascensionMaterials)) {
                this._updateForEnhancement(stats, ascension);
            }
        }
    }

    /**
     *
     * @param stats The stats object to be updated.
     * @param enhancement The skill, ascension, or costume enhancement.
     * @param owned Whether the servant is owned by the master.
     * @param maxUpgrades This should be `3` for skills, and `1` for ascension and
     * costumes.
     * @param upgradeCount How many times this was upgraded. For ascensions and
     * costumes, this should be `1` if the upgrade has been performed, and `0` if
     * it has not been performed. For skills, this is the number of skills out of
     * the 3 that has been upgraded.
     */
    private static _updateForEnhancement(
        stats: Record<number, ItemStat>,
        enhancement: GameServantEnhancement,
        owned = false,
        maxUpgrades = 1,
        upgradeCount = 0
    ): void {

        for (const material of enhancement.materials) {
            const quantity = material.quantity;
            const stat = MapUtils.getOrDefault(stats, material.itemId, this._instantiateItemStat);
            if (!owned) {
                const debt = quantity * maxUpgrades;
                stat.allServantsDebt += debt;
            } else {
                const used = upgradeCount * quantity;
                const debt = quantity * maxUpgrades - used;
                stat.used += used;
                stat.ownedServantsDebt += debt;
                stat.allServantsDebt += debt;
            }
        }

        // QP Stats
        const quantity = enhancement.qp;
        const stat = stats[this._QPItemId];
        if (!owned) {
            const debt = quantity * maxUpgrades;
            stat.allServantsDebt += debt;
        } else {
            const used = upgradeCount * quantity;
            const debt = quantity * maxUpgrades - used;
            stat.used += used;
            stat.ownedServantsDebt += debt;
            stat.allServantsDebt += debt;
        }
    }

    private static _instantiateItemStat(): ItemStat {
        return {
            inventory: 0,
            used: 0,
            ownedServantsDebt: 0,
            allServantsDebt: 0
        };
    }

}
