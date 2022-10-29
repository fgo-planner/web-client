import { Nullable, ReadonlyDate } from '@fgo-planner/common-core';
import { format } from 'date-fns';

type AnyDate = Date | ReadonlyDate;

export class DateTimeFormatUtils {

    // static readonly DataTableFormat = 'MMM dd, yyyy hh:mm:ss a';
    static readonly DataTableFormat = 'yyyy-MM-dd hh:mm:ss a';

    static readonly SummonDateFormat = 'yyyy-MM-dd';

    private constructor () {
        
    }

    static formatForDataTable(date: Nullable<AnyDate | number>): string {
        if (date == null) {
            return '';
        }
        return format(date as number | Date, this.DataTableFormat);
    }

    static formatSummonDate(date: Nullable<AnyDate | number>): string {
        if (date == null) {
            return '';
        }
        return format(date as number | Date, this.SummonDateFormat);
    }

}
