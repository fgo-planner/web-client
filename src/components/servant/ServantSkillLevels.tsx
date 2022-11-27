import { InstantiatedServantSkillLevel, InstantiatedServantSkillSet } from '@fgo-planner/data-core';
import { CSSInterpolation } from '@mui/material';
import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { AssetConstants } from '../../constants';
import { ComponentStyleProps, StyledFunctionPropsWithTheme } from '../../types';

type RootComponentProps = {
    condensed?: boolean;
};

type Props = RootComponentProps & {
    icon?: InstantiatedServantSkillSet | 'disabled';
    skills: Readonly<{
        1?: InstantiatedServantSkillLevel;
        2?: InstantiatedServantSkillLevel;
        3?: InstantiatedServantSkillLevel;
    }>;
} & Pick<ComponentStyleProps, 'className'>;

const EmptyCharacter = '\u2013';

const EmptyCharacterCondensed = '\u2014';

export const StyleClassPrefix = 'ServantSkillLevel';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'condensed'
);

const StyleOptions = {
    skipSx: true,
    skipVariantsResolver: true,
    shouldForwardProp
} as MuiStyledOptions;

const StyleProps = (props: RootComponentProps & StyledFunctionPropsWithTheme): CSSInterpolation => {

    const condensed = props.condensed;

    return {
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        [`& .${StyleClassPrefix}-icon`]: {
            width: '1.25em',
            marginRight: '0.25em'
        },
        [`& .${StyleClassPrefix}-level`]: {
            width: condensed ? '1.25em' : '1.5em'
        }
    } as CSSInterpolation;
};

const RootComponent = styled('div', StyleOptions)<RootComponentProps>(StyleProps);

export const ServantSkillLevel = React.memo((props: Props) => {

    const {
        condensed,
        icon,
        skills: {
            1: skill1,
            2: skill2,
            3: skill3
        }
    } = props;

    let iconNode: ReactNode;
    if (icon) {
        let src: string;
        if (icon === 'disabled') {
            src = AssetConstants.ServantDisabledSkillIconUrl;
        } else if (icon === 'appendSkills') {
            src = AssetConstants.ServantAppendSkillIconUrl;
        } else {
            src = AssetConstants.ServantActiveSkillIconUrl;
        }
        iconNode = (
            <img alt='' className={`${StyleClassPrefix}-icon`} src={src} />
        );
    }

    const emptyCharacter = condensed ? EmptyCharacterCondensed : EmptyCharacter;

    const className = clsx(
        `${StyleClassPrefix}-root`,
        props.className
    );

    return (
        <RootComponent className={className} condensed={condensed}>
            {iconNode}
            <div className={`${StyleClassPrefix}-level ${StyleClassPrefix}-skill1`}>
                {skill1 ?? emptyCharacter}
            </div>
            /
            <div className={`${StyleClassPrefix}-level ${StyleClassPrefix}-skill2`}>
                {skill2 ?? emptyCharacter}
            </div>
            /
            <div className={`${StyleClassPrefix}-level ${StyleClassPrefix}-skill3`}>
                {skill3 ?? emptyCharacter}
            </div>
        </RootComponent>
    );

});
