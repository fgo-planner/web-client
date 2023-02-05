export type Page<T> = {

    /**
     * The page elements.
     */
    data: Array<T>;

    /**
     * The total number of elements.
     */
    total: number;

    /**
     * The page number.
     */
    page: number;

    /**
     * The page size.
     */
    size: number;
    
};
