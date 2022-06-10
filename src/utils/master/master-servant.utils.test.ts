import { MasterServant } from '@fgo-planner/types';
import { GameServantConstants } from '../../constants';
import { MasterServantUtils } from './master-servant.utils';

describe('MasterServantUtils.instantiate', () => {

    it('should instantiate a MasterServant object with default instanceId', () => {

        const result = MasterServantUtils.instantiate();

        expect(result.instanceId).toStrictEqual(0);
        expect(result.gameId).toStrictEqual(GameServantConstants.DefaultServantId);
        expect(result.summoned).toStrictEqual(true);
        expect(result.summonDate).toBeUndefined();
        expect(result.np).toStrictEqual(GameServantConstants.MinNoblePhantasmLevel);
        expect(result.level).toStrictEqual(GameServantConstants.MinLevel);
        expect(result.ascension).toStrictEqual(GameServantConstants.MinAscensionLevel);
        expect(result.fouHp).toBeUndefined();
        expect(result.fouAtk).toBeUndefined();
        expect(result.skills[1]).toStrictEqual(GameServantConstants.MinSkillLevel);
        expect(result.skills[2]).toBeUndefined();
        expect(result.skills[3]).toBeUndefined();
        expect(result.appendSkills[1]).toBeUndefined();
        expect(result.appendSkills[2]).toBeUndefined();
        expect(result.appendSkills[3]).toBeUndefined();
    });

    it('should instantiate a MasterServant object with the given instanceId', () => {
        const testInstanceId = 69;
        
        const result = MasterServantUtils.instantiate(testInstanceId);

        expect(result.instanceId).toStrictEqual(testInstanceId);
        expect(result.gameId).toStrictEqual(GameServantConstants.DefaultServantId);
        expect(result.summoned).toStrictEqual(true);
        expect(result.summonDate).toBeUndefined();
        expect(result.np).toStrictEqual(GameServantConstants.MinNoblePhantasmLevel);
        expect(result.level).toStrictEqual(GameServantConstants.MinLevel);
        expect(result.ascension).toStrictEqual(GameServantConstants.MinAscensionLevel);
        expect(result.fouHp).toBeUndefined();
        expect(result.fouAtk).toBeUndefined();
        expect(result.skills[1]).toStrictEqual(GameServantConstants.MinSkillLevel);
        expect(result.skills[2]).toBeUndefined();
        expect(result.skills[3]).toBeUndefined();
        expect(result.appendSkills[1]).toBeUndefined();
        expect(result.appendSkills[2]).toBeUndefined();
        expect(result.appendSkills[3]).toBeUndefined();
    });

});

describe('MasterServantUtils.clone', () => {

    it('should deep clone the given MasterServant object', () => {

        const testMasterServant: MasterServant = {
            instanceId: 69,
            gameId: 100100,
            summoned: true,
            np: 5,
            level: 80,
            ascension: 4,
            fouAtk: 1000,
            fouHp: 1000,
            skills: {
                1: 10,
                2: 10,
                3: 10
            },
            appendSkills: {
                2: 1
            }  
        };

        const result = MasterServantUtils.clone(testMasterServant);

        // Cloned objects should be a separate instance
        expect(result).not.toBe(testMasterServant);
        expect(result.skills).not.toBe(testMasterServant.skills);
        expect(result.appendSkills).not.toBe(testMasterServant.appendSkills);

        expect(result.instanceId).toStrictEqual(testMasterServant.instanceId);
        expect(result.gameId).toStrictEqual(testMasterServant.gameId);
        expect(result.summoned).toStrictEqual(testMasterServant.summoned);
        expect(result.summonDate).toBeUndefined();
        expect(result.np).toStrictEqual(testMasterServant.np);
        expect(result.level).toStrictEqual(testMasterServant.level);
        expect(result.ascension).toStrictEqual(testMasterServant.ascension);
        expect(result.fouHp).toStrictEqual(testMasterServant.fouHp);
        expect(result.fouAtk).toStrictEqual(testMasterServant.fouAtk);
        expect(result.skills[1]).toStrictEqual(testMasterServant.skills[1]);
        expect(result.skills[2]).toStrictEqual(testMasterServant.skills[2]);
        expect(result.skills[3]).toStrictEqual(testMasterServant.skills[3]);
        expect(result.appendSkills[1]).toStrictEqual(testMasterServant.appendSkills[1]);
        expect(result.appendSkills[2]).toStrictEqual(testMasterServant.appendSkills[2]);
        expect(result.appendSkills[3]).toStrictEqual(testMasterServant.appendSkills[3]);
    });

    it('should deep clone the given MasterServant object with summon date', () => {

        const testMasterServant: MasterServant = {
            instanceId: 69,
            gameId: 100100,
            summoned: true,
            summonDate: new Date(1574294400000),
            np: 5,
            level: 80,
            ascension: 4,
            fouAtk: 1000,
            fouHp: 1000,
            skills: {
                1: 10,
                2: 10,
                3: 10
            },
            appendSkills: {
                2: 1
            }  
        };

        const result = MasterServantUtils.clone(testMasterServant);

        // Cloned objects should be a separate instance
        expect(result).not.toBe(testMasterServant);
        expect(result.skills).not.toBe(testMasterServant.skills);
        expect(result.appendSkills).not.toBe(testMasterServant.appendSkills);
        expect(result.summonDate).not.toBe(testMasterServant.summonDate);

        expect(result.instanceId).toStrictEqual(testMasterServant.instanceId);
        expect(result.gameId).toStrictEqual(testMasterServant.gameId);
        expect(result.summoned).toStrictEqual(testMasterServant.summoned);
        expect(result.summonDate).toBeDefined();
        expect(result.summonDate!.getTime()).toStrictEqual(testMasterServant.summonDate!.getTime());
        expect(result.np).toStrictEqual(testMasterServant.np);
        expect(result.level).toStrictEqual(testMasterServant.level);
        expect(result.ascension).toStrictEqual(testMasterServant.ascension);
        expect(result.fouHp).toStrictEqual(testMasterServant.fouHp);
        expect(result.fouAtk).toStrictEqual(testMasterServant.fouAtk);
        expect(result.skills[1]).toStrictEqual(testMasterServant.skills[1]);
        expect(result.skills[2]).toStrictEqual(testMasterServant.skills[2]);
        expect(result.skills[3]).toStrictEqual(testMasterServant.skills[3]);
        expect(result.appendSkills[1]).toStrictEqual(testMasterServant.appendSkills[1]);
        expect(result.appendSkills[2]).toStrictEqual(testMasterServant.appendSkills[2]);
        expect(result.appendSkills[3]).toStrictEqual(testMasterServant.appendSkills[3]);
    });

});
