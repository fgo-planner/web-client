import { Immutable } from '../types/internal';

export class DateTimeUtils {

    static cloneDate(date: Date | Immutable<Date> | undefined): Date | undefined {
        return date ? new Date(date as Date) : undefined;
    }

}
