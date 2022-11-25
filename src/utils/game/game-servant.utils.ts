import { Immutable } from '@fgo-planner/common-core';
import { GameServant, GameServantClass, GameServantConstants, GameServantRarity } from '@fgo-planner/data-core';
import { GameServantClassSimplified, GameServantList } from '../../types';

export class GameServantUtils {

    private constructor () {
        
    }

    static getDisplayedName(servant: Immutable<GameServant>): string {
        return servant.metadata?.displayName || servant.name || String(servant._id);
    }

    static convertToSimplifiedClass(servantClass: GameServantClass): GameServantClassSimplified {
        switch (servantClass) {
            case GameServantClass.Saber:
                return GameServantClassSimplified.Saber;
            case GameServantClass.Archer:
                return GameServantClassSimplified.Archer;
            case GameServantClass.Lancer:
                return GameServantClassSimplified.Lancer;
            case GameServantClass.Rider:
                return GameServantClassSimplified.Rider;
            case GameServantClass.Caster:
                return GameServantClassSimplified.Caster;
            case GameServantClass.Assassin:
                return GameServantClassSimplified.Assassin;
            case GameServantClass.Berserker:
                return GameServantClassSimplified.Berserker;
            default:
                return GameServantClassSimplified.Extra;
        }
    }

    static parseClass(string: string, ignoreCase = true): GameServantClass | undefined {
        if (ignoreCase) {
            string = string.toLowerCase();
        }
        for (const servantClass of Object.keys(GameServantClass)) {
            if ((ignoreCase && servantClass.toLowerCase() !== string) || (!ignoreCase && string !== servantClass)) {
                continue;
            }
            return servantClass as GameServantClass;
        }
        return undefined;
    }

    static filterServants(search: string, servants: GameServantList): GameServantList;

    static filterServants<T>(search: string, data: ReadonlyArray<T>, mappingFunction: (elem: T) => Immutable<GameServant>): Array<T>;

    static filterServants<T>(search: string, data: ReadonlyArray<T>, mappingFunction?: (elem: T) => Immutable<GameServant>): Array<T> {
        const searchTrimmed = search.trim();
        if (!searchTrimmed) {
            return [...data];
        }

        let classes = new Set<GameServantClass>();
        let rarities = new Set<GameServantRarity>();

        const searchTerms = searchTrimmed.split(/\s+/).filter(value => {
            /*
             * Rarity filters. Only filters by rarity if the input is valid. Otherwise, it
             * will just act as another search term.
             */
            if (value.length === 2 && value.charAt(1) === '*') {
                const rarity = Number(value.charAt(0));
                if (!isNaN(rarity) && rarity >= GameServantConstants.MinRarity && rarity <= GameServantConstants.MaxRarity) {
                    rarities.add(rarity as GameServantRarity);
                    return false;
                }
                return true;
            }
            /*
             * Servant class filters. Only filters by class if the input is a valid class.
             * Otherwise, it will just act as another search term.
             */
            const servantClass = this.parseClass(value);
            if (!!servantClass) {
                classes.add(servantClass);
                return false;
            }
            return true;
        });

        return data.filter(elem => {
            let servant: Immutable<GameServant>;
            if (mappingFunction) {
                servant = mappingFunction(elem);
            } else {
                servant = elem as any;
            }
            return this._filterServant(servant, searchTerms, classes, rarities);
        });
    }

    private static _filterServant(
        servant: Immutable<GameServant>,
        searchTerms: Array<string>,
        classes: Set<GameServantClass>,
        rarities: Set<GameServantRarity>
    ): boolean {
        /*
         * Rarity and class filters are only applied if at least one value is given.
         */
        if (classes.size && !classes.has(servant.class)) {
            return false;
        }
        if (rarities.size && !rarities.has(servant.rarity)) {
            return false;
        }
        /*
         * If there are no generic search terms, but at least one class or rarity was
         * given (and matched), then return true.
         */
        if (!searchTerms.length && (classes.size || rarities.size)) {
            return true;
        }
        /*
         * Generate a string of keywords for the servant.
         */
        const keywords = (servant.name + (servant.metadata?.displayName || '')).toLowerCase();
        /*
         * If any of the search terms are present in the keywords string, then it is
         * considered to be a match.
         */
        for (const searchTerm of searchTerms) {
            if (keywords.includes(searchTerm)) {
                return true;
            }
        }
        return false;
    };

}
