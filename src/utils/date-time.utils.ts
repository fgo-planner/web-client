import { Immutable } from '../types/internal';

export class DateTimeUtils {

    static cloneDate(date: Date | Immutable<Date> | undefined): Date | undefined {
        return date ? new Date(date as Date) : undefined;
    }

    static truncateToDays(date: Date | number): Date {
        const result = new Date(date);
        // TODO Maybe use a library for this.
        result.setUTCHours(0);
        result.setUTCMinutes(0);
        result.setUTCSeconds(0);
        result.setUTCMilliseconds(0);
        return result;
    }

}
