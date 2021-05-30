import { GameServantConstants } from '../../constants';
import { GameServant, GameServantEnhancement, MasterServant, MasterServantAscensionLevel } from '../../types';
import { MapUtils } from '../map.utils';

export type MasterServantMaterialDebtStats = {
    ascensions: number;
    skills: number;
    costumes: number;
    total: number;
};

export class MasterServantUtils {

    //#region Data manipulation methods

    /**
     * Instantiates a default `MasterServant` object.
     */
    static instantiate(): MasterServant {
        return {
            instanceId: 0,
            gameId: 100100, // TODO Un-hardcode this
            np: 1,
            level: 1,
            ascension: 0,
            skills: {
                1: 1
            },
        };
    }

    /**
     * Returns a deep clone of the given `MasterServant` object.
     */
    static clone(masterServant: MasterServant): MasterServant {
        return {
            ...masterServant,
            skills: {
                ...masterServant.skills
            }
        };
    }

    /**
     * Merges a `MasterServant` object into another.
     */
    static merge(target: MasterServant, source: Partial<MasterServant>): void {
        Object.assign(target, source);
        if (source.skills) {
            target.skills = {
                ...source.skills
            };
        }
    }

    /**
     * Returns the servant art stage that corresponds to the given ascension level.
     */
    static getArtStage(ascension: MasterServantAscensionLevel): 1 | 2 | 3 | 4 {
        switch (ascension) {
        case 0:
            return 1;
        case 1:
        case 2:
            return 2;
        case 3:
            return 3;
        case 4:
            return 4;
        }
    }

    /**
     * Rounds the given number to the closest valid Fou enhancement value.
     * 
     * Valid Fou values are integers in multiples of 10 for values between 0 and
     * 1000, and integers in multiples of 20 for values between 1000 and 2000.
     */
    static roundToNearestValidFouValue(value: number): number {
        if (value < GameServantConstants.MinFou) {
            return GameServantConstants.MinFou;
        } else if (value > GameServantConstants.MaxFou) {
            return GameServantConstants.MaxFou;
        }
        if (value < GameServantConstants.MaxFou / 2) {
            return Math.round(value / 10) * 10;
        } else {
            return Math.round(value / 20) * 20;
        }
    }

    /**
     * Given a servant and their current level, rounds their ascension level to the
     * closest valid value.
     */
    static roundToNearestValidAscensionLevel(level: number, ascension: number, servant: GameServant): MasterServantAscensionLevel {
        const { maxLevel } = servant;
        if (level > maxLevel - 10) {
            return 4;
        }
        if (level === maxLevel - 10) {
            return ascension === 4 ? 4 : 3;
        }
        if (level > maxLevel - 20) {
            return 3;
        }
        if (level === maxLevel - 20) {
            return ascension >= 3 ? 3 : 2;
        }
        if (level > maxLevel - 30) {
            return 2;
        }
        if (level === maxLevel - 30) {
            return ascension >= 2 ? 2 : 1;
        }
        if (level > maxLevel - 40) {
            return 1;
        }
        if (level === maxLevel - 40) {
            return ascension >= 1 ? 1 : 0;
        }
        return 0;
    }

    /**
     * Given a servant and their current ascension level, rounds their level to the
     * closest valid value.
     */
    static roundToNearestValidLevel(ascension: number, level: number, servant: GameServant): number {
        const { maxLevel } = servant;
        switch (ascension) {
        case 4:
            return Math.max(maxLevel - 10, level);
        case 3:
            return Math.max(maxLevel - 20, Math.min(level, maxLevel - 10));
        case 2:
            return Math.max(maxLevel - 30, Math.min(level, maxLevel - 20));
        case 1:
            return Math.max(maxLevel - 40, Math.min(level, maxLevel - 30));
        case 0:
            return Math.min(maxLevel - 40, level);
        }
        return GameServantConstants.MinLevel;
    }

    static getLastInstanceId(masterServants: MasterServant[]): number {
        if (!masterServants.length) {
            return -1;
        }
        return  Math.max(...masterServants.map(servant => servant.instanceId));
    }

    //#endregion


    //#region Enhancement computation methods
    
    static computeMaterialDebtStats(
        servant: Readonly<GameServant>,
        masterServant: Readonly<MasterServant>,
        unlockedCostumes: Array<number>
    ): Record<number, MasterServantMaterialDebtStats> {

        const unlockedCostumeSet = new Set(unlockedCostumes);

        const stats: Record<number, MasterServantMaterialDebtStats> = {};

        const skill1 = masterServant.skills[1];
        const skill2 = masterServant.skills[2] ?? 0;
        const skill3 = masterServant.skills[3] ?? 0;

        for (const [key, skill] of Object.entries(servant.skillMaterials)) {
            const skillLevel = Number(key);
            const skillUpgradesNeeded =
                (skill1 > skillLevel ? 0 : 1) +
                (skill2 > skillLevel ? 0 : 1) +
                (skill3 > skillLevel ? 0 : 1);
            /*
             * Skip if all three skills are already upgraded to this level.
             */
            if (skillUpgradesNeeded === 0) {
                continue;
            }
            this._updateForEnhancement(stats, skill, 'skills', skillUpgradesNeeded);
        }

        if (servant.ascensionMaterials) {
            for (const [key, ascension] of Object.entries(servant.ascensionMaterials)) {
                const ascensionLevel = Number(key);
                /*
                 * Skip if servant is already ascended to this level.
                 */
                if (masterServant.ascension >= ascensionLevel) {
                    continue;
                }
                this._updateForEnhancement(stats, ascension, 'ascensions');
            }
        }

        for (const [key, costume] of Object.entries(servant.costumes)) {
            const costumeId = Number(key);
            /*
             * Skip if servant is already ascended to this level.
             */
            if (unlockedCostumeSet.has(costumeId)) {
                continue;
            }
            this._updateForEnhancement(stats, costume.materials, 'costumes');
        }

        return stats;
    }

    private static _updateForEnhancement(
        stats: Record<number, MasterServantMaterialDebtStats>,
        enhancement: GameServantEnhancement,
        key: keyof MasterServantMaterialDebtStats,
        count = 1
    ): void {

        for (const { itemId, quantity } of enhancement.materials) {
            // TODO Exclude lores
            const stat = MapUtils.getOrDefault(stats, itemId, this._instantiateMaterialDebtStat);
            const total = quantity * count;
            stat[key] += total;
            stat.total += total;
        }
    }

    private static _instantiateMaterialDebtStat(): MasterServantMaterialDebtStats {
        return {
            ascensions: 0,
            skills: 0,
            costumes: 0,
            total: 0
        };
    }

    //#endregion

}