import React from 'react';
import { NavigationDrawerContent as Content } from '../../../types/internal';
import { NavigationDrawerContentSection } from './navigation-drawer-content-section.component';

type Props = {
    content: Content;
};

export const NavigationDrawerContent = React.memo(({ content }: Props) => (
    <>
        {content.sections.map((section, index) => (
            <NavigationDrawerContentSection
                key={section.key}
                section={section}
                hideDivider={!index}
            />
        ))}
    </>
));
