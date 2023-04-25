export type VirtualListState<T> = {
    data: ReadonlyArray<T>;
    rowHeight: number;
    startIndex: number;
    visibleRowsCount: number;
};
