import { SortDirection } from './sort-direction.type';

export type SortOptions<T extends string = string> = {
    sort?: T;
    direction: SortDirection;
};
