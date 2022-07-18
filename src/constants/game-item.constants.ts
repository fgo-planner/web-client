export class GameItemConstants {

    /**
     * Skill gem item IDs.
     */
    static readonly SkillGems: ReadonlyArray<number> = [
        6001,
        6002,
        6003,
        6004,
        6005,
        6006,
        6007,
        6101,
        6102,
        6103,
        6104,
        6105,
        6106,
        6107,
        6201,
        6202,
        6203,
        6204,
        6205,
        6206,
        6207
    ];

    /**
     * Statue gem item IDs.
     */
    static readonly AscensionStatues: ReadonlyArray<number> = [
        7001,
        7002,
        7003,
        7004,
        7005,
        7006,
        7007,
        7101,
        7102,
        7103,
        7104,
        7105,
        7106,
        7107
    ];  

    /**
     * Bronze enhancement material item IDs. Order of the items are as they appear
     * in the Item List in-game menu.
     */
    static readonly BronzeEnhancementMaterials: ReadonlyArray<number> = [
        6503,  // Proof
        6516,  // Bone
        6512,  // Fang
        6505,  // Dust
        6522,  // Chain
        6527,  // Stinger
        6530,  // Fluid
        6533,  // Stake
        6534,  // Bullet
        6549,  // Bell of Amnesty
        6551,  // Blade
        6552   // Ashes
    ];

    /**
     * Silver enhancement material item IDs. Order of the items are as they appear
     * in the Item List in-game menu.
     */
    static readonly SilverEnhancementMaterials: ReadonlyArray<number> = [
        6502,  // Seed
        6508,  // Lantern
        6515,  // Crystal
        6509,  // Jewel
        6501,  // Feather
        6510,  // Gear
        6511,  // Page
        6514,  // Baby
        6513,  // Horseshoe
        6524,  // Medal
        6526,  // Shell
        6532,  // Magatama
        6535,  // Frost
        6537,  // Ring
        6536,  // Steel
        6538,  // Bell
        6541,  // Arrowhead
        6543,  // Crown
        6545,  // Vein
        6547,  // Rainbow Yarn
        6550   // Scales of Fantasies
    ];

    /**
     * Gold enhancement material item IDs. Order of the items are as they appear in
     * the Item List in-game menu.
     */
    static readonly GoldEnhancementMaterials: ReadonlyArray<number> = [
        6507,  // Claw
        6517,  // Heart
        6506,  // Scale
        6518,  // Root
        6519,  // Horn
        6520,  // Tearstone
        6521,  // Grease
        6523,  // Lamp
        6525,  // Scarab
        6528,  // Lanugo
        6529,  // Gallstone
        6531,  // Wine
        6539,  // Core
        6540,  // Mirror
        6542,  // Egg
        6544,  // Shard
        6546,  // Fruit
        6548  // Demonic Flame
    ];

    static readonly OtherEnhancementMaterials: ReadonlyArray<number> = [
        6999,  // Lore
        7999   // Grail
    ];

    static readonly MaxItemQuantity = 2000000000;

    static readonly QpItemId = 5;

    private constructor () {
        
    }

}
