export type PlanRequirementsTableOptions = {

    layout: {
        cells: 'condensed' | 'normal';
        rowHeader: 'name' | 'targets' | 'toggle';
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
