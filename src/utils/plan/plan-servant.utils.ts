import { GameServant, MasterServant, MasterServantAscensionLevel, PlanServant, PlanServantOwned, PlanServantType } from '@fgo-planner/types';
import { MasterServantUtils } from '../master/master-servant.utils';

export class PlanServantUtils {

    /**
     * Instantiates a default `PlanServant` object.
     */
    static instantiate(gameId: number, instanceId?: number): PlanServant {

        const planServant: PlanServant =  {
            type: instanceId !== undefined ? PlanServantType.Owned : PlanServantType.Unowned,
            gameId,
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

        if (instanceId !== undefined) {
            (planServant as PlanServantOwned).instanceId = instanceId;
        }

        return planServant;
    }

    /**
     * Returns a deep clone of the given `PlanServant` object.
     */
    static clone(planServant: PlanServant): PlanServant {
        const { current, target } = planServant;

        return {
            ...planServant,
            current: {
                ...current,
                skills: {
                    ...current.skills
                },
                appendSkills: {
                    ...current.appendSkills
                },
                costumes: [...current.costumes]
            },
            target: {
                ...target,
                skills: {
                    ...target.skills
                },
                appendSkills: {
                    ...target.appendSkills
                },
                costumes: [...target.costumes]
            }
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
     * Populates the current enhancements of a `PlanServant` from a `MasterServant`.
     * Does not populate the `costumes` field.
     */
    static populateCurrentEnhancements(planServant: PlanServant, masterServant: MasterServant): void {
        const { current } = planServant;
        current.level = masterServant.level;
        current.ascension = masterServant.ascension;
        current.fouHp = masterServant.fouHp;
        current.fouAtk = masterServant.fouAtk;
        current.skills[1] = masterServant.skills[1];
        current.skills[2] = masterServant.skills[2];
        current.skills[3] = masterServant.skills[3];
        current.appendSkills[1] = masterServant.appendSkills[1];
        current.appendSkills[2] = masterServant.appendSkills[2];
        current.appendSkills[3] = masterServant.appendSkills[3];
    }

    /**
     * Returns an array of `MasterServant` that have not been added to the plan.
     */
    static findAvailableMasterServants(
        planServants: ReadonlyArray<PlanServant>,
        masterServants: ReadonlyArray<MasterServant>
    ): Array<MasterServant> {
        const ownedPlanServants = planServants.filter(servant => servant.type === PlanServantType.Owned);
        const ownedPlanServantIds = new Set(ownedPlanServants.map(servant => (servant as PlanServantOwned).instanceId));
        return masterServants.filter(servant => !ownedPlanServantIds.has(servant.instanceId));
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
