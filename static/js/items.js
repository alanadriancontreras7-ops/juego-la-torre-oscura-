/**
 * SISTEMA DE ÍTEMS, RAREZAS Y BOTÍN (LOOT)
 * Define las tablas de drops por enemigo y catálogo de 30+ ítems con estadísticas.
 */

const ITEM_RARITIES = {
    COMMON: { name: 'Común', color: '#9e9e9e', class: 'rarity-common' },
    RARE: { name: 'Rara', color: '#3498db', class: 'rarity-rare' },
    EPIC: { name: 'Épica', color: '#9b59b6', class: 'rarity-epic' },
    LEGENDARY: { name: 'Legendaria', color: '#f39c12', class: 'rarity-legendary' }
};

const ITEM_DATABASE = {
    // === ARMAS ===
    sword_short: {
        id: 'sword_short',
        name: 'Espada Corta de Acero',
        type: 'weapon',
        rarity: 'COMMON',
        icon: 0,
        atk: 6,
        value: 15,
        desc: 'Una espada básica pero afilada empuñada por los guardias de la torre.'
    },
    sword_broad: {
        id: 'sword_broad',
        name: 'Espadón Rúnico',
        type: 'weapon',
        rarity: 'RARE',
        icon: 0,
        atk: 14,
        str: 3,
        value: 50,
        desc: 'Forjada en acero templado con runas que aumentan el impacto físico.'
    },
    bow_hunter: {
        id: 'bow_hunter',
        name: 'Arco de Cazador Silvano',
        type: 'weapon',
        rarity: 'RARE',
        icon: 2,
        atk: 12,
        dex: 4,
        value: 45,
        desc: 'Arco flexible de tejo capaz de atravesar corazas ligeras a gran distancia.'
    },
    bow_elven: {
        id: 'bow_elven',
        name: 'Arco del Viento Sagrado',
        type: 'weapon',
        rarity: 'EPIC',
        icon: 2,
        atk: 22,
        dex: 7,
        value: 120,
        desc: 'Emite un silbido tenue al disparar flechas con velocidad supersónica.'
    },
    staff_apprentice: {
        id: 'staff_apprentice',
        name: 'Vara de Aprendiz Arcano',
        type: 'weapon',
        rarity: 'COMMON',
        icon: 3,
        atk: 5,
        mag: 3,
        value: 20,
        desc: 'Canaliza chispas de energía elemental de fuego.'
    },
    staff_inferno: {
        id: 'staff_inferno',
        name: 'Bastón de Ignis Purificadora',
        type: 'weapon',
        rarity: 'EPIC',
        icon: 3,
        atk: 18,
        mag: 9,
        value: 130,
        desc: 'Coronado por un cristal ígneo que arde eternamente con calor solar.'
    },
    blade_demonic: {
        id: 'blade_demonic',
        name: 'Segadora de Almas de Hong',
        type: 'weapon',
        rarity: 'LEGENDARY',
        icon: 1,
        atk: 35,
        str: 8,
        mag: 5,
        value: 300,
        desc: 'Arma demoníaca legendaria imbuida con el apetito devorador del Señor Hong.'
    },

    // === ARMADURAS ===
    armor_leather: {
        id: 'armor_leather',
        name: 'Jubón de Cuero Rígido',
        type: 'armor',
        rarity: 'COMMON',
        icon: 5,
        def: 4,
        value: 18,
        desc: 'Protección ligera que permite agilidad sin entorpecer los reflejos.'
    },
    armor_plate: {
        id: 'armor_plate',
        name: 'Peto de Placas de Caballero',
        type: 'armor',
        rarity: 'EPIC',
        icon: 4,
        def: 15,
        con: 5,
        value: 95,
        desc: 'Acero macizo pulido para desviar los colmillos y garras de las bestias.'
    },
    armor_robe: {
        id: 'armor_robe',
        name: 'Túnica de Sombras Astrales',
        type: 'armor',
        rarity: 'RARE',
        icon: 5,
        def: 7,
        mag: 6,
        value: 65,
        desc: 'Tejida con seda mística que absorbe parte del daño elemental.'
    },
    armor_abracadabra: {
        id: 'armor_abracadabra',
        name: 'Caparazón Virulento de Abracadabra',
        type: 'armor',
        rarity: 'LEGENDARY',
        icon: 4,
        def: 24,
        con: 10,
        hp: 40,
        value: 250,
        desc: 'Coraza biológica con pústulas endurecidas que inmuniza al veneno.'
    },

    // === CONSUMIBLES ===
    potion_health: {
        id: 'potion_health',
        name: 'Poción de Salud',
        type: 'consumable',
        rarity: 'COMMON',
        icon: 6,
        heal_hp: 60,
        value: 12,
        desc: 'Restaura 60 puntos de Vida al instante.'
    },
    potion_mana: {
        id: 'potion_mana',
        name: 'Poción de Maná',
        type: 'consumable',
        rarity: 'COMMON',
        icon: 7,
        heal_mp: 40,
        value: 10,
        desc: 'Restaura 40 puntos de Maná arcano.'
    },

    // === MATERIALES DE MONSTRUOS ===
    mat_bone: {
        id: 'mat_bone',
        name: 'Fragmento de Hueso Maldito',
        type: 'material',
        rarity: 'COMMON',
        icon: 8,
        value: 8,
        desc: 'Restos de esqueleto animados por la magia negra de la torre.'
    },
    mat_silk: {
        id: 'mat_silk',
        name: 'Seda de Araña Gigante',
        type: 'material',
        rarity: 'COMMON',
        icon: 8,
        value: 12,
        desc: 'Hilos extraordinariamente resistentes y pegajosos.'
    },
    mat_pelt: {
        id: 'mat_pelt',
        name: 'Piel de Hombre Lobo',
        type: 'material',
        rarity: 'RARE',
        icon: 8,
        value: 25,
        desc: 'Pelaje espeso e impermeable muy cotizado por boticarios y armeros.'
    },
    mat_horn: {
        id: 'mat_horn',
        name: 'Cuerno de Demonio',
        type: 'material',
        rarity: 'EPIC',
        icon: 8,
        value: 45,
        desc: 'Resuena con energía infernal latente.'
    }
};

/**
 * Tablas de botín por enemigo
 */
const DROP_TABLES = {
    bandit: [
        { id: 'potion_health', chance: 0.35 },
        { id: 'sword_short', chance: 0.15 },
        { goldMin: 5, goldMax: 15 }
    ],
    skeleton: [
        { id: 'mat_bone', chance: 0.70 },
        { id: 'sword_broad', chance: 0.12 },
        { goldMin: 8, goldMax: 20 }
    ],
    spider: [
        { id: 'mat_silk', chance: 0.75 },
        { id: 'potion_health', chance: 0.25 },
        { goldMin: 10, goldMax: 22 }
    ],
    werewolf: [
        { id: 'mat_pelt', chance: 0.80 },
        { id: 'bow_hunter', chance: 0.15 },
        { goldMin: 18, goldMax: 40 }
    ],
    demon: [
        { id: 'mat_horn', chance: 0.65 },
        { id: 'armor_robe', chance: 0.20 },
        { id: 'potion_mana', chance: 0.40 },
        { goldMin: 25, goldMax: 60 }
    ],
    abracadabra: [
        { id: 'armor_abracadabra', chance: 1.0 },
        { id: 'bow_elven', chance: 0.7 },
        { goldMin: 120, goldMax: 250 }
    ],
    hong: [
        { id: 'blade_demonic', chance: 1.0 },
        { id: 'staff_inferno', chance: 1.0 },
        { goldMin: 400, goldMax: 800 }
    ],
    barrel: [
        { id: 'potion_health', chance: 0.45 },
        { id: 'potion_mana', chance: 0.35 },
        { goldMin: 6, goldMax: 18 }
    ],
    chest: [
        { id: 'sword_broad', chance: 0.35 },
        { id: 'armor_plate', chance: 0.30 },
        { id: 'potion_health', chance: 0.80 },
        { goldMin: 35, goldMax: 90 }
    ]
};

window.ITEM_DATABASE = ITEM_DATABASE;
window.ITEM_RARITIES = ITEM_RARITIES;
window.DROP_TABLES = DROP_TABLES;
