import React, { DetailedHTMLProps, MetaHTMLAttributes, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageMetadata as PageMetadataType, PageMetadataService } from '../../services/user-interface/page-metadata.service';

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
 * Listens for changes from the `PageMetadataService` and updates the page
 * metadata (in the HTML `head` tag) accordingly.
 */
export const PageMetadata = React.memo(() => {
    const [ metadata, setMetadata ] = useState<PageMetadataType>();

    useEffect(() => {
        const onMetadataChangeSubscription = PageMetadataService.onMetadataChange
            .subscribe(setMetadata);
            
        return () => onMetadataChangeSubscription.unsubscribe();
    }, []);

    if (!metadata) {
        return null;
    }

    return (
        <Helmet 
            title={metadata.title ?? DefaultTitle}
            meta={generateMeta(metadata)}
        />
    );
});
