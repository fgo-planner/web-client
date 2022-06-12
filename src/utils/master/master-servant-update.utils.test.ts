import { MasterServantBondLevel } from '@fgo-planner/types';
import { GameServantConstants } from '../../constants';
import { ReadonlyRecord } from '../../types/internal';
import { MasterServantUpdateUtils } from './master-servant-update.utils';

describe('MasterServantUtils.instantiate', () => {

    it('should instantiate a MasterServantUpdate object with expected default values', () => {

        const bondLevels: ReadonlyRecord<number, MasterServantBondLevel> = {};

        const unlockedCostumes: Array<number> = [];

        const result = MasterServantUpdateUtils.instantiateForNewServant(bondLevels, unlockedCostumes);

        expect(result.isNewServant).toStrictEqual(true);
        expect(result.gameId).toStrictEqual(GameServantConstants.DefaultServantId);
        expect(result.summoned).toStrictEqual(true);
        expect(result.np).toStrictEqual(GameServantConstants.MinLevel);
        expect(result.ascension).toStrictEqual(GameServantConstants.MinAscensionLevel);
        expect(result.skills[1]).toStrictEqual(GameServantConstants.MinSkillLevel);
        expect(result.skills[2]).toBeUndefined();
        expect(result.skills[3]).toBeUndefined();
        expect(result.appendSkills[1]).toBeUndefined();
        expect(result.appendSkills[2]).toBeUndefined();
        expect(result.appendSkills[3]).toBeUndefined();
        expect(result.bondLevel).toBeUndefined();
        expect(result.unlockedCostumes).toBeDefined();
        expect(result.unlockedCostumes!.size).toStrictEqual(0);
    });

    it('should instantiate a MasterServantUpdate object with correct bond value', () => {

        const bondLevels: ReadonlyRecord<number, MasterServantBondLevel> = {
            [GameServantConstants.DefaultServantId]: 5,
            200100: 10,
            300100: 15
        };

        const unlockedCostumes: Array<number> = [];

        const result = MasterServantUpdateUtils.instantiateForNewServant(bondLevels, unlockedCostumes);

        expect(result.isNewServant).toStrictEqual(true);
        expect(result.gameId).toStrictEqual(GameServantConstants.DefaultServantId);
        expect(result.summoned).toStrictEqual(true);
        expect(result.np).toStrictEqual(GameServantConstants.MinLevel);
        expect(result.ascension).toStrictEqual(GameServantConstants.MinAscensionLevel);
        expect(result.skills[1]).toStrictEqual(GameServantConstants.MinSkillLevel);
        expect(result.skills[2]).toBeUndefined();
        expect(result.skills[3]).toBeUndefined();
        expect(result.appendSkills[1]).toBeUndefined();
        expect(result.appendSkills[2]).toBeUndefined();
        expect(result.appendSkills[3]).toBeUndefined();
        expect(result.bondLevel).toStrictEqual(5);
        expect(result.unlockedCostumes).toBeDefined();
        expect(result.unlockedCostumes!.size).toStrictEqual(0);
    });

    it('should instantiate a MasterServantUpdate object with expected costume IDs', () => {

        const bondLevels: ReadonlyRecord<number, MasterServantBondLevel> = {};

        const unlockedCostumes: Array<number> = [
            300440,
            400130,
            400430
        ];

        const result = MasterServantUpdateUtils.instantiateForNewServant(bondLevels, unlockedCostumes);

        expect(result.isNewServant).toStrictEqual(true);
        expect(result.gameId).toStrictEqual(GameServantConstants.DefaultServantId);
        expect(result.summoned).toStrictEqual(true);
        expect(result.np).toStrictEqual(GameServantConstants.MinLevel);
        expect(result.ascension).toStrictEqual(GameServantConstants.MinAscensionLevel);
        expect(result.skills[1]).toStrictEqual(GameServantConstants.MinSkillLevel);
        expect(result.skills[2]).toBeUndefined();
        expect(result.skills[3]).toBeUndefined();
        expect(result.appendSkills[1]).toBeUndefined();
        expect(result.appendSkills[2]).toBeUndefined();
        expect(result.appendSkills[3]).toBeUndefined();
        expect(result.bondLevel).toBeUndefined();
        expect(result.unlockedCostumes).toBeDefined();
        expect(result.unlockedCostumes!.size).toStrictEqual(3);
        expect(result.unlockedCostumes!.has(300440)).toBeTruthy();
        expect(result.unlockedCostumes!.has(400130)).toBeTruthy();
        expect(result.unlockedCostumes!.has(400430)).toBeTruthy();
    });

});
