/**
 * SISTEMA DE ÍTEMS, RAREZAS Y BOTÍN (LOOT)
 * Catálogo con restricciones estrictas de clase, aspecto visual fijo por tier (look 0, 1, 2)
 * y tabla de recompensas para el Sub-Jefe Lucian (Piso 5).
 */

const ITEM_RARITIES = {
    COMMON: { name: 'Común', color: '#b2bec3', class: 'rarity-common' },
    RARE: { name: 'Rara', color: '#3498db', class: 'rarity-rare' },
    EPIC: { name: 'Épica', color: '#9b59b6', class: 'rarity-epic' },
    LEGENDARY: { name: 'Legendaria', color: '#f1c40f', class: 'rarity-legendary' }
};

const ITEM_DATABASE = {
    // =========================================================================
    // ESPADAS (SOLO GUERRERO - classReq: 'warrior')
    // =========================================================================
    sword_short: {
        id: 'sword_short',
        name: 'Espada Corta de Acero',
        type: 'weapon',
        weaponType: 'sword',
        classReq: 'warrior',
        look: 0, // Aspecto 0: Acero común
        rarity: 'COMMON',
        icon: 0,
        atk: 8,
        str: 2,
        value: 18,
        desc: 'Espada estándar de acero templado empuñada por la guardia de la torre.'
    },
    sword_broad: {
        id: 'sword_broad',
        name: 'Espadón Rúnico de Osario',
        type: 'weapon',
        weaponType: 'sword',
        classReq: 'warrior',
        look: 0, // Aspecto 0: Acero reforzado
        rarity: 'RARE',
        icon: 0,
        atk: 16,
        str: 4,
        value: 60,
        desc: 'Forjada en acero pesado con runas que aumentan el impacto físico.'
    },
    blade_demonic: {
        id: 'blade_demonic',
        name: 'Segadora Demoníaca Carmesí',
        type: 'weapon',
        weaponType: 'sword',
        classReq: 'warrior',
        look: 1, // Aspecto 1: Obsidiana y lava
        rarity: 'EPIC',
        icon: 1,
        atk: 28,
        str: 8,
        con: 3,
        value: 220,
        desc: 'Hoja de obsidiana forjada en fuego infernal. Su filo hierve con sed de sangre.'
    },
    sword_legend: {
        id: 'sword_legend',
        name: 'Segadora Solar del Alba',
        type: 'weapon',
        weaponType: 'sword',
        classReq: 'warrior',
        look: 2, // Aspecto 2: Oro y luz divina
        rarity: 'LEGENDARY',
        icon: 10,
        atk: 45,
        str: 14,
        con: 6,
        value: 450,
        desc: 'Mandoble titánico que irradia fuego purificador celeste contra las sombras.'
    },

    // =========================================================================
    // ARCOS (SOLO ARQUERO - classReq: 'archer')
    // =========================================================================
    bow_short: {
        id: 'bow_short',
        name: 'Arco de Fresno Rústico',
        type: 'weapon',
        weaponType: 'bow',
        classReq: 'archer',
        look: 0, // Aspecto 0: Madera común
        rarity: 'COMMON',
        icon: 2,
        atk: 7,
        dex: 2,
        value: 18,
        desc: 'Arco ágil tallado en madera flexible, ideal para tiros veloces.'
    },
    bow_hunter: {
        id: 'bow_hunter',
        name: 'Arco de Cazador Silvano',
        type: 'weapon',
        weaponType: 'bow',
        classReq: 'archer',
        look: 0, // Aspecto 0: Madera reforzada
        rarity: 'RARE',
        icon: 2,
        atk: 15,
        dex: 5,
        value: 55,
        desc: 'Arco reforzado capaz de atravesar corazas a gran distancia.'
    },
    bow_dark: {
        id: 'bow_dark',
        name: 'Arco Sombrío de la Noche',
        type: 'weapon',
        weaponType: 'bow',
        classReq: 'archer',
        look: 1, // Aspecto 1: Obsidiana con cuerda carmesí
        rarity: 'EPIC',
        icon: 11,
        atk: 26,
        dex: 9,
        value: 200,
        desc: 'Tensado con zarcillos oscuros; cada flecha vuela envuelta en bruma negra.'
    },
    bow_legend: {
        id: 'bow_legend',
        name: 'Arco Fénix del Ocaso',
        type: 'weapon',
        weaponType: 'bow',
        classReq: 'archer',
        look: 2, // Aspecto 2: Oro y plumas divinas
        rarity: 'LEGENDARY',
        icon: 12,
        atk: 42,
        dex: 15,
        value: 440,
        desc: 'Artefacto celestial de la aurora que envuelve cada disparo en fuego estelar.'
    },

    // =========================================================================
    // BASTONES (SOLO MAGO - classReq: 'mage')
    // =========================================================================
    staff_apprentice: {
        id: 'staff_apprentice',
        name: 'Vara de Aprendiz Arcano',
        type: 'weapon',
        weaponType: 'staff',
        classReq: 'mage',
        look: 0, // Aspecto 0: Madera y cuarzo
        rarity: 'COMMON',
        icon: 3,
        atk: 6,
        mag: 3,
        value: 20,
        desc: 'Canaliza chispas tenues de energía elemental de fuego.'
    },
    staff_inferno: {
        id: 'staff_inferno',
        name: 'Bastón de Ignis Purificadora',
        type: 'weapon',
        weaponType: 'staff',
        classReq: 'mage',
        look: 0, // Aspecto 0: Cristal solar
        rarity: 'RARE',
        icon: 3,
        atk: 20,
        mag: 7,
        value: 70,
        desc: 'Coronado por un cristal ígneo que arde eternamente con calor místico.'
    },
    staff_dark: {
        id: 'staff_dark',
        name: 'Bastón del Vacío Abisal',
        type: 'weapon',
        weaponType: 'staff',
        classReq: 'mage',
        look: 1, // Aspecto 1: Hueso retorcido y orbe de vacío
        rarity: 'EPIC',
        icon: 13,
        atk: 28,
        mag: 11,
        value: 210,
        desc: 'Obsidiana retorcida que aprisiona un orbe del vacío entre garras huesudas.'
    },
    staff_legend: {
        id: 'staff_legend',
        name: 'Cetro de la Estrella Primordial',
        type: 'weapon',
        weaponType: 'staff',
        classReq: 'mage',
        look: 2, // Aspecto 2: Oro con alas y orbe radiante
        rarity: 'LEGENDARY',
        icon: 14,
        atk: 40,
        mag: 17,
        con: 5,
        value: 450,
        desc: 'Un fragmento de estrella coronado por alas de luz. Su orbe ilumina el abismo.'
    },

    // =========================================================================
    // ARMADURAS DE GUERRERO (SOLO GUERRERO - classReq: 'warrior')
    // =========================================================================
    armor_plate: {
        id: 'armor_plate',
        name: 'Peto de Hierro de Caballero',
        type: 'armor',
        armorType: 'plate',
        classReq: 'warrior',
        look: 0, // Aspecto 0: Hierro clásico con capa azul y pluma roja
        rarity: 'COMMON',
        icon: 4,
        def: 8,
        con: 3,
        value: 25,
        desc: 'Acero macizo pulido para desviar cortes y estocadas directas.'
    },
    armor_reinforced: {
        id: 'armor_reinforced',
        name: 'Cota de Acero Templado',
        type: 'armor',
        armorType: 'plate',
        classReq: 'warrior',
        look: 0, // Aspecto 0: Hierro reforzado
        rarity: 'RARE',
        icon: 4,
        def: 14,
        con: 5,
        value: 80,
        desc: 'Placas reforzadas que dispersan los golpes pesados de las bestias.'
    },
    armor_plate_dark: {
        id: 'armor_plate_dark',
        name: 'Peto de Obsidiana Infernal',
        type: 'armor',
        armorType: 'plate',
        classReq: 'warrior',
        look: 1, // Aspecto 1: Armadura oscura con cuernos y ojos rojos
        rarity: 'EPIC',
        icon: 15,
        def: 22,
        con: 8,
        str: 4,
        value: 220,
        desc: 'Placas volcánicas oscuras con púas y runas de lava que intimidan al enemigo.'
    },
    armor_abracadabra: {
        id: 'armor_abracadabra',
        name: 'Caparazón Virulento de Abracadabra',
        type: 'armor',
        armorType: 'plate',
        classReq: 'warrior',
        look: 1,
        rarity: 'EPIC',
        icon: 15,
        def: 24,
        con: 10,
        hp: 40,
        value: 260,
        desc: 'Coraza biológica con quitina endurecida que inmuniza al veneno.'
    },
    armor_plate_legend: {
        id: 'armor_plate_legend',
        name: 'Armadura del Paladín Solar',
        type: 'armor',
        armorType: 'plate',
        classReq: 'warrior',
        look: 2, // Aspecto 2: Oro divino con alas en el casco
        rarity: 'LEGENDARY',
        icon: 16,
        def: 34,
        con: 14,
        str: 6,
        value: 460,
        desc: 'Oro bendecido con alas en el yelmo y una gema celeste en el pecho.'
    },

    // =========================================================================
    // ARMADURAS DE ARQUERO (SOLO ARQUERO - classReq: 'archer')
    // =========================================================================
    armor_leather: {
        id: 'armor_leather',
        name: 'Jubón de Cuero Rígido',
        type: 'armor',
        armorType: 'leather',
        classReq: 'archer',
        look: 0, // Aspecto 0: Capucha y cuero verde
        rarity: 'COMMON',
        icon: 17,
        def: 5,
        dex: 2,
        value: 20,
        desc: 'Protección ligera de cuero que permite agilidad sin entorpecer los disparos.'
    },
    armor_leather_dark: {
        id: 'armor_leather_dark',
        name: 'Jubón de la Sombra Nocturna',
        type: 'armor',
        armorType: 'leather',
        classReq: 'archer',
        look: 1, // Aspecto 1: Cuero negro con púas
        rarity: 'EPIC',
        icon: 18,
        def: 15,
        dex: 7,
        con: 3,
        value: 200,
        desc: 'Cuero negro con capucha y hombreras de púas, ideal para acechar en la penumbra.'
    },
    armor_leather_legend: {
        id: 'armor_leather_legend',
        name: 'Manto Estelar del Fénix',
        type: 'armor',
        armorType: 'leather',
        classReq: 'archer',
        look: 2, // Aspecto 2: Manto marfil con bordes dorados
        rarity: 'LEGENDARY',
        icon: 19,
        def: 26,
        dex: 14,
        con: 6,
        value: 430,
        desc: 'Cuero marfil bordado en oro con una pluma divina en la capucha.'
    },

    // =========================================================================
    // ARMADURAS DE MAGO (SOLO MAGO - classReq: 'mage')
    // =========================================================================
    armor_robe: {
        id: 'armor_robe',
        name: 'Túnica de Sombras Astrales',
        type: 'armor',
        armorType: 'robe',
        classReq: 'mage',
        look: 0, // Aspecto 0: Túnica púrpura con sombrero puntiagudo
        rarity: 'COMMON',
        icon: 5,
        def: 4,
        mag: 3,
        value: 20,
        desc: 'Tejida con seda mística que absorbe parte del daño elemental.'
    },
    armor_robe_dark: {
        id: 'armor_robe_dark',
        name: 'Túnica del Vacío Carmesí',
        type: 'armor',
        armorType: 'robe',
        classReq: 'mage',
        look: 1, // Aspecto 1: Ropaje negro con cuernos de hueso en el sombrero
        rarity: 'EPIC',
        icon: 20,
        def: 12,
        mag: 9,
        con: 4,
        value: 210,
        desc: 'Seda negra con ribetes carmesí y sombrero con cuernos de hueso.'
    },
    armor_robe_legend: {
        id: 'armor_robe_legend',
        name: 'Vestiduras Celestiales del Archimago',
        type: 'armor',
        armorType: 'robe',
        classReq: 'mage',
        look: 2, // Aspecto 2: Vestiduras celestes con estrellas doradas
        rarity: 'LEGENDARY',
        icon: 21,
        def: 22,
        mag: 17,
        con: 7,
        value: 450,
        desc: 'Tejidas con polvo de estrellas y bordadas en oro. Cada pliegue irradia poder arcano.'
    },

    // =========================================================================
    // CONSUMIBLES Y MATERIALES
    // =========================================================================
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
        desc: 'Pelaje espeso e impermeable muy cotizado por armeros.'
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

const DROP_TABLES = {
    // 1. Ratas
    rat: [
        { id: 'potion_health', chance: 0.35 },
        { id: 'potion_mana', chance: 0.35 },
        { id: 'mat_bone', chance: 0.50 },
        { goldMin: 4, goldMax: 12 }
    ],

    // 2. Bandidos
    bandit: [
        { id: 'potion_health', chance: 0.35 },
        { id: 'potion_mana', chance: 0.30 },
        { id: 'sword_short', chance: 0.22 },
        { id: 'bow_short', chance: 0.22 },
        { id: 'staff_apprentice', chance: 0.25 },
        { id: 'armor_plate', chance: 0.16 },
        { id: 'armor_leather', chance: 0.16 },
        { id: 'armor_robe', chance: 0.18 },
        { goldMin: 8, goldMax: 22 }
    ],

    // 3. Esqueletos
    skeleton: [
        { id: 'mat_bone', chance: 0.70 },
        { id: 'potion_mana', chance: 0.30 },
        { id: 'sword_short', chance: 0.20 },
        { id: 'staff_apprentice', chance: 0.24 },
        { id: 'sword_broad', chance: 0.16 },
        { id: 'armor_reinforced', chance: 0.14 },
        { id: 'armor_robe', chance: 0.20 },
        { goldMin: 12, goldMax: 28 }
    ],

    // 4. Arañas
    spider: [
        { id: 'mat_silk', chance: 0.75 },
        { id: 'potion_health', chance: 0.35 },
        { id: 'potion_mana', chance: 0.40 },
        { id: 'staff_apprentice', chance: 0.24 },
        { id: 'bow_hunter', chance: 0.20 },
        { id: 'armor_robe', chance: 0.20 },
        { id: 'armor_leather', chance: 0.16 },
        { goldMin: 16, goldMax: 36 }
    ],

    // 5. Hombres Lobo
    werewolf: [
        { id: 'mat_pelt', chance: 0.80 },
        { id: 'potion_health', chance: 0.40 },
        { id: 'potion_mana', chance: 0.40 },
        { id: 'blade_demonic', chance: 0.14 },
        { id: 'bow_dark', chance: 0.14 },
        { id: 'staff_dark', chance: 0.20 },
        { id: 'armor_plate_dark', chance: 0.14 },
        { id: 'armor_leather_dark', chance: 0.14 },
        { id: 'armor_robe_dark', chance: 0.20 },
        { goldMin: 32, goldMax: 70 }
    ],

    // 6. Demonios Menores
    demon: [
        { id: 'mat_horn', chance: 0.75 },
        { id: 'potion_mana', chance: 0.55 },
        { id: 'potion_elixir', chance: 0.35 },
        { id: 'staff_dark', chance: 0.24 },
        { id: 'armor_robe_dark', chance: 0.22 },
        { id: 'staff_legend', chance: 0.06 },
        { id: 'sword_legend', chance: 0.04 },
        { id: 'bow_legend', chance: 0.04 },
        { goldMin: 55, goldMax: 120 }
    ],

    // 7. Sub-Jefe Lucian, el Primer Hombre Lobo (Piso 5)
    lucian: [
        { id: 'mat_pelt', chance: 1.0, qty: 3 },
        { id: 'blade_demonic', chance: 0.65 },
        { id: 'bow_dark', chance: 0.65 },
        { id: 'staff_dark', chance: 0.65 },
        { id: 'armor_plate_dark', chance: 0.50 },
        { id: 'armor_leather_dark', chance: 0.50 },
        { id: 'armor_robe_dark', chance: 0.50 },
        { id: 'potion_elixir', chance: 1.0, qty: 1 },
        { goldMin: 120, goldMax: 240 }
    ],

    // 8. Sub-Jefe Abracadabra (Piso 8)
    abracadabra: [
        { id: 'armor_abracadabra', chance: 1.0 },
        { id: 'staff_dark', chance: 0.80 },
        { id: 'armor_robe_dark', chance: 0.70 },
        { id: 'blade_demonic', chance: 0.50 },
        { id: 'bow_dark', chance: 0.50 },
        { id: 'potion_elixir', chance: 1.0, qty: 2 },
        { goldMin: 180, goldMax: 350 }
    ],

    // 9. Jefe Final Hong (Piso 10)
    hong: [
        { id: 'staff_legend', chance: 0.90 },
        { id: 'armor_robe_legend', chance: 0.90 },
        { id: 'sword_legend', chance: 0.60 },
        { id: 'bow_legend', chance: 0.60 },
        { id: 'armor_plate_legend', chance: 0.70 },
        { id: 'armor_leather_legend', chance: 0.70 },
        { goldMin: 500, goldMax: 1000 }
    ],

    // 10. Cofres Tempranos (Pisos 1-3)
    chest_early: [
        { id: 'staff_apprentice', chance: 0.40 },
        { id: 'armor_robe', chance: 0.35 },
        { id: 'sword_short', chance: 0.30 },
        { id: 'bow_short', chance: 0.30 },
        { id: 'potion_mana', chance: 0.75 },
        { id: 'potion_health', chance: 0.65 },
        { goldMin: 25, goldMax: 60 }
    ],

    // 11. Cofres Medios (Pisos 4-7)
    chest_mid: [
        { id: 'staff_inferno', chance: 0.35 },
        { id: 'staff_dark', chance: 0.30 },
        { id: 'armor_robe_dark', chance: 0.30 },
        { id: 'sword_broad', chance: 0.25 },
        { id: 'bow_hunter', chance: 0.25 },
        { id: 'potion_elixir', chance: 0.50 },
        { goldMin: 60, goldMax: 130 }
    ],

    // 12. Cofres Avanzados (Pisos 8-10)
    chest_late: [
        { id: 'staff_legend', chance: 0.35 },
        { id: 'armor_robe_legend', chance: 0.35 },
        { id: 'staff_dark', chance: 0.30 },
        { id: 'sword_legend', chance: 0.20 },
        { id: 'bow_legend', chance: 0.20 },
        { id: 'potion_elixir', chance: 0.80 },
        { goldMin: 140, goldMax: 300 }
    ],

    // 13. Cofres genéricos
    chest: [
        { id: 'sword_short', chance: 0.35 },
        { id: 'armor_plate', chance: 0.30 },
        { id: 'potion_health', chance: 0.70 },
        { goldMin: 30, goldMax: 80 }
    ],

    // 14. Barriles
    barrel: [
        { id: 'potion_mana', chance: 0.45 },
        { id: 'potion_health', chance: 0.35 },
        { id: 'staff_apprentice', chance: 0.15 },
        { id: 'mat_bone', chance: 0.15 },
        { goldMin: 5, goldMax: 18 }
    ]
};

function refreshItem(item) {
    if (!item || !item.id || !ITEM_DATABASE[item.id]) return item;
    const fresh = { ...ITEM_DATABASE[item.id] };
    if (item.qty !== undefined) fresh.qty = item.qty;
    return fresh;
}

window.ITEM_DATABASE = ITEM_DATABASE;
window.refreshItem = refreshItem;
window.ITEM_RARITIES = ITEM_RARITIES;
window.DROP_TABLES = DROP_TABLES;