import React from 'react';
import { NavigationDrawerContent as Content } from '../../../types';
import { NavigationDrawerContentSection } from './navigation-drawer-content-section.component';

type Props = {
    content: Content;
};

export const NavigationDrawerContent = React.memo(({ content: { sections } }: Props) => (
    <>
        {sections.map((section, index) => (
            <NavigationDrawerContentSection
                key={section.key}
                section={section}
                isLastSection={index === sections.length - 1}
            />
        ))}
    </>
));
