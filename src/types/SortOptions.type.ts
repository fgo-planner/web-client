import { SortDirection } from './SortDirection.type';

export type SortOptions<T extends string> = {
    sort?: T;
    direction: SortDirection;
};
