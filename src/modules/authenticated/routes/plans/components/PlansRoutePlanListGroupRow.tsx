import { Immutable } from '@fgo-planner/common-core';
import { PlanGroupAggregatedData } from '@fgo-planner/data-core';
import React, { MouseEvent, PropsWithChildren, ReactNode, useCallback } from 'react';
import { DataTableListRow } from '../../../../../components/data-table-list/DataTableListRow';
import { IconOutlined } from '../../../../../components/icons/IconOutlined';
import { TruncateText } from '../../../../../components/text/TruncateText';
import { PlanConstants } from '../../../../../constants';
import { DateTimeFormatUtils } from '../../../../../utils/format/DateTimeFormatUtils';
import { PlansRoutePlanListColumn } from './PlansRoutePlanListColumn';

export type PlanGroupItem = Immutable<PlanGroupAggregatedData> | typeof PlanConstants.UngroupedGroupId;

type Props = PropsWithChildren<{
    active?: boolean;
    expanded: boolean;
    planGroup: PlanGroupItem;
    visibleColumns: Readonly<PlansRoutePlanListColumn.Visibility>;
    onContextMenu(event: MouseEvent, planGroup: PlanGroupItem): void;
    onExpandToggle(event: MouseEvent, planGroup: PlanGroupItem): void;
    onSelect(event: MouseEvent, planGroup: PlanGroupItem): void;
}>;

type RowText = {
    name: ReactNode;
    createdAt: string | undefined;
    updatedAt: string | undefined;
    description: string;
};

export const StyleClassPrefix = 'PlansRoutePlanListGroupRow';

export const PlansRoutePlanListGroupRow = React.memo((props: Props) => {

    const {
        active,
        expanded,
        planGroup,
        visibleColumns,
        onContextMenu,
        onExpandToggle,
        onSelect,
        children
    } = props;

    const handleClick = useCallback((event: MouseEvent): void => {
        onSelect(event, planGroup);
    }, [planGroup, onSelect]);

    const handleContextMenu = useCallback((event: MouseEvent): void => {
        onContextMenu(event, planGroup);
    }, [planGroup, onContextMenu]);

    const handleDoubleClick = useCallback((event: MouseEvent): void => {
        onExpandToggle(event, planGroup);
        onSelect(event, planGroup);
        event.stopPropagation();
    }, [planGroup, onExpandToggle, onSelect]);

    const handleExpandToggle = useCallback((event: MouseEvent): void => {
        onExpandToggle(event, planGroup);
        event.stopPropagation();
    }, [planGroup, onExpandToggle]);

    let name, createdAt, updatedAt, descriptionString;
    if (planGroup === PlanConstants.UngroupedGroupId) {
        name = <i>{PlanConstants.UngroupedGroupName}</i>;
    } else {
        name = planGroup.name || <i>{PlanConstants.MissingNamePlaceholder}</i>;
        createdAt = planGroup.createdAt;
        updatedAt = planGroup.updatedAt;
        descriptionString = planGroup.description || '-';
    }

    return <>
        <DataTableListRow
            className={`${StyleClassPrefix}-root`}
            borderBottom
            active={active}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onDoubleClick={handleDoubleClick}
        >
            <div className={`${StyleClassPrefix}-icon`} onClick={handleExpandToggle}>
                <IconOutlined onClick={handleExpandToggle}>
                    {expanded ? 'expand_less' : 'expand_more'}
                </IconOutlined>
            </div>
            <TruncateText className={`${StyleClassPrefix}-name`}>
                <div className={`${StyleClassPrefix}-text`}>
                    {name}
                </div>
            </TruncateText>
            {visibleColumns.created &&
                <div className={`${StyleClassPrefix}-created`}>
                    <div className={`${StyleClassPrefix}-text`}>
                        {DateTimeFormatUtils.formatForDataTable(createdAt)}
                    </div>
                </div>
            }
            {visibleColumns.modified &&
                <div className={`${StyleClassPrefix}-modified`}>
                    <div className={`${StyleClassPrefix}-text`}>
                        {DateTimeFormatUtils.formatForDataTable(updatedAt)}
                    </div>
                </div>
            }
            {visibleColumns.description &&
                <TruncateText className={`${StyleClassPrefix}-description`}>
                    <div className={`${StyleClassPrefix}-text`}>
                        {descriptionString}
                    </div>
                </TruncateText>
            }
        </DataTableListRow>
        {children}
    </>;

});
