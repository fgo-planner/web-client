import { GameServantMap } from '../../../../services/data/game/game-servant.service';
import { GameServant, GameServantEnhancement, MasterAccount, MasterServant } from '../../../../types';
import { MapUtils } from '../../../../utils/map.utils';

export type MasterItemStat = {
    ownedServantsCost: number;
    allServantsCost: number;
    inventory: number;
    used: number;
    ownedServantsDebt: number;
    allServantsDebt: number;
};

export type MasterItemStats = Record<number, MasterItemStat>;

export class MasterItemStatsUtils {

    // TODO Move this to constants file
    private static readonly _QPItemId = 5;

    static generateStats(gameServantMap: GameServantMap, masterAccount: MasterAccount): MasterItemStats {

        const start = window.performance.now();

        const stats: Record<number, MasterItemStat> = {};

        this._populateInventory(stats, masterAccount);

        const ownedServants = new Set<number>();
        const unlockedCostumes = new Set<number>(masterAccount.costumes);

        for (const masterServant of masterAccount.servants) {
            const servantId = masterServant.gameId;
            const servant = gameServantMap[servantId];
            if (!servant) {
                // TODO Log/throw error
                continue;
            }
            ownedServants.add(masterServant.gameId);
            this._updateForOwnedServant(stats, servant, masterServant, unlockedCostumes);
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

    private static _populateInventory(stats: Record<number, MasterItemStat>, masterAccount: MasterAccount): void {
        for (const masterItem of masterAccount.items) {
            const stat = this._instantiateItemStat();
            stat.inventory = masterItem.quantity;
            stats[masterItem.itemId] = stat;
        }
        const stat = this._instantiateItemStat();
        stat.inventory = masterAccount.qp;
        stats[this._QPItemId] = stat;
    }

    private static _updateForOwnedServant(
        stats: Record<number, MasterItemStat>,
        servant: GameServant,
        masterServant: MasterServant,
        unlockedCostumes: Set<number>
    ): void {

        const skill1 = masterServant.skills[1];
        const skill2 = masterServant.skills[2] ?? 0;
        const skill3 = masterServant.skills[3] ?? 0;

        for (const [key, skill] of Object.entries(servant.skillMaterials)) {
            const skillLevel = Number(key);
            const skillUpgradeCount =
                (skill1 > skillLevel ? 1 : 0) +
                (skill2 > skillLevel ? 1 : 0) +
                (skill3 > skillLevel ? 1 : 0);
            this._updateForEnhancement(stats, skill, true, 3, skillUpgradeCount);
        }

        if (servant.ascensionMaterials) {
            for (const [key, ascension] of Object.entries(servant.ascensionMaterials)) {
                const ascensionLevel = Number(key);
                const ascended =  masterServant.ascension >= ascensionLevel;
                this._updateForEnhancement(stats, ascension, true, 1, ascended ? 1 : 0);
            }
        }

        for (const [key, costume] of Object.entries(servant.costumes)) {
            const costumeId = Number(key);
            const costumeUnlocked = unlockedCostumes.has(costumeId);
            this._updateForEnhancement(stats, costume.materials, true, 1, costumeUnlocked ? 1 : 0);
        }
    }

    private static _updateForUnownedServant(
        stats: Record<number, MasterItemStat>,
        servant: GameServant
    ): void {

        for (const skill of Object.values(servant.skillMaterials)) {
            this._updateForEnhancement(stats, skill, false, 3);
        }
        if (servant.ascensionMaterials) {
            for (const ascension of Object.values(servant.ascensionMaterials)) {
                this._updateForEnhancement(stats, ascension);
            }
        }
        for (const costume of Object.values(servant.costumes)) {
            /*
             * TODO Maybe refer to the unlocked servant costumes? It shouldn't be needed
             * though, because it's not possible to unlock a costume without owning the
             * servant.
             */
            this._updateForEnhancement(stats, costume.materials);
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
        stats: Record<number, MasterItemStat>,
        enhancement: GameServantEnhancement,
        owned = false,
        maxUpgrades = 1,
        upgradeCount = 0
    ): void {

        for (const { itemId, quantity } of enhancement.materials) {
            const stat = MapUtils.getOrDefault(stats, itemId, this._instantiateItemStat);
            const cost = quantity * maxUpgrades;
            if (!owned) {
                stat.allServantsCost += cost;
                stat.allServantsDebt += cost;
            } else {
                const used = upgradeCount * quantity;
                const debt = cost - used;
                stat.used += used;
                stat.ownedServantsCost += cost;
                stat.allServantsCost += cost;
                stat.ownedServantsDebt += debt;
                stat.allServantsDebt += debt;
            }
        }

        // QP Stats
        const quantity = enhancement.qp;
        const stat = stats[this._QPItemId];
        const cost = quantity * maxUpgrades;
        if (!owned) {
            stat.allServantsCost += cost;
            stat.allServantsDebt += cost;
        } else {
            const used = upgradeCount * quantity;
            const debt = cost - used;
            stat.used += used;
            stat.ownedServantsCost += cost;
            stat.allServantsCost += cost;
            stat.ownedServantsDebt += debt;
            stat.allServantsDebt += debt;
        }
    }

    private static _instantiateItemStat(): MasterItemStat {
        return {
            ownedServantsCost: 0,
            allServantsCost: 0,
            inventory: 0,
            used: 0,
            ownedServantsDebt: 0,
            allServantsDebt: 0
        };
    }

}
