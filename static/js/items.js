/**
 * SISTEMA DE ÍTEMS, RAREZAS, AFIJOS Y TABLAS DE BOTÍN AJUSTADAS
 */

const ITEM_RARITIES = {
    COMMON: { name: 'Común', color: '#b2bec3', class: 'rarity-common' },
    RARE: { name: 'Rara', color: '#3498db', class: 'rarity-rare' },
    EPIC: { name: 'Épica', color: '#9b59b6', class: 'rarity-epic' },
    LEGENDARY: { name: 'Legendaria', color: '#f1c40f', class: 'rarity-legendary' }
};

const ITEM_AFFIXES = [
    { suffix: 'de la Furia', str: 3, atk: 4, color: '#e74c3c' },
    { suffix: 'del Viento', dex: 4, atk: 2, color: '#2ecc71' },
    { suffix: 'del Sabio', mag: 4, atk: 3, color: '#9b59b6' },
    { suffix: 'del Coloso', con: 5, def: 3, color: '#f39c12' },
    { suffix: 'del Titán', str: 2, con: 3, def: 2, color: '#e67e22' },
    { suffix: 'Estelar', mag: 3, dex: 2, atk: 3, color: '#00d2d3' }
];

const ITEM_DATABASE = {
    // =========================================================================
    // ESPADAS (GUERRERO)
    // =========================================================================
    sword_short: {
        id: 'sword_short',
        name: 'Espada Corta de Acero',
        type: 'weapon',
        weaponType: 'sword',
        classReq: 'warrior',
        look: 0,
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
        look: 0,
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
        look: 1,
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
        look: 2,
        rarity: 'LEGENDARY',
        icon: 10,
        atk: 45,
        str: 14,
        con: 6,
        value: 450,
        desc: 'Mandoble titánico que irradia fuego purificador celeste contra las sombras.'
    },

    // =========================================================================
    // ARCOS (ARQUERO)
    // =========================================================================
    bow_short: {
        id: 'bow_short',
        name: 'Arco de Fresno Rústico',
        type: 'weapon',
        weaponType: 'bow',
        classReq: 'archer',
        look: 0,
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
        look: 0,
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
        look: 1,
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
        look: 2,
        rarity: 'LEGENDARY',
        icon: 12,
        atk: 42,
        dex: 15,
        value: 440,
        desc: 'Artefacto celestial de la aurora que envuelve cada disparo en fuego estelar.'
    },

    // =========================================================================
    // BASTONES (MAGO)
    // =========================================================================
    staff_apprentice: {
        id: 'staff_apprentice',
        name: 'Vara de Aprendiz Arcano',
        type: 'weapon',
        weaponType: 'staff',
        classReq: 'mage',
        look: 0,
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
        look: 0,
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
        look: 1,
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
        look: 2,
        rarity: 'LEGENDARY',
        icon: 14,
        atk: 40,
        mag: 17,
        con: 5,
        value: 450,
        desc: 'Un fragmento de estrella coronado por alas de luz. Su orbe ilumina el abismo.'
    },

    // =========================================================================
    // ARMADURAS DE GUERRERO
    // =========================================================================
    armor_plate: {
        id: 'armor_plate',
        name: 'Peto de Hierro de Caballero',
        type: 'armor',
        armorType: 'plate',
        classReq: 'warrior',
        look: 0,
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
        look: 0,
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
        look: 1,
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
        value: 260,
        desc: 'Coraza biológica con quitina endurecida que inmuniza al veneno.'
    },
    armor_plate_legend: {
        id: 'armor_plate_legend',
        name: 'Armadura del Paladín Solar',
        type: 'armor',
        armorType: 'plate',
        classReq: 'warrior',
        look: 2,
        rarity: 'LEGENDARY',
        icon: 16,
        def: 34,
        con: 14,
        str: 6,
        value: 460,
        desc: 'Oro bendecido con alas en el yelmo y una gema celeste en el pecho.'
    },

    // =========================================================================
    // ARMADURAS DE ARQUERO
    // =========================================================================
    armor_leather: {
        id: 'armor_leather',
        name: 'Jubón de Cuero Rígido',
        type: 'armor',
        armorType: 'leather',
        classReq: 'archer',
        look: 0,
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
        look: 1,
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
        look: 2,
        rarity: 'LEGENDARY',
        icon: 19,
        def: 26,
        dex: 14,
        con: 6,
        value: 430,
        desc: 'Cuero marfil bordado en oro con una pluma divina en la capucha.'
    },

    // =========================================================================
    // ARMADURAS DE MAGO
    // =========================================================================
    armor_robe: {
        id: 'armor_robe',
        name: 'Túnica de Sombras Astrales',
        type: 'armor',
        armorType: 'robe',
        classReq: 'mage',
        look: 0,
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
        look: 1,
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
        look: 2,
        rarity: 'LEGENDARY',
        icon: 21,
        def: 22,
        mag: 17,
        con: 7,
        value: 450,
        desc: 'Tejidas con polvo de estrellas y bordadas en oro. Cada pliegue irradia poder arcano.'
    },
    // Agrega esto dentro de ITEM_DATABASE en items.js:

    // =========================================================================
    // EQUIPO FORJABLE DE HUESO (TIER INTERMEDIO)
    // =========================================================================
    sword_bone: {
        id: 'sword_bone',
        name: 'Machete Dentado de Hueso',
        type: 'weapon',
        weaponType: 'sword',
        classReq: 'warrior',
        look: 0,
        rarity: 'RARE',
        icon: 0,
        atk: 20,
        str: 5,
        value: 90,
        desc: 'Forjada uniendo fémures afilados con resina oscura. Causa desgarros profundos.'
    },
    armor_bone_warrior: {
        id: 'armor_bone_warrior',
        name: 'Coraza de Costillas Reforzadas',
        type: 'armor',
        armorType: 'plate',
        classReq: 'warrior',
        look: 0,
        rarity: 'RARE',
        icon: 4,
        def: 16,
        con: 6,
        value: 100,
        desc: 'Caja torácica endurecida con fuego alquímico que cubre el torso.'
    },
    bow_bone: {
        id: 'bow_bone',
        name: 'Arco Compuesto de Hueso',
        type: 'weapon',
        weaponType: 'bow',
        classReq: 'archer',
        look: 0,
        rarity: 'RARE',
        icon: 2,
        atk: 18,
        dex: 6,
        value: 85,
        desc: 'Tallado en vértebras flexibles de bestia con gran tensión de disparo.'
    },
    armor_bone_archer: {
        id: 'armor_bone_archer',
        name: 'Pechera de Cuero Óseo',
        type: 'armor',
        armorType: 'leather',
        classReq: 'archer',
        look: 0,
        rarity: 'RARE',
        icon: 17,
        def: 11,
        dex: 5,
        con: 3,
        value: 95,
        desc: 'Placas de hueso pulido cosidas sobre cuero ligero.'
    },
    staff_bone: {
        id: 'staff_bone',
        name: 'Cetro del Nigromante',
        type: 'weapon',
        weaponType: 'staff',
        classReq: 'mage',
        look: 0,
        rarity: 'RARE',
        icon: 3,
        atk: 22,
        mag: 8,
        value: 95,
        desc: 'Coronado por un cráneo humano que susurra encantamientos arcanos.'
    },
    armor_bone_mage: {
        id: 'armor_bone_mage',
        name: 'Manto de Calaveras del Osario',
        type: 'armor',
        armorType: 'robe',
        classReq: 'mage',
        look: 0,
        rarity: 'RARE',
        icon: 5,
        def: 9,
        mag: 7,
        con: 4,
        value: 95,
        desc: 'Seda tejida con fragmentos de hueso rituales que absorben maná.'
    },

    // =========================================================================
    // EQUIPO FORJABLE DE LOBO (TIER AVANZADO / FERAL)
    // =========================================================================
    sword_wolf: {
        id: 'sword_wolf',
        name: 'Mandoble Colmillo de Lobo',
        type: 'weapon',
        weaponType: 'sword',
        classReq: 'warrior',
        look: 1,
        rarity: 'EPIC',
        icon: 1,
        atk: 30,
        str: 9,
        con: 4,
        value: 230,
        desc: 'Hoja dentada con colmillos de lobo alfa que desgarran armaduras.'
    },
    armor_wolf_warrior: {
        id: 'armor_wolf_warrior',
        name: 'Coraza de Piel Feral Alfa',
        type: 'armor',
        armorType: 'plate',
        classReq: 'warrior',
        look: 1,
        rarity: 'EPIC',
        icon: 15,
        def: 24,
        con: 9,
        str: 4,
        value: 240,
        desc: 'Pieles gruesas acolchadas bajo placas de hierro fundido.'
    },
    bow_wolf: {
        id: 'bow_wolf',
        name: 'Arco de Tendón de Lobo Ártico',
        type: 'weapon',
        weaponType: 'bow',
        classReq: 'archer',
        look: 1,
        rarity: 'EPIC',
        icon: 11,
        atk: 28,
        dex: 10,
        value: 220,
        desc: 'Tensado con tendones de bestia feral. Sus flechas silban con la furia del viento.'
    },
    armor_wolf_archer: {
        id: 'armor_wolf_archer',
        name: 'Jubón del Cazador de Manada',
        type: 'armor',
        armorType: 'leather',
        classReq: 'archer',
        look: 1,
        rarity: 'EPIC',
        icon: 18,
        def: 17,
        dex: 8,
        con: 4,
        value: 230,
        desc: 'Manto de piel de lobo con capucha que camufla el olor del portador.'
    },
    staff_wolf: {
        id: 'staff_wolf',
        name: 'Báculo del Chamán Aullador',
        type: 'weapon',
        weaponType: 'staff',
        classReq: 'mage',
        look: 1,
        rarity: 'EPIC',
        icon: 13,
        atk: 30,
        mag: 12,
        value: 235,
        desc: 'Madera de tejo adornada con garras y runas de lobos espectrales.'
    },
    armor_wolf_mage: {
        id: 'armor_wolf_mage',
        name: 'Túnica de Piel Invernal',
        type: 'armor',
        armorType: 'robe',
        classReq: 'mage',
        look: 1,
        rarity: 'EPIC',
        icon: 20,
        def: 14,
        mag: 10,
        con: 5,
        value: 230,
        desc: 'Tejido rúnico forrado en piel de bestia que protege contra las heladas.'
    },

    // MATERIALES: Ahora cada uno tiene su propio icono
    mat_bone: {
        id: 'mat_bone',
        name: 'Fragmento de Hueso Maldito',
        type: 'material',
        rarity: 'COMMON',
        icon: 8, // Icono de hueso detallado
        value: 8,
        desc: 'Huesos malditos animados por magia oscura. Muy cotizados para la forja.'
    },
    mat_silk: {
        id: 'mat_silk',
        name: 'Seda de Araña Gigante',
        type: 'material',
        rarity: 'COMMON',
        icon: 22, // Icono de madeja de seda
        value: 12,
        desc: 'Hilos extraordinariamente resistentes y ligeros.'
    },
    mat_pelt: {
        id: 'mat_pelt',
        name: 'Piel de Hombre Lobo',
        type: 'material',
        rarity: 'RARE',
        icon: 23, // Icono de piel de lobo extendida
        value: 25,
        desc: 'Pelaje espeso e impermeable para corazas y jubones ferales.'
    },
    mat_horn: {
        id: 'mat_horn',
        name: 'Cuerno de Demonio',
        type: 'material',
        rarity: 'EPIC',
        icon: 24, // Icono de cuerno curvado
        value: 45,
        desc: 'Resuena con energía infernal latente.'
    },
    dungeon_key: {
        id: 'dungeon_key',
        name: 'Llave de Mazmorra Forjada',
        type: 'key',
        rarity: 'EPIC',
        icon: 25, // Icono de llave dorada brillante
        value: 80,
        desc: 'Llave dorada que desbloquea la puerta reforzada de la sala del tesoro.'
    },

    // EQUIPO DE HUESO (ICONOS 26 a 29)
    sword_bone: { id: 'sword_bone', name: 'Machete Dentado de Hueso', type: 'weapon', weaponType: 'sword', classReq: 'warrior', look: 0, rarity: 'RARE', icon: 26, atk: 20, str: 5, value: 90, desc: 'Forjada con fémures afilados. Causa heridas desgarradoras.' },
    bow_bone: { id: 'bow_bone', name: 'Arco Compuesto de Hueso', type: 'weapon', weaponType: 'bow', classReq: 'archer', look: 0, rarity: 'RARE', icon: 27, atk: 18, dex: 6, value: 85, desc: 'Tallado en vértebras de bestia con gran tensión de tiro.' },
    staff_bone: { id: 'staff_bone', name: 'Cetro del Nigromante', type: 'weapon', weaponType: 'staff', classReq: 'mage', look: 0, rarity: 'RARE', icon: 28, atk: 22, mag: 8, value: 95, desc: 'Coronado por un cráneo que canaliza maná espectral.' },
    armor_bone_warrior: { id: 'armor_bone_warrior', name: 'Coraza de Costillas Reforzadas', type: 'armor', armorType: 'plate', classReq: 'warrior', look: 0, rarity: 'RARE', icon: 29, def: 16, con: 6, value: 100, desc: 'Caja torácica endurecida que cubre el torso.' },
    armor_bone_archer: { id: 'armor_bone_archer', name: 'Pechera de Cuero Óseo', type: 'armor', armorType: 'leather', classReq: 'archer', look: 0, rarity: 'RARE', icon: 29, def: 11, dex: 5, con: 3, value: 95, desc: 'Placas de hueso cosidas sobre cuero flexible.' },
    armor_bone_mage: { id: 'armor_bone_mage', name: 'Manto de Calaveras del Osario', type: 'armor', armorType: 'robe', classReq: 'mage', look: 0, rarity: 'RARE', icon: 29, def: 9, mag: 7, con: 4, value: 95, desc: 'Seda ritual con fragmentos óseos protectores.' },

    // EQUIPO DE LOBO (ICONOS 30 a 33)
    sword_wolf: { id: 'sword_wolf', name: 'Mandoble Colmillo de Lobo', type: 'weapon', weaponType: 'sword', classReq: 'warrior', look: 1, rarity: 'EPIC', icon: 30, atk: 30, str: 9, con: 4, value: 230, desc: 'Hoja dentada con colmillos de lobo alfa que desgarran armaduras.' },
    bow_wolf: { id: 'bow_wolf', name: 'Arco de Tendón de Lobo Ártico', type: 'weapon', weaponType: 'bow', classReq: 'archer', look: 1, rarity: 'EPIC', icon: 31, atk: 28, dex: 10, value: 220, desc: 'Tensado con tendones de lobo feral. Disparos rápidos y cortantes.' },
    staff_wolf: { id: 'staff_wolf', name: 'Báculo del Chamán Aullador', type: 'weapon', weaponType: 'staff', classReq: 'mage', look: 1, rarity: 'EPIC', icon: 32, atk: 30, mag: 12, value: 235, desc: 'Madera oscura adornada con garras y runas de lobos espectrales.' },
    armor_wolf_warrior: { id: 'armor_wolf_warrior', name: 'Coraza de Piel Feral Alfa', type: 'armor', armorType: 'plate', classReq: 'warrior', look: 1, rarity: 'EPIC', icon: 33, def: 24, con: 9, str: 4, value: 240, desc: 'Pieles de bestia acolchadas bajo placas de acero.' },
    armor_wolf_archer: { id: 'armor_wolf_archer', name: 'Jubón del Cazador de Manada', type: 'armor', armorType: 'leather', classReq: 'archer', look: 1, rarity: 'EPIC', icon: 33, def: 17, dex: 8, con: 4, value: 230, desc: 'Manto de piel de lobo que otorga sigilo y agilidad.' },
    armor_wolf_mage: { id: 'armor_wolf_mage', name: 'Túnica de Piel Invernal', type: 'armor', armorType: 'robe', classReq: 'mage', look: 1, rarity: 'EPIC', icon: 33, def: 14, mag: 10, con: 5, value: 230, desc: 'Tejido rúnico forrado en piel que aísla de cualquier daño elemental.' },

    // =========================================================================
    // OBJETOS VARIOS Y CONSUMIBLES
    // =========================================================================
    dungeon_key: {
        id: 'dungeon_key',
        name: 'Llave de Mazmorra Forjada',
        type: 'key',
        rarity: 'EPIC',
        icon: 8,
        value: 80,
        desc: 'Llave dorada que desbloquea la puerta reforzada de la sala del tesoro del piso.'
    },
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
        desc: 'Material de herrería para reforzar armaduras y armas.'
    },
    mat_silk: {
        id: 'mat_silk',
        name: 'Seda de Araña Gigante',
        type: 'material',
        rarity: 'COMMON',
        icon: 8,
        value: 12,
        desc: 'Material de herrería ligero para equipo de arquero y mago.'
    },
    mat_pelt: {
        id: 'mat_pelt',
        name: 'Piel de Hombre Lobo',
        type: 'material',
        rarity: 'RARE',
        icon: 8,
        value: 25,
        desc: 'Pelaje de bestia muy resistente para reforzado avanzado.'
    },
    mat_horn: {
        id: 'mat_horn',
        name: 'Cuerno de Demonio',
        type: 'material',
        rarity: 'EPIC',
        icon: 8,
        value: 45,
        desc: 'Material superior de forja demoníaca.'
    }

};

// =============================================================================
// TABLAS DE BOTÍN AJUSTADAS (PROBABILIDADES NORMALIZADAS Y REDUCIDAS)
// =============================================================================
const DROP_TABLES = {
    // 1. Ratas: solo oro, huesos y rara vez poción (sin armas)
    rat: [
        { id: 'mat_bone', chance: 0.25 },
        { id: 'potion_health', chance: 0.12 },
        { goldMin: 4, goldMax: 10 }
    ],

    // 2. Bandidos: materiales, oro, pociones y armas básicas (chance baja 6-8%)
    bandit: [
        { id: 'potion_health', chance: 0.18 },
        { id: 'sword_short', chance: 0.08 },
        { id: 'bow_short', chance: 0.08 },
        { id: 'staff_apprentice', chance: 0.08 },
        { id: 'armor_plate', chance: 0.06 },
        { id: 'armor_leather', chance: 0.06 },
        { id: 'armor_robe', chance: 0.06 },
        { goldMin: 8, goldMax: 18 }
    ],

    // 3. Esqueletos: huesos, poción de maná y equipo raro bajo (~6%)
    skeleton: [
        { id: 'mat_bone', chance: 0.40 },
        { id: 'potion_mana', chance: 0.18 },
        { id: 'sword_broad', chance: 0.06 },
        { id: 'armor_reinforced', chance: 0.06 },
        { goldMin: 10, goldMax: 22 }
    ],

    // 4. Arañas: seda, poción y armas raras (~5%)
    spider: [
        { id: 'mat_silk', chance: 0.45 },
        { id: 'potion_health', chance: 0.16 },
        { id: 'bow_hunter', chance: 0.06 },
        { id: 'staff_inferno', chance: 0.05 },
        { goldMin: 12, goldMax: 26 }
    ],

    // 5. Hombres Lobo (pisos medios): pieles, elixires y ÉPICAS EXACTAMENTE AL 10%
    werewolf: [
        { id: 'mat_pelt', chance: 0.50 },
        { id: 'potion_elixir', chance: 0.12 },
        { id: 'blade_demonic', chance: 0.10 },
        { id: 'bow_dark', chance: 0.10 },
        { id: 'staff_dark', chance: 0.10 },
        { id: 'armor_plate_dark', chance: 0.10 },
        { id: 'armor_leather_dark', chance: 0.10 },
        { id: 'armor_robe_dark', chance: 0.10 },
        { goldMin: 22, goldMax: 50 }
    ],

    // 6. Demonios (pisos altos): cuernos, ÉPICAS AL 10% Y LEGENDARIAS EXACTAMENTE AL 1%
    demon: [
        { id: 'mat_horn', chance: 0.45 },
        { id: 'potion_elixir', chance: 0.15 },
        { id: 'blade_demonic', chance: 0.10 },
        { id: 'staff_dark', chance: 0.10 },
        { id: 'sword_legend', chance: 0.01 },
        { id: 'bow_legend', chance: 0.01 },
        { id: 'staff_legend', chance: 0.01 },
        { id: 'armor_plate_legend', chance: 0.01 },
        { id: 'armor_leather_legend', chance: 0.01 },
        { id: 'armor_robe_legend', chance: 0.01 },
        { goldMin: 35, goldMax: 75 }
    ],

    // 7. JEFES: 60% DE PROBABILIDAD DE DROPEAR EQUIPO SUPERIOR
    lucian: [
        { id: 'mat_pelt', chance: 1.0, qty: 3 },
        { id: 'potion_elixir', chance: 1.0, qty: 2 },
        { id: 'blade_demonic', chance: 0.60 },
        { id: 'bow_dark', chance: 0.60 },
        { id: 'staff_dark', chance: 0.60 },
        { goldMin: 150, goldMax: 280 }
    ],

    abracadabra: [
        { id: 'potion_elixir', chance: 1.0, qty: 2 },
        { id: 'armor_plate_dark', chance: 0.60 },
        { id: 'armor_leather_dark', chance: 0.60 },
        { id: 'armor_robe_dark', chance: 0.60 },
        { goldMin: 180, goldMax: 320 }
    ],

    hong: [
        { id: 'potion_elixir', chance: 1.0, qty: 4 },
        { id: 'sword_legend', chance: 0.60 },
        { id: 'bow_legend', chance: 0.60 },
        { id: 'staff_legend', chance: 0.60 },
        { id: 'armor_plate_legend', chance: 0.60 },
        { id: 'armor_leather_legend', chance: 0.60 },
        { id: 'armor_robe_legend', chance: 0.60 },
        { goldMin: 500, goldMax: 1000 }
    ],

    // Cofres
    chest_early: [
        { id: 'sword_short', chance: 0.15 },
        { id: 'bow_short', chance: 0.15 },
        { id: 'potion_health', chance: 0.40 },
        { id: 'potion_mana', chance: 0.40 },
        { goldMin: 20, goldMax: 45 }
    ],
    chest_mid: [
        { id: 'blade_demonic', chance: 0.10 },
        { id: 'bow_dark', chance: 0.10 },
        { id: 'staff_dark', chance: 0.10 },
        { id: 'potion_elixir', chance: 0.35 },
        { goldMin: 45, goldMax: 90 }
    ],
    chest_late: [
        { id: 'blade_demonic', chance: 0.10 },
        { id: 'sword_legend', chance: 0.01 },
        { id: 'bow_legend', chance: 0.01 },
        { id: 'staff_legend', chance: 0.01 },
        { id: 'potion_elixir', chance: 0.50 },
        { goldMin: 90, goldMax: 180 }
    ],
    chest: [
        { id: 'sword_short', chance: 0.15 },
        { id: 'potion_health', chance: 0.40 },
        { goldMin: 20, goldMax: 50 }
    ],
    barrel: [
        { id: 'potion_health', chance: 0.20 },
        { id: 'potion_mana', chance: 0.20 },
        { id: 'mat_bone', chance: 0.25 },
        { goldMin: 4, goldMax: 14 }
    ]
};

function applyRandomAffix(baseItem) {
    if (!baseItem) return baseItem;
    const item = { ...baseItem };

    if ((item.type === 'weapon' || item.type === 'armor') && item.rarity !== 'COMMON') {
        const chance = item.rarity === 'LEGENDARY' ? 0.60 : (item.rarity === 'EPIC' ? 0.35 : 0.20);
        if (Math.random() < chance) {
            const affix = ITEM_AFFIXES[Math.floor(Math.random() * ITEM_AFFIXES.length)];
            item.name = `${item.name} ${affix.suffix}`;
            if (affix.str) item.str = (item.str || 0) + affix.str;
            if (affix.dex) item.dex = (item.dex || 0) + affix.dex;
            if (affix.mag) item.mag = (item.mag || 0) + affix.mag;
            if (affix.con) item.con = (item.con || 0) + affix.con;
            if (affix.atk) item.atk = (item.atk || 0) + affix.atk;
            if (affix.def) item.def = (item.def || 0) + affix.def;
            item.affix = affix.suffix;
            item.value = Math.floor(item.value * 1.35);
        }
    }
    return item;
}

// RECETAS DE FABRICACIÓN PARA EL HERRERO
const BLACKSMITH_RECIPES = [
    // 1. Set de Hueso
    {
        resultId: { warrior: 'sword_bone', archer: 'bow_bone', mage: 'staff_bone' },
        name: 'Arma de Hueso Reforzada',
        type: 'weapon',
        costGold: 60,
        materials: [{ id: 'mat_bone', qty: 4 }],
        desc: 'Requiere 4x Fragmentos de Hueso y 60 G.'
    },
    {
        resultId: { warrior: 'armor_bone_warrior', archer: 'armor_bone_archer', mage: 'armor_bone_mage' },
        name: 'Armadura de Costillas y Cuero',
        type: 'armor',
        costGold: 75,
        materials: [{ id: 'mat_bone', qty: 5 }],
        desc: 'Requiere 5x Fragmentos de Hueso y 75 G.'
    },
    // 2. Set de Lobo Feral
    {
        resultId: { warrior: 'sword_wolf', archer: 'bow_wolf', mage: 'staff_wolf' },
        name: 'Arma de Colmillo de Lobo Alfa',
        type: 'weapon',
        costGold: 140,
        materials: [{ id: 'mat_pelt', qty: 3 }, { id: 'mat_bone', qty: 2 }],
        desc: 'Requiere 3x Pieles de Lobo, 2x Huesos y 140 G.'
    },
    {
        resultId: { warrior: 'armor_wolf_warrior', archer: 'armor_wolf_archer', mage: 'armor_wolf_mage' },
        name: 'Armadura de Piel Feral',
        type: 'armor',
        costGold: 160,
        materials: [{ id: 'mat_pelt', qty: 4 }],
        desc: 'Requiere 4x Pieles de Lobo y 160 G.'
    }
];



function refreshItem(item) {
    if (!item || !item.id || !ITEM_DATABASE[item.id]) return item;
    const fresh = { ...ITEM_DATABASE[item.id], ...item };
    return fresh;
}

window.ITEM_DATABASE = ITEM_DATABASE;
window.refreshItem = refreshItem;
window.applyRandomAffix = applyRandomAffix;
window.ITEM_RARITIES = ITEM_RARITIES;
window.DROP_TABLES = DROP_TABLES;
window.BLACKSMITH_RECIPES = BLACKSMITH_RECIPES;