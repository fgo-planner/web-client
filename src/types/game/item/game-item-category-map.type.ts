import { ReadonlyRecord } from '@fgo-planner/common-core';
import { GameItemCategory } from './game-item-category.enum';

export type GameItemCategoryMap = ReadonlyRecord<GameItemCategory, ReadonlySet<number>>;
