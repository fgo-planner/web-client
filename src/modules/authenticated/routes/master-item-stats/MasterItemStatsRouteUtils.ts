import { Immutable, ObjectUtils } from '@fgo-planner/common-core';
import { GameItemConstants, GameServant, GameServantEnhancement, GameServantSkillMaterials, ImmutableMasterAccount, ImmutableMasterServant, InstantiatedServantConstants, MasterServant } from '@fgo-planner/data-core';
import { isEmpty } from 'lodash-es';
import { GameServantMap, GameSoundtrackList } from '../../../../types';
import { MasterItemStatsRouteTypes } from './MasterItemStatsRouteTypes';

export namespace MasterItemStatsRouteUtils {

    export function generateStats(
        gameServantMap: GameServantMap,
        gameSoundtrackList: GameSoundtrackList,
        masterAccount: ImmutableMasterAccount,
        filter: MasterItemStatsRouteTypes.FilterOptions
    ): MasterItemStatsRouteTypes.ItemStats {

        const start = window.performance.now();

        const {
            includeUnsummonedServants,
            includeAppendSkills,
            includeLores,
            includeCostumes,
            includeSoundtracks
        } = filter;

        const stats: Record<number, MasterItemStatsRouteTypes.ItemStat> = {};

        _populateInventory(stats, masterAccount);

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

            _updateForServant(
                stats,
                servant,
                masterServant,
                includeAppendSkills,
                includeLores,
                unlockedCostumes,
                includeCostumes,
                isUnique
            );
        }

        if (includeSoundtracks) {
            const unlockedSoundtracks = new Set<number>(masterAccount.soundtracks);
            _updateForSoundtracks(
                stats,
                gameSoundtrackList,
                unlockedSoundtracks
            );
        }

        const end = window.performance.now();
        console.log(`Stats took ${(end - start).toFixed(2)}ms to compute.`);

        return stats;
    }

    function _populateInventory(stats: Record<number, MasterItemStatsRouteTypes.ItemStat>, { resources }: ImmutableMasterAccount): void {
        const { items, qp } = resources;
        for (const [key, quantity] of Object.entries(items)) {
            const itemId = Number(key);
            const stat = _instantiateItemStat();
            stat.inventory = quantity;
            stats[itemId] = stat;
        }
        const stat = _instantiateItemStat();
        stat.inventory = qp;
        stats[GameItemConstants.QpItemId] = stat;
    }

    function _updateForServant(
        stats: Record<number, MasterItemStatsRouteTypes.ItemStat>,
        servant: Immutable<GameServant>,
        masterServant: ImmutableMasterServant,
        includeAppendSkills: boolean,
        includeLores: boolean,
        unlockedCostumes: Set<number>,
        includeCostumes: boolean,
        isUnique: boolean
    ): void {

        _updateForServantSkills(stats, servant.skillMaterials, masterServant.skills, includeLores);

        if (includeAppendSkills) {
            _updateForServantSkills(stats, servant.appendSkillMaterials, masterServant.appendSkills, includeLores);
        }

        if (servant.ascensionMaterials) {
            for (const [key, ascension] of Object.entries(servant.ascensionMaterials)) {
                const ascensionLevel = Number(key);
                const ascended = masterServant.ascension >= ascensionLevel;
                _updateForServantEnhancement(stats, ascension, 1, ascended ? 1 : 0);
            }
        }

        if (isUnique && includeCostumes) {
            for (const [key, costume] of Object.entries(servant.costumes)) {
                const costumeId = Number(key);
                const costumeUnlocked = unlockedCostumes.has(costumeId);
                _updateForServantEnhancement(stats, costume.materials, 1, costumeUnlocked ? 1 : 0);
            }
        }
    }

    function _updateForServantSkills(
        stats: Record<number, MasterItemStatsRouteTypes.ItemStat>,
        skillMaterials: Immutable<GameServantSkillMaterials>,
        skillLevels: MasterServant['appendSkills'],
        includeLores: boolean
    ): void {

        const skill1 = skillLevels[1] ?? 0;
        const skill2 = skillLevels[2] ?? 0;
        const skill3 = skillLevels[3] ?? 0;

        for (const [key, skill] of Object.entries(skillMaterials)) {
            const skillLevel = Number(key);

            /**
             * The number of skills that still need to be upgraded to this enhancement
             * level.
             */
            const skillUpgradeCount =
                (skill1 > skillLevel ? 1 : 0) +
                (skill2 > skillLevel ? 1 : 0) +
                (skill3 > skillLevel ? 1 : 0);

            /**
             * Exclude debt computation for the last skill level if `includeLores` is set to
             * false.
             */
            const excludeDebt = !includeLores && skillLevel === InstantiatedServantConstants.MaxSkillLevel - 1;

            _updateForServantEnhancement(stats, skill, 3, skillUpgradeCount, excludeDebt);
        }
    }

    /**
     *
     * @param stats The stats object to be updated.
     * 
     * @param enhancement The skill, ascension, or costume enhancement.
     * 
     * @param maxEnhancementCount This should be `3` for skills, and `1` for
     * ascension and costumes.
     * 
     * @param enhancementCount How many times this enhancement has been performed.
     * For ascensions and costumes, this should be `1` if the upgrade has been
     * performed, and `0` if it has not been performed. For skills, this is the
     * number of skills out of the 3 that has been upgraded.
     * 
     * @param excludeDebt Whether to exclude debt calculation for this enhancement.
     */
    function _updateForServantEnhancement(
        stats: Record<number, MasterItemStatsRouteTypes.ItemStat>,
        enhancement: Immutable<GameServantEnhancement>,
        maxEnhancementCount = 1,
        enhancementCount = 0,
        excludeDebt = false
    ): void {

        for (const [key, quantity] of Object.entries(enhancement.materials)) {
            const itemId = Number(key);
            const stat = ObjectUtils.getOrDefault(stats, itemId, _instantiateItemStat);
            const cost = quantity * maxEnhancementCount;
            const used = enhancementCount * quantity;
            stat.cost += cost;
            stat.used += used;
            if (!excludeDebt) {
                const debt = cost - used;
                stat.debt += debt;
            }
        }

        /**
         * QP stats
         */
        const quantity = enhancement.qp;
        const stat = ObjectUtils.getOrDefault(stats, GameItemConstants.QpItemId, _instantiateItemStat);
        const cost = quantity * maxEnhancementCount;
        const used = enhancementCount * quantity;
        stat.cost += cost;
        stat.used += used;
        if (!excludeDebt) {
            const debt = cost - used;
            stat.debt += debt;
        }
    }

    function _updateForSoundtracks(
        stats: Record<number, MasterItemStatsRouteTypes.ItemStat>,
        gameSoundtrackList: GameSoundtrackList,
        unlockedSoundtracks: Set<number>
    ): void {

        for (const { _id, material } of gameSoundtrackList) {
            if (isEmpty(material)) {
                continue;
            }
            /**
             * There should be exactly one item.
             */
            const [key, quantity] = Object.entries(material)[0];
            const itemId = Number(key);
            const summoned = unlockedSoundtracks.has(_id);
            const stat = ObjectUtils.getOrDefault(stats, itemId, _instantiateItemStat);
            const cost = quantity;
            stat.cost += cost;
            if (!summoned) {
                stat.debt += cost;
            } else {
                stat.used += cost;
            }
        }
    }

    function _instantiateItemStat(): MasterItemStatsRouteTypes.ItemStat {
        return {
            inventory: 0,
            used: 0,
            cost: 0,
            debt: 0
        };
    }

}
