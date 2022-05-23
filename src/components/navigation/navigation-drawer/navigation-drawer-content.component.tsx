import React from 'react';
import { NavigationDrawerContent as Content, Supplier } from '../../../types/internal';
import { NavigationDrawerContentSection } from './navigation-drawer-content-section.component';

type Props = {
    content: Content;
    expanded?: boolean;
    mobileView?: boolean;
    onClose: Supplier<void>;
};

export const NavigationDrawerContent = React.memo((props: Props) => {

    const {
        content: {
            sections
        },
        expanded,
        mobileView,
        onClose
    } = props;

    const sectionNodes = sections.map((section, index) => (
        <NavigationDrawerContentSection
            key={section.key}
            section={section}
            onClose={onClose}
            mobileView={mobileView}
            expanded={expanded}
            hideDivider={!index}
        />
    ));

    return <>{sectionNodes}</>;

});
