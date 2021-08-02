import { GameServantConstants } from '../../constants';
import { GameServant, MasterServant, MasterServantAscensionLevel } from '../../types';

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
            appendSkills: {}
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

}
