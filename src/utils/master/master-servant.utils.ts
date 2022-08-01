import { GameServant, MasterServant, MasterServantAscensionLevel } from '@fgo-planner/types';
import { GameServantConstants } from '../../constants';
import { Immutable, ImmutableArray } from '../../types/internal';
import { DateTimeUtils } from '../date-time.utils';

export class MasterServantUtils {

    private constructor () {
        
    }

    /**
     * Instantiates a default `MasterServant` object.
     */
    static instantiate(instanceId = 0): MasterServant {
        return {
            instanceId,
            gameId: GameServantConstants.DefaultServantId,
            summoned: true, // Assume servant has been summoned by player by default
            np: GameServantConstants.MinNoblePhantasmLevel,
            level: GameServantConstants.MinLevel,
            ascension: GameServantConstants.MinAscensionLevel,
            skills: {
                1: GameServantConstants.MinSkillLevel
            },
            appendSkills: {}
        };
    }

    /**
     * Returns a deep clone of the given `MasterServant` object.
     */
    static clone(masterServant: Immutable<MasterServant>): MasterServant {
        const summonDate = DateTimeUtils.cloneDate(masterServant.summonDate);
        return {
            ...masterServant,
            summonDate,
            skills: {
                ...masterServant.skills
            },
            appendSkills: {
                ...masterServant.appendSkills
            }
        };
    }

    static getInstanceId(masterServant: Immutable<MasterServant>): number {
        return masterServant.instanceId;
    }

    static getLastInstanceId(masterServants: ImmutableArray<MasterServant>): number {
        if (!masterServants.length) {
            return 0;
        }
        return Math.max(...masterServants.map(servant => servant.instanceId));
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
    static roundToNearestValidAscensionLevel(
        level: number,
        ascension: number,
        { maxLevel }: Immutable<GameServant>
    ): MasterServantAscensionLevel {

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
    static roundToNearestValidLevel(
        ascension: number,
        level: number,
        { maxLevel }: Immutable<GameServant>
    ): number {

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
