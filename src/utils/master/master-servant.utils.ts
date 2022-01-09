import { GameServant, MasterServant, MasterServantAscensionLevel } from '@fgo-planner/types';
import { GameServantConstants } from '../../constants';

export class MasterServantUtils {

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
    static merge(target: MasterServant, source: MasterServant): void;

    /**
     * Merges an array of `MasterServant` objects into another. Servants that exist
     * in both arrays (matched by `gameId`) will be merged together. In case of
     * duplicates in one or both lists, they will be matched by their order of
     * appearance (index).
     */
    static merge(target: Array<MasterServant>, source: Array<MasterServant>): void;

    /**
     * Method implementation
     */
    static merge(target: MasterServant | Array<MasterServant>, source: MasterServant | Array<MasterServant>): void {
        if (!Array.isArray(target) && !Array.isArray(source)) {
            this._merge(target, source);
        } else if (Array.isArray(target) && Array.isArray(source)) {
            this._mergeArrays(target, source);
        }
    }

    private static _merge(target: MasterServant, source: MasterServant): void {
        /*
         * Copy the deep cloned fields over to the target. The deep cloning is for
         * creating new instances of nested object(s).
         */
        Object.assign(target, this.clone(source));
    }

    private static _mergeArrays(target: Array<MasterServant>, source: Array<MasterServant>): void {
        /*
         * Nothing to do, return.
         */
        if (!source.length) {
            return;
        }
        
        /*
         * No need to do any individual merges, just copy the entire list.
         */
        if (!target.length) {
            target.push(...source);
            return;
        }

        /**
         * The last `instanceId` of the target list.
         */
        let lastInstanceId = this.getLastInstanceId(target);

        /**
         * A map of the target list where the key is the servant `gameId` and the
         * values are buckets containing the servants with the `gameId`.
         */
        const targetMapByGameId = new Map<number, Array<MasterServant>>();
        for (const targetServant of target) {
            const { gameId } = targetServant;
            let bucket = targetMapByGameId.get(gameId);
            if (!bucket) {
                targetMapByGameId.set(gameId, bucket = []);
            }
            bucket.push(targetServant);
        }

        /**
         * Keeps track of the number of servants by `gameId` have that have been merged
         * into the target list.
         */
        const mergeCountByGameId: Record<number, number> = {};

        /*
         * Iterate through the source list.
         */
        for (const sourceServant of source) {
            const { gameId } = sourceServant;
            const mergeCount = mergeCountByGameId[gameId] || 0;
            const bucket = targetMapByGameId.get(gameId);

            /**
             * The target servant to merge into.
             */
            const mergeTarget = bucket?.[mergeCount];

            /*
             * If a suitable merge target could not be found, then just add the servant to
             * the target list. Otherwise, merge the source servant into the target and
             * update the merge count.
             */
            if (!mergeTarget) {
                sourceServant.instanceId = ++lastInstanceId;
                target.push(sourceServant);
            } else {
                this._merge(mergeTarget, sourceServant);
                mergeCountByGameId[gameId] = mergeCount + 1;
            }

        }
    }

    static getLastInstanceId(masterServants: Array<MasterServant>): number {
        if (!masterServants.length) {
            return 0;
        }
        return Math.max(...masterServants.map(servant => servant.instanceId));
    }

    static reassignInstanceIds(masterServants: Array<MasterServant>, startId = 1) {
        masterServants.forEach((servant, index) => servant.instanceId = startId + index);
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

}
