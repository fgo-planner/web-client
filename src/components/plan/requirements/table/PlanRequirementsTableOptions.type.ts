export type PlanRequirementsTableOptions = {

    layout: {
        cells: 'condensed' | 'normal';
        stickyColumn: 'condensed' | 'normal';
    }

    displayItems: {
        empty?: boolean;
        statues?: boolean;
        gems?: boolean;
        lores?: boolean;
        grails?: boolean;
        embers?: boolean;
        fous?: boolean;
    }

    displayZeroValues?: boolean;

};
