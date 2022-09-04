import { MasterServant } from '@fgo-planner/data-types';
import { GameServantConstants } from '../../constants';
import { Rarity1TestServant, Rarity2TestServant, Rarity5TestServant } from '../../test-data/game-servant-test-data.test';
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
                1: 6,
                2: 9,
                3: 10
            },
            appendSkills: {
                1: 1,
                2: 10
            }
        };

        const result = MasterServantUtils.clone(testMasterServant);

        // Cloned objects should be a separate instance
        expect(result).not.toBe(testMasterServant);
        expect(result.skills).not.toBe(testMasterServant.skills);
        expect(result.appendSkills).not.toBe(testMasterServant.appendSkills);

        expect(result.instanceId).toStrictEqual(69);
        expect(result.gameId).toStrictEqual(100100);
        expect(result.summoned).toStrictEqual(true);
        expect(result.summonDate).toBeUndefined();
        expect(result.np).toStrictEqual(5);
        expect(result.level).toStrictEqual(80);
        expect(result.ascension).toStrictEqual(4);
        expect(result.fouHp).toStrictEqual(1000);
        expect(result.fouAtk).toStrictEqual(1000);
        expect(result.skills[1]).toStrictEqual(6);
        expect(result.skills[2]).toStrictEqual(9);
        expect(result.skills[3]).toStrictEqual(10);
        expect(result.appendSkills[1]).toStrictEqual(1);
        expect(result.appendSkills[2]).toStrictEqual(10);
        expect(result.appendSkills[3]).toBeUndefined();
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
                1: 6,
                2: 9,
                3: 10
            },
            appendSkills: {
                1: 1,
                2: 10
            }
        };

        const result = MasterServantUtils.clone(testMasterServant);

        // Cloned objects should be a separate instance
        expect(result).not.toBe(testMasterServant);
        expect(result.skills).not.toBe(testMasterServant.skills);
        expect(result.appendSkills).not.toBe(testMasterServant.appendSkills);
        expect(result.summonDate).not.toBe(testMasterServant.summonDate);

        expect(result.instanceId).toStrictEqual(69);
        expect(result.gameId).toStrictEqual(100100);
        expect(result.summoned).toStrictEqual(true);
        expect(result.summonDate).toBeDefined();
        expect(result.summonDate!.getTime()).toStrictEqual(1574294400000);
        expect(result.np).toStrictEqual(5);
        expect(result.level).toStrictEqual(80);
        expect(result.ascension).toStrictEqual(4);
        expect(result.fouHp).toStrictEqual(1000);
        expect(result.fouAtk).toStrictEqual(1000);
        expect(result.skills[1]).toStrictEqual(6);
        expect(result.skills[2]).toStrictEqual(9);
        expect(result.skills[3]).toStrictEqual(10);
        expect(result.appendSkills[1]).toStrictEqual(1);
        expect(result.appendSkills[2]).toStrictEqual(10);
        expect(result.appendSkills[3]).toBeUndefined();
    });

});

describe('MasterServantUtils.getLastInstanceId', () => {

    it('should return 0 for empty input array', () => {
        const testMasterServants: Array<MasterServant> = [];

        const result = MasterServantUtils.getLastInstanceId(testMasterServants);
        expect(result).toStrictEqual(0);
    });

    it('should return largest instanceId for test input array', () => {

        const testMasterServants: Array<MasterServant> = [
            {
                instanceId: 1,
                gameId: 100100,
                summoned: true,
                np: 5,
                level: 80,
                ascension: 4,
                skills: {
                    1: 9,
                    2: 9,
                    3: 9
                },
                appendSkills: {}
            },
            {
                instanceId: 69,
                gameId: 100300,
                summoned: true,
                np: 3,
                level: 80,
                ascension: 4,
                skills: {
                    1: 9,
                    2: 9,
                    3: 9
                },
                appendSkills: {}
            },
            {
                instanceId: 2,
                gameId: 100200,
                summoned: true,
                np: 2,
                level: 80,
                ascension: 4,
                fouAtk: 1000,
                fouHp: 1000,
                skills: {
                    1: 10,
                    2: 10,
                    3: 10
                },
                appendSkills: {}
            }
        ];

        const result = MasterServantUtils.getLastInstanceId(testMasterServants);
        expect(result).toStrictEqual(69);
    });

});

describe('MasterServantUtils.getArtStage', () => {

    it('should return 1 for ascension level 0', () => {
        const result = MasterServantUtils.getArtStage(0);
        expect(result).toStrictEqual(1);
    });

    it('should return 2 for ascension level 1', () => {
        const result = MasterServantUtils.getArtStage(1);
        expect(result).toStrictEqual(2);
    });

    it('should return 2 for ascension level 2', () => {
        const result = MasterServantUtils.getArtStage(2);
        expect(result).toStrictEqual(2);
    });

    it('should return 3 for ascension level 3', () => {
        const result = MasterServantUtils.getArtStage(3);
        expect(result).toStrictEqual(3);
    });

    it('should return 4 for ascension level 4', () => {
        const result = MasterServantUtils.getArtStage(4);
        expect(result).toStrictEqual(4);
    });

});

describe('MasterServantUtils.roundToNearestValidFouValue', () => {

    it(`should return ${GameServantConstants.MinFou} for a negative value`, () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(-1);
        expect(result).toStrictEqual(GameServantConstants.MinFou);
    });

    it(`should return ${GameServantConstants.MinFou} for an input value of ${GameServantConstants.MinFou}`, () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(GameServantConstants.MinFou);
        expect(result).toStrictEqual(GameServantConstants.MinFou);
    });

    it('should return 200 for an input value of 200', () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(200);
        expect(result).toStrictEqual(200);
    });

    it('should return 200 for an input value of 201', () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(201);
        expect(result).toStrictEqual(200);
    });

    it('should return 210 for an input value of 205', () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(205);
        expect(result).toStrictEqual(210);
    });

    it('should return 210 for an input value of 209', () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(209);
        expect(result).toStrictEqual(210);
    });

    it('should return 1000 for an input value of 1000', () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(1000);
        expect(result).toStrictEqual(1000);
    });

    it('should return 1200 for an input value of 1200', () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(1200);
        expect(result).toStrictEqual(1200);
    });

    it('should return 1200 for an input value of 1201', () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(1201);
        expect(result).toStrictEqual(1200);
    });

    it('should return 1220 for an input value of 1210', () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(1210);
        expect(result).toStrictEqual(1220);
    });

    it('should return 1220 for an input value of 1219', () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(1219);
        expect(result).toStrictEqual(1220);
    });

    it(`should return ${GameServantConstants.MaxFou} for an input value of ${GameServantConstants.MaxFou}`, () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(GameServantConstants.MaxFou);
        expect(result).toStrictEqual(GameServantConstants.MaxFou);
    });

    it(`should return ${GameServantConstants.MaxFou} for an input value that is greater than ${GameServantConstants.MaxFou}`, () => {
        const result = MasterServantUtils.roundToNearestValidFouValue(GameServantConstants.MaxFou + 500);
        expect(result).toStrictEqual(GameServantConstants.MaxFou);
    });

});


describe('MasterServantUtils.roundToNearestValidAscensionLevel', () => {

    describe('for a 1* servant', () => {

        it('should return 4 for an input value of 0 and a level greater than 50', () => {
            const level = 51;
            const ascension = 0;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(4);
        });

        it('should return 4 for an input value of 4 and a level greater than 50', () => {
            const level = 51;
            const ascension = 4;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(4);
        });

        it('should return 4 for an input value of 4 and a level of 50', () => {
            const level = 50;
            const ascension = 4;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(4);
        });

        it('should return 3 for an input value of 3 and a level of 50', () => {
            const level = 50;
            const ascension = 3;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 0 and a level between 40 and 50', () => {
            const level = 45;
            const ascension = 0;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 3 and a level between 40 and 50', () => {
            const level = 45;
            const ascension = 3;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 4 and a level between 40 and 50', () => {
            const level = 45;
            const ascension = 4;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 3 and a level of 40', () => {
            const level = 40;
            const ascension = 3;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 2 for an input value of 2 and a level of 40', () => {
            const level = 40;
            const ascension = 2;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 0 and a level between 30 and 40', () => {
            const level = 35;
            const ascension = 0;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 2 and a level between 30 and 40', () => {
            const level = 35;
            const ascension = 2;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 4 and a level between 30 and 40', () => {
            const level = 35;
            const ascension = 4;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 2 and a level of 30', () => {
            const level = 30;
            const ascension = 2;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 1 for an input value of 1 and a level of 30', () => {
            const level = 30;
            const ascension = 1;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 0 and a level between 20 and 30', () => {
            const level = 25;
            const ascension = 0;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 1 and a level between 20 and 30', () => {
            const level = 25;
            const ascension = 1;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 4 and a level between 20 and 30', () => {
            const level = 25;
            const ascension = 4;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 1 and a level of 20', () => {
            const level = 20;
            const ascension = 1;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 0 for an input value of 0 and a level of 20', () => {
            const level = 20;
            const ascension = 0;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(0);
        });

        it('should return 0 for an input value of 0 and a level less than 20', () => {
            const level = 19;
            const ascension = 0;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(0);
        });

        it('should return 0 for an input value of 4 and a level less than 20', () => {
            const level = 19;
            const ascension = 4;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(0);
        });

    });

    describe('for a 2* servant', () => {

        it('should return 4 for an input value of 0 and a level greater than 55', () => {
            const level = 56;
            const ascension = 0;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(4);
        });

        it('should return 4 for an input value of 4 and a level greater than 55', () => {
            const level = 56;
            const ascension = 4;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(4);
        });

        it('should return 4 for an input value of 4 and a level of 55', () => {
            const level = 55;
            const ascension = 4;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(4);
        });

        it('should return 3 for an input value of 3 and a level of 55', () => {
            const level = 55;
            const ascension = 3;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 0 and a level between 45 and 55', () => {
            const level = 50;
            const ascension = 0;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 3 and a level between 45 and 55', () => {
            const level = 50;
            const ascension = 3;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 4 and a level between 45 and 55', () => {
            const level = 50;
            const ascension = 4;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 3 and a level of 45', () => {
            const level = 45;
            const ascension = 3;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 2 for an input value of 2 and a level of 45', () => {
            const level = 45;
            const ascension = 2;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 0 and a level between 35 and 45', () => {
            const level = 40;
            const ascension = 0;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 2 and a level between 35 and 45', () => {
            const level = 40;
            const ascension = 2;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 4 and a level between 35 and 45', () => {
            const level = 40;
            const ascension = 4;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 2 and a level of 35', () => {
            const level = 35;
            const ascension = 2;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 1 for an input value of 1 and a level of 35', () => {
            const level = 35;
            const ascension = 1;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 0 and a level between 25 and 35', () => {
            const level = 30;
            const ascension = 0;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 1 and a level between 25 and 35', () => {
            const level = 30;
            const ascension = 1;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 4 and a level between 25 and 35', () => {
            const level = 30;
            const ascension = 4;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 1 and a level of 25', () => {
            const level = 25;
            const ascension = 1;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 0 for an input value of 0 and a level of 25', () => {
            const level = 25;
            const ascension = 0;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(0);
        });

        it('should return 0 for an input value of 0 and a level less than 25', () => {
            const level = 24;
            const ascension = 0;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(0);
        });

        it('should return 0 for an input value of 4 and a level less than 25', () => {
            const level = 24;
            const ascension = 4;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(0);
        });

    });

    describe('for a 5* servant', () => {

        it('should return 4 for an input value of 0 and a level greater than 80', () => {
            const level = 81;
            const ascension = 0;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(4);
        });

        it('should return 4 for an input value of 4 and a level greater than 80', () => {
            const level = 81;
            const ascension = 4;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(4);
        });

        it('should return 4 for an input value of 4 and a level of 80', () => {
            const level = 80;
            const ascension = 4;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(4);
        });

        it('should return 3 for an input value of 3 and a level of 80', () => {
            const level = 80;
            const ascension = 3;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 0 and a level between 70 and 80', () => {
            const level = 75;
            const ascension = 0;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 3 and a level between 70 and 80', () => {
            const level = 75;
            const ascension = 3;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 4 and a level between 70 and 80', () => {
            const level = 75;
            const ascension = 4;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 3 for an input value of 3 and a level of 70', () => {
            const level = 70;
            const ascension = 3;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(3);
        });

        it('should return 2 for an input value of 2 and a level of 70', () => {
            const level = 70;
            const ascension = 2;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 0 and a level between 60 and 70', () => {
            const level = 69;
            const ascension = 0;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 2 and a level between 60 and 70', () => {
            const level = 69;
            const ascension = 2;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 4 and a level between 60 and 70', () => {
            const level = 69;
            const ascension = 4;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 2 for an input value of 2 and a level of 60', () => {
            const level = 60;
            const ascension = 2;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(2);
        });

        it('should return 1 for an input value of 1 and a level of 60', () => {
            const level = 60;
            const ascension = 1;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 0 and a level between 50 and 60', () => {
            const level = 55;
            const ascension = 0;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 1 and a level between 50 and 60', () => {
            const level = 55;
            const ascension = 1;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 4 and a level between 50 and 60', () => {
            const level = 55;
            const ascension = 4;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 1 for an input value of 1 and a level of 50', () => {
            const level = 50;
            const ascension = 1;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(1);
        });

        it('should return 0 for an input value of 0 and a level of 50', () => {
            const level = 50;
            const ascension = 0;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(0);
        });

        it('should return 0 for an input value of 0 and a level less than 50', () => {
            const level = 49;
            const ascension = 0;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(0);
        });

        it('should return 0 for an input value of 4 and a level less than 50', () => {
            const level = 49;
            const ascension = 4;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidAscensionLevel(level, ascension, testGameServant);
            expect(result).toStrictEqual(0);
        });

    });

});

describe('MasterServantUtils.roundToNearestValidLevel', () => {

    describe('for a 1* servant', () => {

        it('should return 60 for an input value of 60 and ascension 4', () => {
            const level = 60;
            const ascension = 4;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(60);
        });

        it('should return 50 for an input value of 50 and ascension 4', () => {
            const level = 50;
            const ascension = 4;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(50);
        });

        it('should return 50 for an input value of 1 and ascension 4', () => {
            const level = 1;
            const ascension = 4;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(50);
        });

        it('should return 50 for an input value of 60 and ascension 3', () => {
            const level = 60;
            const ascension = 3;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(50);
        });

        it('should return 50 for an input value of 50 and ascension 3', () => {
            const level = 50;
            const ascension = 3;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(50);
        });

        it('should return 45 for an input value of 45 (between 40 and 50) and ascension 3', () => {
            const level = 45;
            const ascension = 3;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(45);
        });

        it('should return 40 for an input value of 40 and ascension 3', () => {
            const level = 40;
            const ascension = 3;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(40);
        });

        it('should return 40 for an input value of 1 and ascension 3', () => {
            const level = 1;
            const ascension = 3;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(40);
        });

        it('should return 40 for an input value of 60 and ascension 2', () => {
            const level = 60;
            const ascension = 2;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(40);
        });

        it('should return 40 for an input value of 40 and ascension 2', () => {
            const level = 40;
            const ascension = 2;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(40);
        });

        it('should return 35 for an input value of 35 (between 30 and 40) and ascension 2', () => {
            const level = 35;
            const ascension = 2;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(35);
        });

        it('should return 30 for an input value of 30 and ascension 2', () => {
            const level = 30;
            const ascension = 2;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(30);
        });

        it('should return 30 for an input value of 1 and ascension 2', () => {
            const level = 1;
            const ascension = 2;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(30);
        });

        it('should return 30 for an input value of 60 and ascension 1', () => {
            const level = 60;
            const ascension = 1;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(30);
        });

        it('should return 30 for an input value of 30 and ascension 1', () => {
            const level = 30;
            const ascension = 1;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(30);
        });

        it('should return 25 for an input value of 25 (between 20 and 30) and ascension 1', () => {
            const level = 25;
            const ascension = 1;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(25);
        });

        it('should return 20 for an input value of 20 and ascension 1', () => {
            const level = 20;
            const ascension = 1;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(20);
        });

        it('should return 20 for an input value of 1 and ascension 1', () => {
            const level = 1;
            const ascension = 1;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(20);
        });

        it('should return 20 for an input value of 60 and ascension 0', () => {
            const level = 60;
            const ascension = 0;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(20);
        });

        it('should return 20 for an input value of 20 and ascension 0', () => {
            const level = 20;
            const ascension = 0;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(20);
        });

        it('should return 1 for an input value of 1 and ascension 0', () => {
            const level = 1;
            const ascension = 0;
            const testGameServant = Rarity1TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(1);
        });

    });

    describe('for a 2* servant', () => {

        it('should return 65 for an input value of 65 and ascension 4', () => {
            const level = 65;
            const ascension = 4;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(65);
        });

        it('should return 55 for an input value of 55 and ascension 4', () => {
            const level = 55;
            const ascension = 4;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(55);
        });

        it('should return 55 for an input value of 1 and ascension 4', () => {
            const level = 1;
            const ascension = 4;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(55);
        });

        it('should return 55 for an input value of 65 and ascension 3', () => {
            const level = 65;
            const ascension = 3;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(55);
        });

        it('should return 55 for an input value of 55 and ascension 3', () => {
            const level = 55;
            const ascension = 3;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(55);
        });

        it('should return 50 for an input value of 50 (between 45 and 55) and ascension 3', () => {
            const level = 50;
            const ascension = 3;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(50);
        });

        it('should return 45 for an input value of 45 and ascension 3', () => {
            const level = 45;
            const ascension = 3;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(45);
        });

        it('should return 45 for an input value of 1 and ascension 3', () => {
            const level = 1;
            const ascension = 3;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(45);
        });

        it('should return 45 for an input value of 65 and ascension 2', () => {
            const level = 65;
            const ascension = 2;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(45);
        });

        it('should return 45 for an input value of 45 and ascension 2', () => {
            const level = 45;
            const ascension = 2;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(45);
        });

        it('should return 40 for an input value of 40 (between 35 and 45) and ascension 2', () => {
            const level = 40;
            const ascension = 2;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(40);
        });

        it('should return 35 for an input value of 35 and ascension 2', () => {
            const level = 35;
            const ascension = 2;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(35);
        });

        it('should return 35 for an input value of 1 and ascension 2', () => {
            const level = 1;
            const ascension = 2;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(35);
        });

        it('should return 35 for an input value of 65 and ascension 1', () => {
            const level = 65;
            const ascension = 1;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(35);
        });

        it('should return 35 for an input value of 35 and ascension 1', () => {
            const level = 35;
            const ascension = 1;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(35);
        });

        it('should return 30 for an input value of 30 (between 25 and 35) and ascension 1', () => {
            const level = 30;
            const ascension = 1;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(30);
        });

        it('should return 25 for an input value of 25 and ascension 1', () => {
            const level = 25;
            const ascension = 1;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(25);
        });

        it('should return 25 for an input value of 1 and ascension 1', () => {
            const level = 1;
            const ascension = 1;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(25);
        });

        it('should return 25 for an input value of 65 and ascension 0', () => {
            const level = 65;
            const ascension = 0;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(25);
        });

        it('should return 25 for an input value of 25 and ascension 0', () => {
            const level = 25;
            const ascension = 0;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(25);
        });

        it('should return 1 for an input value of 1 and ascension 0', () => {
            const level = 1;
            const ascension = 0;
            const testGameServant = Rarity2TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(1);
        });

    });

    describe('for a 5* servant', () => {

        it('should return 90 for an input value of 90 and ascension 4', () => {
            const level = 90;
            const ascension = 4;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(90);
        });

        it('should return 80 for an input value of 80 and ascension 4', () => {
            const level = 80;
            const ascension = 4;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(80);
        });

        it('should return 80 for an input value of 1 and ascension 4', () => {
            const level = 1;
            const ascension = 4;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(80);
        });

        it('should return 80 for an input value of 90 and ascension 3', () => {
            const level = 90;
            const ascension = 3;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(80);
        });

        it('should return 80 for an input value of 80 and ascension 3', () => {
            const level = 80;
            const ascension = 3;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(80);
        });

        it('should return 75 for an input value of 75 (between 70 and 80) and ascension 3', () => {
            const level = 75;
            const ascension = 3;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(75);
        });

        it('should return 70 for an input value of 70 and ascension 3', () => {
            const level = 70;
            const ascension = 3;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(70);
        });

        it('should return 70 for an input value of 1 and ascension 3', () => {
            const level = 1;
            const ascension = 3;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(70);
        });

        it('should return 70 for an input value of 90 and ascension 2', () => {
            const level = 90;
            const ascension = 2;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(70);
        });

        it('should return 70 for an input value of 70 and ascension 2', () => {
            const level = 70;
            const ascension = 2;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(70);
        });

        it('should return 65 for an input value of 65 (between 60 and 70) and ascension 2', () => {
            const level = 65;
            const ascension = 2;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(65);
        });

        it('should return 60 for an input value of 60 and ascension 2', () => {
            const level = 60;
            const ascension = 2;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(60);
        });

        it('should return 60 for an input value of 1 and ascension 2', () => {
            const level = 1;
            const ascension = 2;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(60);
        });

        it('should return 60 for an input value of 90 and ascension 1', () => {
            const level = 90;
            const ascension = 1;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(60);
        });

        it('should return 60 for an input value of 60 and ascension 1', () => {
            const level = 60;
            const ascension = 1;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(60);
        });

        it('should return 55 for an input value of 55 (between 50 and 60) and ascension 1', () => {
            const level = 55;
            const ascension = 1;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(55);
        });

        it('should return 50 for an input value of 50 and ascension 1', () => {
            const level = 50;
            const ascension = 1;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(50);
        });

        it('should return 50 for an input value of 1 and ascension 1', () => {
            const level = 1;
            const ascension = 1;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(50);
        });

        it('should return 50 for an input value of 90 and ascension 0', () => {
            const level = 90;
            const ascension = 0;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(50);
        });

        it('should return 50 for an input value of 50 and ascension 0', () => {
            const level = 50;
            const ascension = 0;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(50);
        });

        it('should return 1 for an input value of 1 and ascension 0', () => {
            const level = 1;
            const ascension = 0;
            const testGameServant = Rarity5TestServant;
            const result = MasterServantUtils.roundToNearestValidLevel(ascension, level, testGameServant);
            expect(result).toStrictEqual(1);
        });

    });

});
