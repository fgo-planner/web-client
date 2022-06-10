import { GameServant, MasterServantAscensionLevel, MasterServantBondLevel, MasterServantNoblePhantasmLevel, MasterServantSkillLevel } from '@fgo-planner/types';
import { Options } from 'csv-parse';
import { parse } from 'csv-parse/sync';
import { parse as parseDate } from 'date-fns';
import { GameServantConstants } from '../../../constants';
import { GameServantList } from '../../../types/data';
import { Array2D, Immutable, MasterServantUpdateIndeterminate as Indeterminate, MasterServantUpdateIndeterminateValue as IndeterminateValue, MasterServantUpdateNew, ReadonlyRecord } from '../../../types/internal';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';
import { MathUtils } from '../../../utils/math.utils';
import { BaseMasterServantParser } from '../base-master-servant-parser';
import { MasterServantParserResult } from '../master-servant-parser-result.type';
import { FgoManagerColumnNames } from './fgo-manager-column-names';
import { FgoManagerColumn } from './fgo-manager-column.enum';

export class FgoManagerMasterServantParser extends BaseMasterServantParser<string> {

    private static readonly _LevelPrefix = 'Lv. ';

    private static readonly _NoblePhantasmLevelPrefix = 'NP';

    private static readonly _AcquisitionDateFormat = 'yyyy. MM. dd.';

    private static readonly _ParseOptions: Options = {
        delimiter: ',',
        skipEmptyLines: true
    };

    private readonly _servantNameMap: ReadonlyRecord<string, Immutable<GameServant>>;

    private _isParsing = false;

    private _parseResult?: MasterServantParserResult;

    private _currentRowNumber = 0;

    private _currentRowData?: Array<string>

    private _headerMap?: Record<FgoManagerColumn, number>;

    constructor(data: string, gameServants: GameServantList) {
        super(data);

        // TODO Move this to a helper method.
        const servantNameToGameIdMap: Record<string, Immutable<GameServant>> = {};
        for (const servant of gameServants) {
            const name = servant.metadata.fgoManagerName;
            if (!name) {
                continue;
            }
            servantNameToGameIdMap[name] = servant;
        }
        this._servantNameMap = servantNameToGameIdMap;
    }

    parse(): MasterServantParserResult {

        if (this._isParsing) {
            return {
                servantUpdates: [],
                errors: ['Parsing is already in progress for this parser.'],
                warnings: []
            };
        }

        this._isParsing = true;
        this._parseResult = {
            servantUpdates: [],
            errors: [],
            warnings: []
        };

        try {
            const data: Array2D<string> = parse(this._data, FgoManagerMasterServantParser._ParseOptions);
            /*
             * The header is on row 2, so if there are only 2 rows or less, then the data
             * does not contain any servants.
             */
            if (data.length < 3) {
                if (data.length < 2) {
                    // Header is missing
                    throw Error('Header is missing or invalid');
                }
            }
            this._parse(data);
        } catch (e: any) {
            this._parseResult.errors.push(typeof e === 'string' ? e : e.message);
        }

        const results = this._parseResult!;
        this._resetVariables();
        return results;
    }

    private _parse(data: Array2D<string>): void {
        const { servantUpdates, errors } = this._parseResult!;
        const headerData = data[this._currentRowNumber = 1]; // Header is on second row.
        this._headerMap = this._parseHeader(headerData);
        for (this._currentRowNumber = 2; this._currentRowNumber < data.length; this._currentRowNumber++) {
            this._currentRowData = data[this._currentRowNumber];
            try {
                const servant = this._parseCurrentRow();
                servantUpdates.push(servant);
            } catch (e: any) {
                const message: string = typeof e === 'string' ? e : e.message;
                errors.push(`${this._getCurrentRowLabel()} ${message}`);
            }
        }
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

    private _parseCurrentRow(): MasterServantUpdateNew {

        const gameServant = this._parseGameServant();
        const gameId = gameServant._id;
        const summonDate = this._parseSummonDate();
        const np = this._parseNoblePhantasm();
        const { level, ascension } = this._parseLevelAndAscension(gameServant);
        const bondLevel = this._parseBond();
        const fouHp = this._parseFou('FouHp');
        const fouAtk = this._parseFou('FouAtk');
        const skill1 = this._parseSkill(1, false);
        const skill2 = this._parseSkill(2, true);
        const skill3 = this._parseSkill(3, true);

        return {
            isNewServant: true,
            gameId,
            summoned: true,
            summonDate,
            np,
            level,
            ascension,
            fouHp,
            fouAtk,
            skills: {
                1: skill1,
                2: skill2,
                3: skill3
            },
            appendSkills: {},
            bondLevel
        };
    }

    private _parseGameServant(): Immutable<GameServant> {
        const value = this._parseDataFromCurrentRow(FgoManagerColumn.ServantName);
        if (!value) {
            throw Error('Servant name is missing, row will be skipped.');
        }
        const result = this._servantNameMap[value];
        if (result === undefined) {
            throw Error(`Data for servant name '${value}' could not be found, row will be skipped.`);
        }
        return result;
    }

    private _parseNoblePhantasm(): MasterServantNoblePhantasmLevel | Indeterminate {
        const value = this._parseDataFromCurrentRow(FgoManagerColumn.NoblePhantasmLevel);
        if (!value) {
            return IndeterminateValue;
        }
        const cleanValue = value.substring(FgoManagerMasterServantParser._NoblePhantasmLevelPrefix.length);
        let result = Number(cleanValue);
        if (isNaN(result)) {
            this._parseResult!.warnings.push(`${this._getCurrentRowLabel()} '${value}' is not a NP level value.`);
            return IndeterminateValue;
        }
        result = ~~MathUtils.clamp(result, GameServantConstants.MinNoblePhantasmLevel, GameServantConstants.MaxNoblePhantasmLevel);
        return result as MasterServantNoblePhantasmLevel;
    }

    private _parseLevelAndAscension(gameServant: Immutable<GameServant>): {
        level: number | Indeterminate;
        ascension: MasterServantAscensionLevel | Indeterminate;
    } {
        const column = FgoManagerColumn.Level;
        const value = this._parseDataFromCurrentRow(column);
        if (!value) {
            return {
                level: IndeterminateValue,
                ascension: IndeterminateValue
            };
        }
        const cleanValue = value.substring(FgoManagerMasterServantParser._LevelPrefix.length);
        let level = Number(cleanValue);
        if (isNaN(level)) {
            this._parseResult!.warnings.push(`${this._getCurrentRowAndColumnLabel(column)} '${value}' is not a valid value.`);
            return {
                level: IndeterminateValue,
                ascension: IndeterminateValue
            };
        }
        level = ~~MathUtils.clamp(level, GameServantConstants.MinLevel, GameServantConstants.MaxLevel);
        const ascension = MasterServantUtils.roundToNearestValidAscensionLevel(level, 0, gameServant);
        return { level, ascension };
    }

    private _parseBond(): MasterServantBondLevel | Indeterminate {
        const column = FgoManagerColumn.BondLevel;
        const value = this._parseDataFromCurrentRow(column);
        if (!value) {
            return IndeterminateValue;
        }
        let result = Number(value);
        if (isNaN(result)) {
            this._parseResult!.warnings.push(`${this._getCurrentRowAndColumnLabel(column)} '${value}' is not a valid number.`);
            return IndeterminateValue;
        }
        result = ~~MathUtils.clamp(result, GameServantConstants.MinBondLevel, GameServantConstants.MaxBondLevel);
        return result as MasterServantBondLevel;
    }

    private _parseFou(stat: 'FouHp' | 'FouAtk'): number | Indeterminate {
        const column = FgoManagerColumn[stat];
        const value = this._parseDataFromCurrentRow(column);
        if (!value) {
            return IndeterminateValue;
        }
        let result = Number(value);
        if (isNaN(result)) {
            this._parseResult!.warnings.push(`${this._getCurrentRowAndColumnLabel(column)} '${value}' is not a valid number.`);
            return IndeterminateValue;
        }
        result = MasterServantUtils.roundToNearestValidFouValue(result);
        return result;
    }

    private _parseSkill(skill: 1 | 2 | 3, canBeUndefined: false): MasterServantSkillLevel | Indeterminate;
    private _parseSkill(skill: 1 | 2 | 3, canBeUndefined: true): MasterServantSkillLevel | undefined;
    private _parseSkill(skill: 1 | 2 | 3, canBeUndefined: boolean): MasterServantSkillLevel | undefined | Indeterminate {
        const path = `SkillLevel${skill}` as keyof typeof FgoManagerColumn;
        const column = FgoManagerColumn[path];
        const value = this._parseDataFromCurrentRow(column);
        if (!value) {
            return canBeUndefined ? undefined : IndeterminateValue;
        }
        let result = Number(value);
        if (result === 0) {
            return canBeUndefined ? undefined : IndeterminateValue;
        }
        if (isNaN(result)) {
            this._parseResult!.warnings.push(`${this._getCurrentRowAndColumnLabel(column)} '${value}' is not a valid number.`);
            return canBeUndefined ? undefined : IndeterminateValue;
        }
        result = ~~MathUtils.clamp(result, GameServantConstants.MinSkillLevel, GameServantConstants.MaxSkillLevel);
        return result as MasterServantSkillLevel;
    }

    private _parseSummonDate(): number | Indeterminate {
        const column = FgoManagerColumn.AcquisitionDate;
        const value = this._parseDataFromCurrentRow(column);
        if (!value) {
            return IndeterminateValue;
        }
        try {
            const date = parseDate(value, FgoManagerMasterServantParser._AcquisitionDateFormat, new Date(0));
            return date.getTime();
        } catch (e) {
            console.error(e);
            this._parseResult!.warnings.push(`${this._getCurrentRowAndColumnLabel(column)} Date value '${value}' could not be parsed.`);
            return IndeterminateValue;
        }
    }

    private _parseDataFromCurrentRow(column: FgoManagerColumn): string | undefined {
        const columnIndex = this._headerMap![column];
        return this._currentRowData![columnIndex];
    }

    private _getCurrentRowLabel(): string {
        return `Row ${this._currentRowNumber}:`;
    }

    private _getCurrentRowAndColumnLabel(column: FgoManagerColumn): string {
        return `Row ${this._currentRowNumber}, column ${FgoManagerColumnNames[column]}:`;
    }

    private _resetVariables(): void {
        this._isParsing = false;
        this._parseResult = undefined;
        this._currentRowNumber = 0;
        this._currentRowData = undefined;
        this._headerMap = undefined;
    }



}
