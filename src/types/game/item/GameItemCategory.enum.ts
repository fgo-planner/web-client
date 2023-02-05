const SkillGems = 0;
const AscensionStatues = 1;
const BronzeEnhancementMaterials = 2;
const SilverEnhancementMaterials = 3;
const GoldEnhancementMaterials = 4;

export type GameItemCategory =
    typeof SkillGems |
    typeof AscensionStatues |
    typeof BronzeEnhancementMaterials |
    typeof SilverEnhancementMaterials |
    typeof GoldEnhancementMaterials;

export const GameItemCategory = {
    SkillGems,
    AscensionStatues,
    BronzeEnhancementMaterials,
    SilverEnhancementMaterials,
    GoldEnhancementMaterials
} as const;
