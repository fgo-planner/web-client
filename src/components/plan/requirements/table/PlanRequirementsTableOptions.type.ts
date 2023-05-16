import { PlanRequirementsTableCellSize } from './PlanRequirementsTableCellSize.enum';
import { PlanRequirementsTableServantRowHeaderLayout } from './PlanRequirementsTableServantRowHeaderLayout.enum';

export type PlanRequirementsTableOptions = {

    layout: {
        cells: PlanRequirementsTableCellSize;
        rowHeader: PlanRequirementsTableServantRowHeaderLayout;
    }

    displayItems: {
        empty?: boolean;
        statues?: boolean;
        gems?: boolean;
        lores?: boolean;
        grails?: boolean;
        embers?: boolean;
        fous?: boolean;
        qp?: boolean;
    }

    displayZeroValues?: boolean;

};
