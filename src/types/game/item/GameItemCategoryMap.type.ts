import { ReadonlyRecord } from '@fgo-planner/common-core';
import { GameItemCategory } from './GameItemCategory.enum';

export type GameItemCategoryMap = ReadonlyRecord<GameItemCategory, ReadonlySet<number>>;
