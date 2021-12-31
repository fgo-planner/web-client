import { SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { PropsWithChildren, ReactNode, useMemo } from 'react';
import { ComponentStyleProps } from '../../types/internal/props/component-style-props.type';
import { StyleUtils } from '../../utils/style.utils';
import { LayoutPanelContainer } from './layout-panel-container.component';

type Props = PropsWithChildren<{
    headerContents?: ReactNode;
    footerContents?: ReactNode;
    headerBorder?: boolean;
    footerBorder?: boolean;
    autoHeight?: boolean;
}> & ComponentStyleProps;

export const StyleClassPrefix = 'LayoutPanelScrollable';

const StyleProps = {
    display: 'flex',
    flexDirection: 'column',
    [`& .${StyleClassPrefix}-container`]: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    [`& .${StyleClassPrefix}-header.border`]: {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider'
    },
    [`& .${StyleClassPrefix}-children-container`]: {
        overflow: 'auto',
        height: '100%'
    },
    [`& .${StyleClassPrefix}-footer.border`]: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: 'divider'
    }
} as SystemStyleObject<Theme>;

export const LayoutPanelScrollable = React.memo((props: Props) => {

    const {
        children,
        headerContents,
        footerContents,
        headerBorder,
        footerBorder,
        autoHeight,
        className,
        style,
        sx
    } = props;

    const sxProps = useMemo(() => StyleUtils.mergeSxProps(StyleProps, sx), [sx]);

    return (
        <LayoutPanelContainer
            className={clsx(`${StyleClassPrefix}-root`, className)}
            style={style}
            sx={sxProps}
            autoHeight={autoHeight}
        >
            <div className={`${StyleClassPrefix}-container`}>
                {headerContents &&
                    <div className={clsx(`${StyleClassPrefix}-header`, headerBorder && 'border')}>
                        {headerContents}
                    </div>
                }
                <div className={`${StyleClassPrefix}-children-container`}>
                    {children}
                </div>
                {footerContents &&
                    <div className={clsx(`${StyleClassPrefix}-footer`, footerBorder && 'border')}>
                        {footerContents}
                    </div>
                }
            </div>
        </LayoutPanelContainer>
    );
    
});
