import React, { DetailedHTMLProps, MetaHTMLAttributes, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageMetadata as PageMetadataType } from '../../types/internal';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic';

type HelmetMetaProp = DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>[];

const DefaultTitle = 'FGO Servant Planner';

const generateMeta = (metadata: PageMetadataType): HelmetMetaProp => {
    const meta: HelmetMetaProp = [];
    if (metadata.themeColor) {
        meta.push({
            name: 'theme-color',
            content: metadata.themeColor
        });
    }
    return meta;
};

/**
 * Listens for changes from the `UserInterface_MetadataChange` topic and updates the
 * page metadata (in the HTML `head` tag) accordingly.
 */
export const PageMetadata = React.memo(() => {

    const [ metadata, setMetadata ] = useState<PageMetadataType>({});

    useEffect(() => {
        const onMetadataChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopic.UserInterface_MetadataChange)
            .subscribe(setMetadata);
            
        return () => onMetadataChangeSubscription.unsubscribe();
    }, []);

    return (
        <Helmet 
            title={metadata.title ?? DefaultTitle}
            meta={generateMeta(metadata)}
        />
    );

});
