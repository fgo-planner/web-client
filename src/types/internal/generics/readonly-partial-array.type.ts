import { ReadonlyPartial } from './readonly-partial.type';

export type ReadonlyPartialArray<T> = ReadonlyArray<ReadonlyPartial<T>>;
