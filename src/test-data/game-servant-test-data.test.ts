import { Immutable } from '@fgo-planner/common-types';
import { GameServant, GameServantAttribute, GameServantCardType, GameServantClass, GameServantGender, GameServantNoblePhantasmTarget } from '@fgo-planner/data-types';

// TODO Move this file to a library

export const Rarity1TestServant: Immutable<GameServant> = {
    _id: 201300,
    collectionNo: 16,
    name: 'Arash',
    class: GameServantClass.Archer,
    rarity: 1,
    cost: 3,
    maxLevel: 60,
    gender: GameServantGender.Male,
    attribute: GameServantAttribute.Earth,
    hpBase: 1424,
    hpMax: 7122,
    atkBase: 1057,
    atkMax: 5816,
    growthCurve: 0,
    skillMaterials: {
        1: {
            qp: 10000,
            materials: [
                {
                    itemId: 6002,
                    quantity: 2
                }
            ]
        },
        2: {
            qp: 20000,
            materials: [
                {
                    itemId: 6002,
                    quantity: 4
                }
            ]
        },
        3: {
            qp: 60000,
            materials: [
                {
                    itemId: 6102,
                    quantity: 2
                }
            ]
        },
        4: {
            qp: 80000,
            materials: [
                {
                    itemId: 6102,
                    quantity: 4
                },
                {
                    itemId: 6503,
                    quantity: 5
                }
            ]
        },
        5: {
            qp: 200000,
            materials: [
                {
                    itemId: 6202,
                    quantity: 2
                },
                {
                    itemId: 6503,
                    quantity: 10
                }
            ]
        },
        6: {
            qp: 250000,
            materials: [
                {
                    itemId: 6202,
                    quantity: 4
                },
                {
                    itemId: 6502,
                    quantity: 2
                }
            ]
        },
        7: {
            qp: 500000,
            materials: [
                {
                    itemId: 6502,
                    quantity: 4
                },
                {
                    itemId: 6514,
                    quantity: 2
                }
            ]
        },
        8: {
            qp: 600000,
            materials: [
                {
                    itemId: 6514,
                    quantity: 6
                },
                {
                    itemId: 6505,
                    quantity: 16
                }
            ]
        },
        9: {
            qp: 1000000,
            materials: [
                {
                    itemId: 6999,
                    quantity: 1
                }
            ]
        }
    },
    appendSkillMaterials: {
        1: {
            qp: 10000,
            materials: [
                {
                    itemId: 6002,
                    quantity: 2
                }
            ]
        },
        2: {
            qp: 20000,
            materials: [
                {
                    itemId: 6002,
                    quantity: 4
                }
            ]
        },
        3: {
            qp: 60000,
            materials: [
                {
                    itemId: 6102,
                    quantity: 2
                }
            ]
        },
        4: {
            qp: 80000,
            materials: [
                {
                    itemId: 6102,
                    quantity: 4
                },
                {
                    itemId: 6515,
                    quantity: 2
                }
            ]
        },
        5: {
            qp: 200000,
            materials: [
                {
                    itemId: 6202,
                    quantity: 2
                },
                {
                    itemId: 6515,
                    quantity: 4
                }
            ]
        },
        6: {
            qp: 250000,
            materials: [
                {
                    itemId: 6202,
                    quantity: 4
                },
                {
                    itemId: 6518,
                    quantity: 1
                }
            ]
        },
        7: {
            qp: 500000,
            materials: [
                {
                    itemId: 6518,
                    quantity: 2
                },
                {
                    itemId: 6539,
                    quantity: 2
                }
            ]
        },
        8: {
            qp: 600000,
            materials: [
                {
                    itemId: 6539,
                    quantity: 4
                },
                {
                    itemId: 6541,
                    quantity: 8
                }
            ]
        },
        9: {
            qp: 1000000,
            materials: [
                {
                    itemId: 6999,
                    quantity: 1
                }
            ]
        }
    },
    ascensionMaterials: {
        1: {
            qp: 10000,
            materials: [
                {
                    itemId: 7002,
                    quantity: 2
                }
            ]
        },
        2: {
            qp: 30000,
            materials: [
                {
                    itemId: 7002,
                    quantity: 4
                },
                {
                    itemId: 6502,
                    quantity: 3
                }
            ]
        },
        3: {
            qp: 90000,
            materials: [
                {
                    itemId: 7102,
                    quantity: 2
                },
                {
                    itemId: 6503,
                    quantity: 10
                },
                {
                    itemId: 6515,
                    quantity: 2
                }
            ]
        },
        4: {
            qp: 300000,
            materials: [
                {
                    itemId: 7102,
                    quantity: 4
                },
                {
                    itemId: 6515,
                    quantity: 4
                },
                {
                    itemId: 6505,
                    quantity: 8
                }
            ]
        }
    },
    costumes: {},
    metadata: {
        displayName: 'Arash',
        fgoManagerName: 'Arash',
        links: []
    },
    np: [
        {
            cardType: GameServantCardType.Buster,
            target: GameServantNoblePhantasmTarget.All
        }
    ]
};

export const Rarity2TestServant: Immutable<GameServant> = {
    _id: 504400,
    collectionNo: 258,
    name: 'Chen Gong',
    class: GameServantClass.Caster,
    rarity: 2,
    cost: 4,
    maxLevel: 65,
    gender: GameServantGender.Male,
    attribute: GameServantAttribute.Man,
    hpBase: 1459,
    hpMax: 7755,
    atkBase: 1085,
    atkMax: 6119,
    growthCurve: 5,
    skillMaterials: {
        1: {
            qp: 20000,
            materials: [
                {
                    itemId: 6005,
                    quantity: 3
                }
            ]
        },
        2: {
            qp: 40000,
            materials: [
                {
                    itemId: 6005,
                    quantity: 6
                }
            ]
        },
        3: {
            qp: 120000,
            materials: [
                {
                    itemId: 6105,
                    quantity: 3
                }
            ]
        },
        4: {
            qp: 160000,
            materials: [
                {
                    itemId: 6105,
                    quantity: 6
                },
                {
                    itemId: 6510,
                    quantity: 3
                }
            ]
        },
        5: {
            qp: 400000,
            materials: [
                {
                    itemId: 6205,
                    quantity: 3
                },
                {
                    itemId: 6510,
                    quantity: 5
                }
            ]
        },
        6: {
            qp: 500000,
            materials: [
                {
                    itemId: 6205,
                    quantity: 6
                },
                {
                    itemId: 6511,
                    quantity: 3
                }
            ]
        },
        7: {
            qp: 1000000,
            materials: [
                {
                    itemId: 6511,
                    quantity: 5
                },
                {
                    itemId: 6532,
                    quantity: 3
                }
            ]
        },
        8: {
            qp: 1200000,
            materials: [
                {
                    itemId: 6532,
                    quantity: 9
                },
                {
                    itemId: 6538,
                    quantity: 12
                }
            ]
        },
        9: {
            qp: 2000000,
            materials: [
                {
                    itemId: 6999,
                    quantity: 1
                }
            ]
        }
    },
    appendSkillMaterials: {
        1: {
            qp: 20000,
            materials: [
                {
                    itemId: 6005,
                    quantity: 3
                }
            ]
        },
        2: {
            qp: 40000,
            materials: [
                {
                    itemId: 6005,
                    quantity: 6
                }
            ]
        },
        3: {
            qp: 120000,
            materials: [
                {
                    itemId: 6105,
                    quantity: 3
                }
            ]
        },
        4: {
            qp: 160000,
            materials: [
                {
                    itemId: 6105,
                    quantity: 6
                },
                {
                    itemId: 6515,
                    quantity: 3
                }
            ]
        },
        5: {
            qp: 400000,
            materials: [
                {
                    itemId: 6205,
                    quantity: 3
                },
                {
                    itemId: 6515,
                    quantity: 5
                }
            ]
        },
        6: {
            qp: 500000,
            materials: [
                {
                    itemId: 6205,
                    quantity: 6
                },
                {
                    itemId: 6525,
                    quantity: 1
                }
            ]
        },
        7: {
            qp: 1000000,
            materials: [
                {
                    itemId: 6525,
                    quantity: 2
                },
                {
                    itemId: 6534,
                    quantity: 9
                }
            ]
        },
        8: {
            qp: 1200000,
            materials: [
                {
                    itemId: 6534,
                    quantity: 27
                },
                {
                    itemId: 6539,
                    quantity: 8
                }
            ]
        },
        9: {
            qp: 2000000,
            materials: [
                {
                    itemId: 6999,
                    quantity: 1
                }
            ]
        }
    },
    ascensionMaterials: {
        1: {
            qp: 15000,
            materials: [
                {
                    itemId: 7005,
                    quantity: 3
                }
            ]
        },
        2: {
            qp: 45000,
            materials: [
                {
                    itemId: 7005,
                    quantity: 6
                },
                {
                    itemId: 6511,
                    quantity: 4
                }
            ]
        },
        3: {
            qp: 150000,
            materials: [
                {
                    itemId: 7105,
                    quantity: 3
                },
                {
                    itemId: 6510,
                    quantity: 5
                },
                {
                    itemId: 6515,
                    quantity: 3
                }
            ]
        },
        4: {
            qp: 450000,
            materials: [
                {
                    itemId: 7105,
                    quantity: 6
                },
                {
                    itemId: 6515,
                    quantity: 5
                },
                {
                    itemId: 6525,
                    quantity: 3
                }
            ]
        }
    },
    costumes: {},
    metadata: {
        displayName: 'Chen Gong',
        fgoManagerName: 'Chen Gong',
        links: []
    },
    np: [
        {
            cardType: GameServantCardType.Arts,
            target: GameServantNoblePhantasmTarget.All
        }
    ]
};

export const Rarity5TestServant: Immutable<GameServant> = {
    _id: 1100900,
    collectionNo: 268,
    name: 'Space Ishtar',
    class: GameServantClass.Avenger,
    rarity: 5,
    cost: 16,
    maxLevel: 90,
    gender: GameServantGender.Female,
    attribute: GameServantAttribute.Star,
    hpBase: 1912,
    hpMax: 13041,
    atkBase: 1949,
    atkMax: 12612,
    growthCurve: 10,
    skillMaterials: {
        1: {
            qp: 200000,
            materials: [
                {
                    itemId: 6510,
                    quantity: 10
                }
            ]
        },
        2: {
            qp: 400000,
            materials: [
                {
                    itemId: 6501,
                    quantity: 10
                }
            ]
        },
        3: {
            qp: 1200000,
            materials: [
                {
                    itemId: 6530,
                    quantity: 12
                }
            ]
        },
        4: {
            qp: 1600000,
            materials: [
                {
                    itemId: 6533,
                    quantity: 12
                }
            ]
        },
        5: {
            qp: 4000000,
            materials: [
                {
                    itemId: 6534,
                    quantity: 12
                }
            ]
        },
        6: {
            qp: 5000000,
            materials: [
                {
                    itemId: 6536,
                    quantity: 15
                }
            ]
        },
        7: {
            qp: 10000000,
            materials: [
                {
                    itemId: 6529,
                    quantity: 15
                }
            ]
        },
        8: {
            qp: 12000000,
            materials: [
                {
                    itemId: 6542,
                    quantity: 15
                }
            ]
        },
        9: {
            qp: 20000000,
            materials: [
                {
                    itemId: 6999,
                    quantity: 1
                }
            ]
        }
    },
    appendSkillMaterials: {
        1: {
            qp: 200000,
            materials: [
                {
                    itemId: 6515,
                    quantity: 10
                }
            ]
        },
        2: {
            qp: 400000,
            materials: [
                {
                    itemId: 6509,
                    quantity: 10
                }
            ]
        },
        3: {
            qp: 1200000,
            materials: [
                {
                    itemId: 6521,
                    quantity: 12
                }
            ]
        },
        4: {
            qp: 1600000,
            materials: [
                {
                    itemId: 6528,
                    quantity: 12
                }
            ]
        },
        5: {
            qp: 4000000,
            materials: [
                {
                    itemId: 6537,
                    quantity: 12
                }
            ]
        },
        6: {
            qp: 5000000,
            materials: [
                {
                    itemId: 6539,
                    quantity: 15
                }
            ]
        },
        7: {
            qp: 10000000,
            materials: [
                {
                    itemId: 6541,
                    quantity: 15
                }
            ]
        },
        8: {
            qp: 12000000,
            materials: [
                {
                    itemId: 6544,
                    quantity: 15
                }
            ]
        },
        9: {
            qp: 20000000,
            materials: [
                {
                    itemId: 6999,
                    quantity: 1
                }
            ]
        }
    },
    ascensionMaterials: {
        1: {
            qp: 100000,
            materials: [
                {
                    itemId: 6515,
                    quantity: 10
                },
                {
                    itemId: 6521,
                    quantity: 10
                }
            ]
        },
        2: {
            qp: 300000,
            materials: [
                {
                    itemId: 6509,
                    quantity: 10
                },
                {
                    itemId: 6528,
                    quantity: 10
                }
            ]
        },
        3: {
            qp: 1000000,
            materials: [
                {
                    itemId: 6520,
                    quantity: 10
                },
                {
                    itemId: 6539,
                    quantity: 10
                }
            ]
        },
        4: {
            qp: 3000000,
            materials: [
                {
                    itemId: 6525,
                    quantity: 10
                },
                {
                    itemId: 6517,
                    quantity: 10
                }
            ]
        }
    },
    costumes: {
        1100930: {
            collectionNo: 31,
            name: 'Spiritron Dress: Ashtart Origin',
            materials: {
                qp: 3000000,
                materials: [
                    {
                        itemId: 6505,
                        quantity: 10
                    },
                    {
                        itemId: 6537,
                        quantity: 5
                    },
                    {
                        itemId: 6528,
                        quantity: 5
                    },
                    {
                        itemId: 6542,
                        quantity: 5
                    }
                ]
            }
        }
    },
    metadata: {
        displayName: 'Space Ishtar',
        links: [],
        fgoManagerName: 'Space Ishtar'
    },
    np: [
        {
            cardType: GameServantCardType.Arts,
            target: GameServantNoblePhantasmTarget.All
        },
        {
            cardType: GameServantCardType.Buster,
            target: GameServantNoblePhantasmTarget.All
        },
        {
            cardType: GameServantCardType.Quick,
            target: GameServantNoblePhantasmTarget.All
        }
    ]
};
