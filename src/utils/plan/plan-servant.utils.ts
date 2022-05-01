import { GameServant, MasterServant, MasterServantAscensionLevel, PlanServant, PlanServantEnhancements } from '@fgo-planner/types';
import { Immutable, ImmutableArray } from '../../types/internal';
import { MasterServantUtils } from '../master/master-servant.utils';

export class PlanServantUtils {

    private constructor () {
        
    }

    /**
     * Instantiates a default `PlanServant` object.
     */
    static instantiate(instanceId: number): PlanServant {
        return {
            instanceId,
            enabled: {
                servant: true,
                ascensions: true,
                skills: true,
                appendSkills: true,
                costumes: true
            },
            current: {
                skills: {},
                appendSkills: {},
                costumes: []
            },
            target: {
                skills: {},
                appendSkills: {},
                costumes: []
            }
        };
    }

    /**
     * Returns a deep clone of the given `PlanServant` object.
     */
    static clone(planServant: Immutable<PlanServant>): PlanServant {
        const { current, target } = planServant;

        return {
            ...planServant,
            current: this.cloneEnhancements(current),
            target: this.cloneEnhancements(target)
        };
    }

    /**
     * Returns a deep clone of the given `PlanServantEnhancements` object.
     */
    static cloneEnhancements(enhancements: Immutable<PlanServantEnhancements>): PlanServantEnhancements {
        return {
            ...enhancements,
            skills: {
                ...enhancements.skills
            },
            appendSkills: {
                ...enhancements.appendSkills
            },
            costumes: [...enhancements.costumes]
        };
    }

    /**
     * Merges a `PlanServant` object into another.
     */
    static merge(target: PlanServant, source: Partial<PlanServant>): void {
        Object.assign(target, source);
        if (source.current) {
            target.current = {
                ...source.current,
            };
        }
    }

    /**
     * Updates the current enhancements of the given `PlanServant` with the data
     * from the given `MasterServant`. Does not populate the `costumes` field.
     */
    static updateCurrentEnhancements(planServant: PlanServant, masterServant: Immutable<MasterServant>): void {
        this.updateEnhancements(planServant.current, masterServant);
    }

    /**
     * Updates the given `PlanServantEnhancements` with the values from the given
     * `MasterServant`.
     */
    static updateEnhancements(
        enhancements: PlanServantEnhancements,
        masterServant: Immutable<MasterServant>
    ): void;
    /**
     * Updates the target `PlanServantEnhancements` with the values from the source
     * `PlanServantEnhancements`.
     */
    static updateEnhancements(
        target: PlanServantEnhancements,
        source: Immutable<PlanServantEnhancements>
    ): void;
    /**
     * Method implementation
     */
    static updateEnhancements(
        target: PlanServantEnhancements,
        source: Immutable<MasterServant> | Immutable<PlanServantEnhancements>
    ): void {
        target.level = source.level;
        target.ascension = source.ascension;
        target.fouHp = source.fouHp;
        target.fouAtk = source.fouAtk;
        target.skills[1] = source.skills[1];
        target.skills[2] = source.skills[2];
        target.skills[3] = source.skills[3];
        target.appendSkills[1] = source.appendSkills[1];
        target.appendSkills[2] = source.appendSkills[2];
        target.appendSkills[3] = source.appendSkills[3];
    }

    /**
     * Returns an array of `MasterServant` that have not been added to the plan.
     */
    static findAvailableServants(
        planServants: ImmutableArray<PlanServant>,
        masterServants: ImmutableArray<MasterServant>
    ): Array<Immutable<MasterServant>> {
        const planInstanceIds = new Set<number>();
        for (const { instanceId } of planServants) {
            planInstanceIds.add(instanceId);
        }
        return masterServants.filter(({ instanceId }) => !planInstanceIds.has(instanceId));
    }

    /**
     * Wraps the `MasterServantUtils.getLastInstanceId` method.
     */
    static getLastInstanceId(masterServants: Array<MasterServant>): number {
        return MasterServantUtils.getLastInstanceId(masterServants);
    }

    /**
     * Returns the servant art stage that corresponds to the given ascension level.
     * 
     * Wraps the `MasterServantUtils.getArtStage` method.
     */
    static getArtStage(ascension: MasterServantAscensionLevel): 1 | 2 | 3 | 4 {
        return MasterServantUtils.getArtStage(ascension);
    }

    /**
     * Rounds the given number to the closest valid Fou enhancement value.
     * 
     * Valid Fou values are integers in multiples of 10 for values between 0 and
     * 1000, and integers in multiples of 20 for values between 1000 and 2000.
     * 
     * Wraps the `MasterServantUtils.roundToNearestValidFouValue` method.
     */
    static roundToNearestValidFouValue(value: number): number {
        return MasterServantUtils.roundToNearestValidFouValue(value);
    }

    /**
     * Given a servant and their current level, rounds their ascension level to the
     * closest valid value.
     * 
     * Wraps the `MasterServantUtils.roundToNearestValidAscensionLevel` method.
     */
    static roundToNearestValidAscensionLevel(level: number, ascension: number, servant: GameServant): MasterServantAscensionLevel {
        return MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, servant);
    }

    /**
     * Given a servant and their current ascension level, rounds their level to the
     * closest valid value.
     * 
     * Wraps the `MasterServantUtils.roundToNearestValidLevel` method.
     */
    static roundToNearestValidLevel(ascension: number, level: number, servant: GameServant): number {
        return MasterServantUtils.roundToNearestValidLevel(ascension, level, servant);
    }

}
