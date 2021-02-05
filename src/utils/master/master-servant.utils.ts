import { GameServantConstants } from 'app-constants';
import { GameServant, MasterServant } from 'data';

export class MasterServantUtils {

    /**
     * Instantiates a default `MasterServant` object.
     */
    static instantiate(): MasterServant {
        return {
            instanceId: 0,
            gameId: 100100, // TODO Un-hardcode this
            level: 1,
            ascensionLevel: 0,
            skillLevels: {
                1: 1
            },
            noblePhantasmLevel: 1
        };
    }

    /**
     * Returns a deep clone of the given `MasterServant` object.
     */
    static clone(masterServant: MasterServant): MasterServant {
        return {
            ...masterServant,
            skillLevels: {
                ...masterServant.skillLevels
            }
        };
    }

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
    static roundToNearestValidAscensionLevel(level: number, ascension: number, servant: GameServant): number {
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

}