import { MasterServantParserResult } from './master-servant-parser-result.type';

export abstract class BaseMasterServantParser<T> {
    
    constructor(protected _data: T) {

    }

    abstract parse(startInstanceId: number): MasterServantParserResult;

}
