export type Pagination = {

    /**
     * The page number.
     */
    page: number;

    /**
     * The number of elements on the page.
     */
    size: number;

    /**
     * The field or property that the elements are sorted by.
     */
    sort?: string;

    /**
     * The sort direction.
     */
    direction: 'ASC' | 'DESC';

    /**
     * The total number of elements available.
     */
    total?: number;
    
};