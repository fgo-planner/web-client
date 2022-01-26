export type PlanRequirementsTableOptions = {

    layout: {
        cells: 'condensed' | 'normal';
        stickyColumn: 'condensed' | 'normal';
    }

    displayItems: {
        unused?: boolean;
        statues?: boolean;
        gems?: boolean;
        lores?: boolean;
        grails?: boolean;
        embers?: boolean;
        fous?: boolean;
    }

};
