/**
 * SISTEMA DE ÍTEMS, RAREZAS Y BOTÍN (LOOT)
 * Define las tablas de drops escalonadas por dificultad de enemigo y catálogo de ítems.
 */

const ITEM_RARITIES = {
    COMMON: { name: 'Común', color: '#b2bec3', class: 'rarity-common' },
    RARE: { name: 'Rara', color: '#0984e3', class: 'rarity-rare' },
    EPIC: { name: 'Épica', color: '#a29bfe', class: 'rarity-epic' },
    LEGENDARY: { name: 'Legendaria', color: '#fdcb6e', class: 'rarity-legendary' }
};

const ITEM_DATABASE = {
    // === ARMAS COMUNES (Pisos 1-3) ===
    dagger_bandit: {
        id: 'dagger_bandit',
        name: 'Daga Oxidada de Bandolero',
        type: 'weapon',
        rarity: 'COMMON',
        icon: 0,
        atk: 5,
        dex: 2,
        value: 12,
        desc: 'Una hoja corta y ligera arrebatada a un ladrón de catacumbas.'
    },
    sword_short: {
        id: 'sword_short',
        name: 'Espada Corta de Acero',
        type: 'weapon',
        rarity: 'COMMON',
        icon: 0,
        atk: 7,
        str: 1,
        value: 16,
        desc: 'Espada estándar de la guardia caída de la torre.'
    },
    bow_short: {
        id: 'bow_short',
        name: 'Arco de Fresno Rústico',
        type: 'weapon',
        rarity: 'COMMON',
        icon: 2,
        atk: 6,
        dex: 2,
        value: 15,
        desc: 'Arco sencillo tallado en madera flexible de fresno.'
    },
    staff_apprentice: {
        id: 'staff_apprentice',
        name: 'Vara de Aprendiz Arcano',
        type: 'weapon',
        rarity: 'COMMON',
        icon: 3,
        atk: 5,
        mag: 3,
        value: 18,
        desc: 'Canaliza chispas tenues de energía elemental.'
    },

    // === ARMAS RARAS (Pisos 3-6) ===
    sword_broad: {
        id: 'sword_broad',
        name: 'Espadón Rúnico de Osario',
        type: 'weapon',
        rarity: 'RARE',
        icon: 0,
        atk: 14,
        str: 4,
        value: 55,
        desc: 'Forjada en acero templado con runas que aumentan el impacto físico.'
    },
    bow_hunter: {
        id: 'bow_hunter',
        name: 'Arco de Cazador Silvano',
        type: 'weapon',
        rarity: 'RARE',
        icon: 2,
        atk: 13,
        dex: 5,
        value: 50,
        desc: 'Arco reforzado capaz de perforar corazas a gran distancia.'
    },
    staff_arcane: {
        id: 'staff_arcane',
        name: 'Cetro de Amatista Abisal',
        type: 'weapon',
        rarity: 'RARE',
        icon: 3,
        atk: 12,
        mag: 6,
        value: 60,
        desc: 'Concentra la energía mística en ondas de choque mágicas.'
    },

    // === ARMAS ÉPICAS (Pisos 6-9) ===
    sword_paladin: {
        id: 'sword_paladin',
        name: 'Filo Sagrado de Caballero',
        type: 'weapon',
        rarity: 'EPIC',
        icon: 0,
        atk: 25,
        str: 7,
        con: 4,
        value: 140,
        desc: 'Bendecida para cercenar demonios y bestias de la oscuridad.'
    },
    bow_elven: {
        id: 'bow_elven',
        name: 'Arco del Viento Sagrado',
        type: 'weapon',
        rarity: 'EPIC',
        icon: 2,
        atk: 23,
        dex: 8,
        value: 130,
        desc: 'Emite un silbido tenue al disparar flechas a velocidad supersónica.'
    },
    staff_inferno: {
        id: 'staff_inferno',
        name: 'Bastón de Ignis Purificadora',
        type: 'weapon',
        rarity: 'EPIC',
        icon: 3,
        atk: 21,
        mag: 10,
        value: 135,
        desc: 'Coronado por un cristal ígneo que arde eternamente con calor solar.'
    },

    // === ARMAS LEGENDARIAS (Jefes y Pisos 9-10) ===
    blade_demonic: {
        id: 'blade_demonic',
        name: 'Segadora de Almas de Hong',
        type: 'weapon',
        rarity: 'LEGENDARY',
        icon: 1,
        atk: 38,
        str: 9,
        mag: 6,
        value: 350,
        desc: 'Gran mandoble titánico imbuido con el hambre devoradora del Señor Hong.'
    },
    bow_celestial: {
        id: 'bow_celestial',
        name: 'Arco Fénix del Ocaso',
        type: 'weapon',
        rarity: 'LEGENDARY',
        icon: 2,
        atk: 34,
        dex: 11,
        value: 330,
        desc: 'Artefacto milenario que envuelve cada disparo en fuego estelar.'
    },
    staff_void: {
        id: 'staff_void',
        name: 'Vara del Vacío Primordial',
        type: 'weapon',
        rarity: 'LEGENDARY',
        icon: 3,
        atk: 30,
        mag: 14,
        con: 5,
        value: 340,
        desc: 'Desgarra el tejido de la realidad con esferas de gravedad oscura.'
    },

    // === ARMADURAS ===
    armor_leather: {
        id: 'armor_leather',
        name: 'Jubón de Cuero Rígido',
        type: 'armor',
        rarity: 'COMMON',
        icon: 5,
        def: 5,
        value: 18,
        desc: 'Protección ligera que no entorpece la movilidad.'
    },
    armor_reinforced: {
        id: 'armor_reinforced',
        name: 'Cota de Mallas Reforzada',
        type: 'armor',
        rarity: 'RARE',
        icon: 4,
        def: 10,
        con: 3,
        value: 65,
        desc: 'Anillos de acero trenzado que dispersan cortes directos.'
    },
    armor_robe: {
        id: 'armor_robe',
        name: 'Túnica de Sombras Astrales',
        type: 'armor',
        rarity: 'RARE',
        icon: 5,
        def: 8,
        mag: 6,
        value: 70,
        desc: 'Tejida con seda mística que absorbe parte del daño elemental.'
    },
    armor_plate: {
        id: 'armor_plate',
        name: 'Peto de Placas de Caballero',
        type: 'armor',
        rarity: 'EPIC',
        icon: 4,
        def: 18,
        con: 6,
        value: 120,
        desc: 'Acero macizo pulido para desviar los colmillos y garras de las bestias.'
    },
    armor_abracadabra: {
        id: 'armor_abracadabra',
        name: 'Caparazón Virulento de Abracadabra',
        type: 'armor',
        rarity: 'LEGENDARY',
        icon: 4,
        def: 25,
        con: 10,
        hp: 45,
        value: 280,
        desc: 'Coraza biológica con pústulas endurecidas que inmuniza al ácido.'
    },
    armor_titan: {
        id: 'armor_titan',
        name: 'Placas del Titán Devorador',
        type: 'armor',
        rarity: 'LEGENDARY',
        icon: 4,
        def: 30,
        con: 12,
        str: 6,
        value: 360,
        desc: 'Forjada con la mismísima quitina impenetrable de Hong.'
    },

    // === CONSUMIBLES ===
    potion_health: {
        id: 'potion_health',
        name: 'Poción de Salud',
        type: 'consumable',
        rarity: 'COMMON',
        icon: 6,
        heal_hp: 65,
        value: 12,
        desc: 'Restaura 65 puntos de Vida al instante.'
    },
    potion_mana: {
        id: 'potion_mana',
        name: 'Poción de Maná',
        type: 'consumable',
        rarity: 'COMMON',
        icon: 7,
        heal_mp: 45,
        value: 10,
        desc: 'Restaura 45 puntos de Maná arcano.'
    },
    potion_elixir: {
        id: 'potion_elixir',
        name: 'Elixir de los Ancestros',
        type: 'consumable',
        rarity: 'RARE',
        icon: 6,
        heal_hp: 120,
        heal_mp: 80,
        value: 40,
        desc: 'Restaura 120 de Vida y 80 de Maná simultáneamente.'
    },

    // === MATERIALES DE MONSTRUOS ===
    mat_rat_tail: {
        id: 'mat_rat_tail',
        name: 'Cola de Rata Infecta',
        type: 'material',
        rarity: 'COMMON',
        icon: 8,
        value: 6,
        desc: 'Resto asqueroso pero utilizado en alquimia básica.'
    },
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
 * Tablas de botín escalonadas por enemigo y tipo de fuente
 */
const DROP_TABLES = {
    // 1. Rata Gigante (Pisos 1-6) - Nivel Bajo
    rat: [
        { id: 'mat_rat_tail', chance: 0.65 },
        { id: 'potion_health', chance: 0.30 },
        { id: 'dagger_bandit', chance: 0.12 },
        { goldMin: 4, goldMax: 12 }
    ],

    // 2. Bandido (Pisos 1-4) - Nivel Bajo / Común
    bandit: [
        { id: 'potion_health', chance: 0.35 },
        { id: 'sword_short', chance: 0.25 },
        { id: 'bow_short', chance: 0.20 },
        { id: 'armor_leather', chance: 0.18 },
        { id: 'sword_broad', chance: 0.08 }, // Arma Rara ocasional
        { goldMin: 8, goldMax: 22 }
    ],

    // 3. Esqueleto (Pisos 1-4) - Nivel Bajo / Intermedio
    skeleton: [
        { id: 'mat_bone', chance: 0.70 },
        { id: 'sword_short', chance: 0.22 },
        { id: 'sword_broad', chance: 0.18 }, // Arma Rara
        { id: 'armor_reinforced', chance: 0.12 },
        { id: 'sword_paladin', chance: 0.03 }, // Arma Épica muy rara
        { goldMin: 12, goldMax: 28 }
    ],

    // 4. Araña Gigante (Pisos 3-6) - Nivel Intermedio
    spider: [
        { id: 'mat_silk', chance: 0.75 },
        { id: 'potion_health', chance: 0.35 },
        { id: 'potion_mana', chance: 0.30 },
        { id: 'bow_hunter', chance: 0.20 }, // Arma Rara
        { id: 'staff_arcane', chance: 0.18 }, // Arma Rara
        { id: 'armor_robe', chance: 0.15 },
        { id: 'bow_elven', chance: 0.05 }, // Arma Épica
        { goldMin: 16, goldMax: 36 }
    ],

    // 5. Hombre Lobo (Pisos 5-9) - Nivel Alto
    werewolf: [
        { id: 'mat_pelt', chance: 0.80 },
        { id: 'potion_health', chance: 0.40 },
        { id: 'sword_broad', chance: 0.25 },
        { id: 'bow_hunter', chance: 0.25 },
        { id: 'sword_paladin', chance: 0.18 }, // Arma Épica
        { id: 'bow_elven', chance: 0.16 }, // Arma Épica
        { id: 'armor_plate', chance: 0.15 }, // Armadura Épica
        { id: 'bow_celestial', chance: 0.03 }, // Arma Legendaria muy rara
        { goldMin: 32, goldMax: 70 }
    ],

    // 6. Demonio Menor (Pisos 7-9) - Nivel Elite / Abisal
    demon: [
        { id: 'mat_horn', chance: 0.75 },
        { id: 'potion_mana', chance: 0.50 },
        { id: 'potion_elixir', chance: 0.30 },
        { id: 'staff_inferno', chance: 0.25 }, // Arma Épica
        { id: 'sword_paladin', chance: 0.22 }, // Arma Épica
        { id: 'armor_plate', chance: 0.20 },
        { id: 'blade_demonic', chance: 0.06 }, // Arma Legendaria
        { id: 'staff_void', chance: 0.06 }, // Arma Legendaria
        { goldMin: 55, goldMax: 120 }
    ],

    // 7. Sub-Jefe Abracadabra (Piso 8)
    abracadabra: [
        { id: 'armor_abracadabra', chance: 1.0 }, // Armadura Legendaria garantizada
        { id: 'staff_inferno', chance: 0.75 },
        { id: 'bow_elven', chance: 0.75 },
        { id: 'potion_health', chance: 1.0, qty: 3 },
        { id: 'potion_mana', chance: 1.0, qty: 2 },
        { id: 'potion_elixir', chance: 1.0, qty: 1 },
        { goldMin: 180, goldMax: 350 }
    ],

    // 8. Jefe Final Hong (Piso 10)
    hong: [
        { id: 'blade_demonic', chance: 1.0 }, // Arma Legendaria garantizada
        { id: 'armor_titan', chance: 1.0 },   // Armadura Legendaria garantizada
        { id: 'staff_void', chance: 0.80 },
        { id: 'bow_celestial', chance: 0.80 },
        { goldMin: 500, goldMax: 1000 }
    ],

    // 9. Cofres de Pisos Iniciales (1-3)
    chest_early: [
        { id: 'sword_short', chance: 0.45 },
        { id: 'sword_broad', chance: 0.25 },
        { id: 'armor_leather', chance: 0.40 },
        { id: 'potion_health', chance: 0.75 },
        { id: 'potion_mana', chance: 0.40 },
        { goldMin: 25, goldMax: 60 }
    ],

    // 10. Cofres de Pisos Medios (4-7)
    chest_mid: [
        { id: 'sword_broad', chance: 0.40 },
        { id: 'bow_hunter', chance: 0.35 },
        { id: 'staff_arcane', chance: 0.35 },
        { id: 'armor_reinforced', chance: 0.30 },
        { id: 'armor_plate', chance: 0.20 },
        { id: 'potion_health', chance: 0.80 },
        { id: 'potion_elixir', chance: 0.30 },
        { goldMin: 60, goldMax: 130 }
    ],

    // 11. Cofres de Pisos Avanzados (8-10)
    chest_late: [
        { id: 'sword_paladin', chance: 0.45 },
        { id: 'bow_elven', chance: 0.45 },
        { id: 'staff_inferno', chance: 0.45 },
        { id: 'armor_plate', chance: 0.40 },
        { id: 'blade_demonic', chance: 0.15 },
        { id: 'bow_celestial', chance: 0.15 },
        { id: 'staff_void', chance: 0.15 },
        { id: 'potion_elixir', chance: 0.70 },
        { goldMin: 140, goldMax: 300 }
    ],

    // 12. Barriles y Cajas destructibles
    barrel: [
        { id: 'potion_health', chance: 0.40 },
        { id: 'potion_mana', chance: 0.30 },
        { id: 'mat_bone', chance: 0.15 },
        { id: 'dagger_bandit', chance: 0.08 },
        { goldMin: 5, goldMax: 18 }
    ]
};

window.ITEM_DATABASE = ITEM_DATABASE;
window.ITEM_RARITIES = ITEM_RARITIES;
window.DROP_TABLES = DROP_TABLES;