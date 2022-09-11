import { Immutable } from '@fgo-planner/common-core';
import { GameItemConstants, GameServant, GameServantEnhancement, GameServantSkillMaterials, ImmutableMasterAccount, ImmutableMasterServant, MasterServant } from '@fgo-planner/data-core';
import { GameServantMap, GameSoundtrackList } from '../../../../types/data';
import { ObjectUtils } from '../../../../utils/object.utils';

export type MasterItemStat = {
    inventory: number;
    used: number;
    cost: number;
    debt: number;
};

export type MasterItemStatsFilterOptions = {
    includeUnsummonedServants: boolean;
    includeAppendSkills: boolean;
    includeCostumes: boolean;
    includeSoundtracks: boolean;
};

export type MasterItemStats = Record<number, MasterItemStat>;

export class MasterItemStatsUtils {

    private constructor () {
        
    }

    static generateStats(
        gameServantMap: GameServantMap,
        gameSoundtrackList: GameSoundtrackList,
        masterAccount: ImmutableMasterAccount,
        filter: MasterItemStatsFilterOptions
    ): MasterItemStats {

        const start = window.performance.now();

        const {
            includeUnsummonedServants,
            includeAppendSkills,
            includeCostumes,
            includeSoundtracks
        } = filter;

        const stats: Record<number, MasterItemStat> = {};

        this._populateInventory(stats, masterAccount);

        const masterServantIds = new Set<number>();
        const unlockedCostumes = new Set<number>(masterAccount.costumes); // TODO Only populate this when `includeCostumes` is true

        for (const masterServant of masterAccount.servants) {

            if (!masterServant.summoned && !includeUnsummonedServants) {
                continue;
            }

            const servantId = masterServant.gameId;
            const servant = gameServantMap[servantId];
            if (!servant) {
                // TODO Log/throw error
                continue;
            }
            
            let isUnique = false;
            if (!masterServantIds.has(servantId)) {
                masterServantIds.add(servantId);
                isUnique = true;
            }
            
            this._updateForServant(
                stats,
                servant,
                masterServant,
                includeAppendSkills,
                unlockedCostumes,
                includeCostumes,
                isUnique
            );
        }

        if (includeSoundtracks) {
            const unlockedSoundtracks = new Set<number>(masterAccount.soundtracks);
            this._updateForSoundtracks(
                stats,
                gameSoundtrackList,
                unlockedSoundtracks
            );
        }

        const end = window.performance.now();
        console.log(`Stats took ${(end - start).toFixed(2)}ms to compute.`);

        return stats;
    }

    private static _populateInventory(stats: Record<number, MasterItemStat>, { resources }: ImmutableMasterAccount): void {
        const { items, qp } = resources;
        for (const masterItem of items) {
            const stat = this._instantiateItemStat();
            stat.inventory = masterItem.quantity;
            stats[masterItem.itemId] = stat;
        }
        const stat = this._instantiateItemStat();
        stat.inventory = qp;
        stats[GameItemConstants.QpItemId] = stat;
    }

    private static _updateForServant(
        stats: Record<number, MasterItemStat>,
        servant: Immutable<GameServant>,
        masterServant: ImmutableMasterServant,
        includeAppendSkills: boolean,
        unlockedCostumes: Set<number>,
        includeCostumes: boolean,
        isUnique: boolean
    ): void {

        this._updateForServantSkills(stats, servant.skillMaterials, masterServant.skills);

        if (includeAppendSkills) {
            this._updateForServantSkills(stats, servant.appendSkillMaterials, masterServant.appendSkills);
        }

        if (servant.ascensionMaterials) {
            for (const [key, ascension] of Object.entries(servant.ascensionMaterials)) {
                const ascensionLevel = Number(key);
                const ascended = masterServant.ascension >= ascensionLevel;
                this._updateForServantEnhancement(stats, ascension, 1, ascended ? 1 : 0);
            }
        }

        if (isUnique && includeCostumes) {
            for (const [key, costume] of Object.entries(servant.costumes)) {
                const costumeId = Number(key);
                const costumeUnlocked = unlockedCostumes.has(costumeId);
                this._updateForServantEnhancement(stats, costume.materials, 1, costumeUnlocked ? 1 : 0);
            }
        }
    }

    private static _updateForServantSkills(
        stats: Record<number, MasterItemStat>,
        skillMaterials: Immutable<GameServantSkillMaterials>,
        skillLevels: MasterServant['appendSkills']
    ): void {
        const skill1 = skillLevels[1] ?? 0;
        const skill2 = skillLevels[2] ?? 0;
        const skill3 = skillLevels[3] ?? 0;
        for (const [key, skill] of Object.entries(skillMaterials)) {
            const skillLevel = Number(key);
            const skillUpgradeCount =
                (skill1 > skillLevel ? 1 : 0) +
                (skill2 > skillLevel ? 1 : 0) +
                (skill3 > skillLevel ? 1 : 0);
            this._updateForServantEnhancement(stats, skill, 3, skillUpgradeCount);
        }
    }

    /**
     *
     * @param stats The stats object to be updated.
     * @param enhancement The skill, ascension, or costume enhancement.
     * @param maxEnhancementCount This should be `3` for skills, and `1` for
     * ascension and costumes.
     * @param enhancementCount How many times this enhancement has been performed.
     * For ascensions and costumes, this should be `1` if the upgrade has been
     * performed, and `0` if it has not been performed. For skills, this is the
     * number of skills out of the 3 that has been upgraded.
     */
    private static _updateForServantEnhancement(
        stats: Record<number, MasterItemStat>,
        enhancement: Immutable<GameServantEnhancement>,
        maxEnhancementCount = 1,
        enhancementCount = 0
    ): void {

        for (const { itemId, quantity } of enhancement.materials) {
            const stat = ObjectUtils.getOrDefault(stats, itemId, this._instantiateItemStat);
            const cost = quantity * maxEnhancementCount;
            const used = enhancementCount * quantity;
            const debt = cost - used;
            stat.cost += cost;
            stat.used += used;
            stat.debt += debt;
        }

        // QP Stats
        const quantity = enhancement.qp;
        const stat = stats[GameItemConstants.QpItemId];
        const cost = quantity * maxEnhancementCount;
        const used = enhancementCount * quantity;
        const debt = cost - used;
        stat.cost += cost;
        stat.used += used;
        stat.debt += debt;
    }

    private static _updateForSoundtracks(
        stats: Record<number, MasterItemStat>,
        gameSoundtrackList: GameSoundtrackList,
        unlockedSoundtracks: Set<number>
    ): void {

        for (const { _id, material } of gameSoundtrackList) {
            if (!material) {
                continue;
            }
            const summoned = unlockedSoundtracks.has(_id);
            const stat = stats[material.itemId];
            const cost = material.quantity;
            stat.cost += cost;
            if (!summoned) {
                stat.debt += cost;
            } else {
                stat.used += cost;
            }
        }
    }

    private static _instantiateItemStat(): MasterItemStat {
        return {
            inventory: 0,
            used: 0,
            cost: 0,
            debt: 0
        };
    }

}
