import { Options } from 'csv-parse';
import parse from 'csv-parse/lib/sync';
import { GameServantConstants } from '../../../constants';
import { GameServant, MasterServant, MasterServantBondLevel, MasterServantNoblePhantasmLevel, ReadonlyRecord } from '../../../types';
import { MasterServantSkillLevel } from '../../../types/data/master/servant/master-servant-skill-level.type';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';
import { MathUtils } from '../../../utils/math.utils';
import { BaseMasterServantParser } from '../base-master-servant-parser';
import { MasterServantParserResult } from '../master-servant-parser-result.type';
import { FgoManagerColumnNames } from './fgo-manager-column-names';
import { FgoManagerColumn } from './fgo-manager-column.enum';

export class FgoManagerMasterServantParser extends BaseMasterServantParser<string> {

    private static readonly _LevelPrefix = 'Lv. ';

    private static readonly _NoblePhantasmLevelPrefix = 'NP';

    private static readonly _ParseOptions: Options = {
        delimiter: ',',
        skipEmptyLines: true
    };

    private _servantNameMap: ReadonlyRecord<string, GameServant>;

    constructor(data: string, gameServants: ReadonlyArray<Readonly<GameServant>>) {
        super(data);

        // TODO Move this to a helper method.
        const servantNameToGameIdMap: Record<string, GameServant> = {};
        for (const servant of gameServants) {
            const name = servant.metadata.fgoManagerName;
            if (!name) {
                continue;
            }
            servantNameToGameIdMap[name] = servant;
        }
        this._servantNameMap = servantNameToGameIdMap;
    }

    parse(startInstanceId: number): MasterServantParserResult {
        const results: MasterServantParserResult = {
            masterServants: [],
            bondLevels: {},
            errors: [],
            warnings: []
        };
        try {
            const data: string[][] = parse(this._data, FgoManagerMasterServantParser._ParseOptions);
            /*
             * The header is on row 2, so if there are only 2 rows or less, then the data
             * does not contain any servants.
             */
            if (data.length < 3) {
                if (data.length < 2) {
                    // Header is missing
                    results.errors.push('Invalid data');
                }
                return results;
            }
            this._parse(results, data, startInstanceId);
        } catch (e) {
            results.errors.push(typeof e === 'string' ? e : e.message);
        }
        return results;
    }

    private _parse(results: MasterServantParserResult, data: string[][], startInstanceId: number): MasterServantParserResult {
        const headerData = data[1]; // Header is on second row.
        const headerMap = this._parseHeader(headerData);
        const bondLevels = results.bondLevels;
        let instanceId = startInstanceId;
        for (let r = 2, length = data.length; r < length; r++) {
            const row = data[r];
            try {
                const masterServant = this._parseRow(row, headerMap, instanceId++, bondLevels);
                results.masterServants.push(masterServant);
            } catch (e) {
                const message: string = typeof e === 'string' ? e : e.message;
                results.warnings.push(`Row ${r + 1}: ${message}`);
            }
        }
        
        return results;
    }

    private _parseHeader(headerData: string[]): Record<FgoManagerColumn, number> {
        const result: Partial<Record<FgoManagerColumn, number>> = {};
        let key: any;
        for (key in FgoManagerColumnNames) {
            const column = key as FgoManagerColumn;
            const columnName = FgoManagerColumnNames[column];
            result[column] = this._findColumnInHeader(headerData, columnName);
        }
        return result as Record<FgoManagerColumn, number>;
    }

    private _findColumnInHeader(headerData: string[], columnName: string): number {
        for (let i = 0, length = headerData.length; i < length; i++) {
            if (headerData[i] === columnName) {
                return i;
            }
        }
        throw Error(`Column '${columnName} could not be found.`);
    }

    private _parseRow(
        row: string[],
        headerMap: Record<FgoManagerColumn, number>,
        instanceId: number,
        bondLevels: Record<number, MasterServantBondLevel>
    ): MasterServant {

        const gameServant = this._parseGameServant(row, headerMap);
        const gameId = gameServant._id;
        const np = this._parseNoblePhantasmLevel(row, headerMap);
        const level = this._parseLevel(row, headerMap);
        const ascension = MasterServantUtils.roundToNearestValidAscensionLevel(level, 0, gameServant);
        const bond = this._parseBondLevel(row, headerMap);
        const fouHp = this._parseFouValue(row, headerMap, 'FouHp');
        const fouAtk = this._parseFouValue(row, headerMap, 'FouAtk');
        const skill1 = this._parseSkillLevel(row, headerMap, 1) || 1;
        const skill2 = this._parseSkillLevel(row, headerMap, 2);
        const skill3 = this._parseSkillLevel(row, headerMap, 3);

        if (bond !== undefined) {
            bondLevels[gameId] = bond;
        }

        return {
            instanceId,
            gameId,
            np,
            level,
            ascension,
            fouHp,
            fouAtk,
            skills: {
                1: skill1 as MasterServantSkillLevel,
                2: skill2 as MasterServantSkillLevel,
                3: skill3 as MasterServantSkillLevel
            },
            appendSkills: {}
        };
    }

    private _parseGameServant(row: string[], headerMap: Record<FgoManagerColumn, number>): GameServant {
        const value = this._parseDataFromRow(row, headerMap, FgoManagerColumn.ServantName);
        if (!value) {
            throw Error('Servant name is missing.');
        }
        const result = this._servantNameMap[value];
        if (result === undefined) {
            throw Error(`Servant name '${value}' could not be found.`);
        }
        return result;
    }

    private _parseNoblePhantasmLevel(row: string[], headerMap: Record<FgoManagerColumn, number>): MasterServantNoblePhantasmLevel {
        const value = this._parseDataFromRow(row, headerMap, FgoManagerColumn.NoblePhantasmLevel);
        if (!value) {
            return 1;
        }
        const cleanValue = value.substr(FgoManagerMasterServantParser._NoblePhantasmLevelPrefix.length);
        let result = Number(cleanValue);
        if (isNaN(result)) {
            throw Error(`'${value}' is not a NP level value.`);
        }
        result = ~~MathUtils.clamp(result, GameServantConstants.MinNoblePhantasmLevel, GameServantConstants.MaxNoblePhantasmLevel);
        return result as MasterServantNoblePhantasmLevel;
    }
    
    private _parseLevel(row: string[], headerMap: Record<FgoManagerColumn, number>): number {
        const value = this._parseDataFromRow(row, headerMap, FgoManagerColumn.Level);
        if (!value) {
            return 1;
        }
        const cleanValue = value.substr(FgoManagerMasterServantParser._LevelPrefix.length);
        let result = Number(cleanValue);
        if (isNaN(result)) {
            throw Error(`'${value}' is not a valid level value.`);
        }
        result = ~~MathUtils.clamp(result, GameServantConstants.MinLevel, GameServantConstants.MaxLevel);
        return result;
    }

    private _parseBondLevel(row: string[], headerMap: Record<FgoManagerColumn, number>): MasterServantBondLevel | undefined {
        const value = this._parseDataFromRow(row, headerMap, FgoManagerColumn.BondLevel);
        if (!value) {
            return undefined;
        }
        let result = Number(value);
        if (isNaN(result)) {
            throw Error(`Bond level '${value}' is not a valid number.`);
        }
        result = ~~MathUtils.clamp(result, GameServantConstants.MinBondLevel, GameServantConstants.MaxBondLevel);
        return result as MasterServantBondLevel;
    }

    private _parseFouValue(row: string[], headerMap: Record<FgoManagerColumn, number>, stat: 'FouHp' | 'FouAtk'): number | undefined {
        const value = this._parseDataFromRow(row, headerMap, FgoManagerColumn[stat]);
        if (!value) {
            return undefined;
        }
        let result = Number(value);
        if (isNaN(result)) {
            throw Error(`${stat} value '${value}' is not a valid number.`);
        }
        result = MasterServantUtils.roundToNearestValidFouValue(result);
        return result;
    }

    private _parseSkillLevel(row: string[], headerMap: Record<FgoManagerColumn, number>, skill: 1 | 2 | 3): number | undefined {
        const path = `SkillLevel${skill}` as keyof typeof FgoManagerColumn;
        const value = this._parseDataFromRow(row, headerMap, FgoManagerColumn[path]);
        if (!value) {
            return undefined;
        }
        let result = Number(value);
        if (result === 0) {
            return undefined;
        }
        if (isNaN(result)) {
            throw Error(`Skill ${skill} level '${value}' is not a valid number.`);
        }
        result = ~~MathUtils.clamp(result, GameServantConstants.MinSkillLevel, GameServantConstants.MaxSkillLevel);
        return result;
    }

    private _parseDataFromRow(row: string[], headerMap: Record<FgoManagerColumn, number>, column: FgoManagerColumn): string | undefined {
        const columnIndex = headerMap[column];
        return row[columnIndex];
    }

}
