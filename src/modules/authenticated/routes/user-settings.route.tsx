import React from 'react';
import { LayoutPanelContainer } from '../../../components/layout/layout-panel-container.component';

export const UserSettingsRoute = React.memo(() => {
    const body = (
        <div className="px-4">
            <div> asdf </div>
            <div> asdf </div>
            <div> asdf </div>
        </div>
    );
    return (
        <div className="flex align-stretch" style={{width: '100vw'}}>
            <LayoutPanelContainer className="m-2">
                {body}
            </LayoutPanelContainer>
            <LayoutPanelContainer >
                {body}
            </LayoutPanelContainer>
        </div>
    );
});

