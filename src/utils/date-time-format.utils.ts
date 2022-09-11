import { Immutable, Nullable } from '@fgo-planner/common-core';
import { format } from 'date-fns';

export class DateTimeFormatUtils {

    // static readonly DataTableFormat = 'MMM dd, yyyy hh:mm:ss a';
    static readonly DataTableFormat = 'yyyy-MM-dd hh:mm:ss a';

    private constructor () {
        
    }

    static formatForDataTable(date: Nullable<number | Immutable<Date>>): string {
        if (date == null) {
            return '';
        }
        return format(date as number | Date, this.DataTableFormat);
    }

}
