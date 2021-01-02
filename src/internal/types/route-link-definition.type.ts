import { MouseEventHandler } from 'react';

export type RouteLinkDefinition = {
    readonly label: string;
    readonly route?: string;
    readonly exact?: boolean;
    readonly onClick?: MouseEventHandler;
};

export type RouteLinkDefinitions = ReadonlyArray<RouteLinkDefinition>;