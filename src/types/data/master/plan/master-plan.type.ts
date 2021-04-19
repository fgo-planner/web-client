import { Entity } from '../../entity.type';
import { MasterItem } from '../item/master-item.type';
import { MasterPlanServant } from './master-plan-servant.type';

export type MasterPlan = Entity<string> & {

    accountId: string;

    name: string;

    description: string;

    targetDate?: Date;

    autoUpdate: boolean;

    shared: boolean;

    servants: MasterPlanServant[];

    inventory: {

        items: MasterItem[];
    
        qp: number;
    
        // TODO Add embers and fous
    
    };

};
