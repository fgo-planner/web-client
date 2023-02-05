const Saber = 'Saber';
const Archer = 'Archer';
const Lancer = 'Lancer';
const Rider = 'Rider';
const Caster = 'Caster';
const Assassin = 'Assassin';
const Berserker = 'Berserker';
const Extra = 'Extra';

export type GameServantClassSimplified =
    typeof Saber |
    typeof Archer |
    typeof Lancer |
    typeof Rider |
    typeof Caster |
    typeof Assassin |
    typeof Berserker |
    typeof Extra;

/**
 * Simplified enumeration of servant class names that only includes the
 * original seven classes plus the 'Extra' class.
 */
export const GameServantClassSimplified = {
    Saber,
    Archer,
    Lancer,
    Rider,
    Caster,
    Assassin,
    Berserker,
    Extra
} as const;
