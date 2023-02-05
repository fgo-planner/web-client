import { NumberFormatUtils } from '../../../../utils/format/NumberFormatUtils';

type FormattedCellValue = {
    title: string | undefined;
    value: string | undefined;
};

const formatCellValue = (quantity: number | undefined, defaultValue: string | undefined = undefined): FormattedCellValue => {
    let title, value: string | undefined;
    if (!quantity) {
        value = defaultValue;
    } else if (quantity < 1_000) {
        value = String(quantity);
    } else {
        value = NumberFormatUtils.formatQuantityShort(quantity);
        title = NumberFormatUtils.formatQuantity(quantity);
    }
    return { title, value };
};

export const PlanRequirementsTableUtils = {
    formatCellValue
} as const;
