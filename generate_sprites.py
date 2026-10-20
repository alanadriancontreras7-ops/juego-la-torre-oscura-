"""
Generador de Sprites Pixel Art 16-Bit para 'La Torre Oscura'
Crea spritesheets en formato PNG con fondo transparente, contornos oscuros
y proporciones legibles al estilo Pokémon / RPGs de 16-bit (GBA / SNES).
"""

import os
# pyrefly: ignore[missing-import]
from PIL import Image, ImageDraw

ASSETS_DIR = os.path.join(os.path.dirname(__file__), 'static', 'assets', 'sprites')
os.makedirs(ASSETS_DIR, exist_ok=True)

OUTLINE = (18, 18, 24, 255)
TRANSPARENT = (0, 0, 0, 0)

def create_canvas(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))

def rect(draw, x, y, w, h, fill, outline=None):
    draw.rectangle([x, y, x + w - 1, y + h - 1], fill=fill, outline=outline)

def ellipse(draw, x, y, w, h, fill, outline=None):
    draw.ellipse([x, y, x + w - 1, y + h - 1], fill=fill, outline=outline)

# ==============================================================================
# 1. GENERADOR DE JUGADORES (Guerrera, Arquero, Mago)
# 4 Direcciones: Abajo (0), Izquierda (1), Derecha (2), Arriba (3)
# 4 Frames de Caminata (0: quieto, 1: paso izq, 2: neutro, 3: paso der) + 2 Frames Ataque
# Tamaño de celda: 48x48
# ==============================================================================

def draw_warrior_frame(direction, anim_frame, is_attack=False):
    """Guerrera: Armadura de placas de hierro pulido con brillos especulares, casco de caballero con visor y pluma, espada de acero afilada y escudo heráldico."""
    img = create_canvas(48, 48)
    d = ImageDraw.Draw(img)
    
    # Desplazamiento por animación
    leg_offset = 0
    bob_y = 0
    if not is_attack:
        if anim_frame in (1, 3):
            bob_y = -1
            leg_offset = 2 if anim_frame == 1 else -2
    
    cx, cy = 24, 25 + bob_y
    
    # Paleta Guerrera - Placas de Acero y Reflejos
    STEEL_WHITE = (248, 252, 255, 255)
    STEEL_LIGHT = (220, 230, 245, 255)
    STEEL_MID = (155, 172, 195, 255)
    STEEL_DARK = (90, 105, 130, 255)
    STEEL_SHADOW = (55, 65, 85, 255)
    GOLD_BRIGHT = (255, 225, 75, 255)
    GOLD_TRIM = (215, 165, 45, 255)
    GOLD_DARK = (145, 105, 25, 255)
    BLUE_CAPE = (35, 65, 130, 255)
    BLUE_CAPE_SHADOW = (20, 38, 80, 255)
    HAIR_PLUME = (215, 55, 45, 255)
    HAIR_PLUME_LIGHT = (255, 100, 75, 255)
    SKIN_BASE = (245, 195, 160, 255)
    SKIN_SHADOW = (205, 145, 110, 255)
    
    # Sombra sutil bajo los pies (suelo)
    ellipse(d, cx - 8, cy + 15, 16, 5, (10, 10, 16, 110))

    # Piernas / Botas de placas articuladas con brillo
    if direction in (0, 3): # Frente / Espalda
        rect(d, cx - 6, cy + 8, 4, 10, STEEL_MID, OUTLINE)
        rect(d, cx + 2, cy + 8, 4, 10, STEEL_MID, OUTLINE)
        # Brillos en espinilleras
        d.line([(cx - 5, cy + 9), (cx - 5, cy + 14)], fill=STEEL_LIGHT)
        d.line([(cx + 3, cy + 9), (cx + 3, cy + 14)], fill=STEEL_LIGHT)
        rect(d, cx - 7, cy + 16, 5, 2, STEEL_DARK, OUTLINE) # Punta bota izq
        rect(d, cx + 2, cy + 16, 5, 2, STEEL_DARK, OUTLINE) # Punta bota der
        if leg_offset != 0:
            rect(d, cx - 6, cy + 8 + (1 if leg_offset > 0 else -1), 4, 10, STEEL_LIGHT, OUTLINE)
            rect(d, cx + 2, cy + 8 + (-1 if leg_offset > 0 else 1), 4, 10, STEEL_SHADOW, OUTLINE)
    elif direction == 1: # Izquierda
        rect(d, cx - 4 + leg_offset, cy + 8, 5, 10, STEEL_MID, OUTLINE)
        rect(d, cx - 1 - leg_offset, cy + 9, 4, 9, STEEL_SHADOW, OUTLINE)
        d.line([(cx - 3 + leg_offset, cy + 9), (cx - 3 + leg_offset, cy + 14)], fill=STEEL_LIGHT)
        rect(d, cx - 6 + leg_offset, cy + 16, 6, 2, STEEL_DARK, OUTLINE)
    elif direction == 2: # Derecha
        rect(d, cx - 1 - leg_offset, cy + 9, 4, 9, STEEL_SHADOW, OUTLINE)
        rect(d, cx - 1 + leg_offset, cy + 8, 5, 10, STEEL_MID, OUTLINE)
        d.line([(cx + leg_offset, cy + 9), (cx + leg_offset, cy + 14)], fill=STEEL_LIGHT)
        rect(d, cx + leg_offset, cy + 16, 6, 2, STEEL_DARK, OUTLINE)

    # Capa ondeante (atrás si mira al frente o lados)
    if direction != 3:
        rect(d, cx - 7, cy - 1, 14, 13, BLUE_CAPE, OUTLINE)
        rect(d, cx - 8, cy + 4, 3, 9, BLUE_CAPE_SHADOW)
        rect(d, cx + 5, cy + 4, 3, 9, BLUE_CAPE_SHADOW)
        d.line([(cx - 6, cy + 11), (cx + 6, cy + 11)], fill=GOLD_TRIM)
    
    # Torso (Peto de placas de hierro modelado)
    rect(d, cx - 6, cy - 2, 12, 11, STEEL_MID, OUTLINE)
    # Relieve y brillo de peto metálico
    rect(d, cx - 4, cy - 1, 8, 6, STEEL_LIGHT)
    d.line([(cx - 3, cy), (cx - 1, cy)], fill=STEEL_WHITE) # Reflejo blanco especular
    d.line([(cx - 4, cy + 5), (cx + 3, cy + 5)], fill=STEEL_SHADOW) # Sombra bajo pectoral
    rect(d, cx - 6, cy + 6, 12, 3, GOLD_TRIM, OUTLINE) # Cinturón dorado
    rect(d, cx - 1, cy + 6, 2, 3, GOLD_BRIGHT) # Hebilla de oro

    # Hombreras de placas de acero (Pauldrons)
    rect(d, cx - 9, cy - 2, 4, 5, STEEL_LIGHT, OUTLINE)
    rect(d, cx + 5, cy - 2, 4, 5, STEEL_LIGHT, OUTLINE)
    d.point((cx - 8, cy - 1), fill=STEEL_WHITE)
    d.point((cx + 6, cy - 1), fill=STEEL_WHITE)
    
    # Cabeza y Casco de caballero
    if direction == 0: # Mirando al frente
        # Rostro bajo el visor alzado
        rect(d, cx - 5, cy - 11, 10, 9, SKIN_BASE, OUTLINE)
        rect(d, cx - 5, cy - 6, 10, 4, SKIN_SHADOW)
        # Ojos definidos
        d.point((cx - 3, cy - 8), fill=(25, 20, 30, 255))
        d.point((cx + 2, cy - 8), fill=(25, 20, 30, 255))
        # Casco con visera y brillo
        rect(d, cx - 6, cy - 15, 12, 6, STEEL_MID, OUTLINE)
        d.line([(cx - 5, cy - 14), (cx + 4, cy - 14)], fill=STEEL_LIGHT)
        d.line([(cx - 4, cy - 14), (cx - 2, cy - 14)], fill=STEEL_WHITE) # Destello en casco
        # Ranura de visor
        rect(d, cx - 5, cy - 10, 10, 2, STEEL_DARK, OUTLINE)
        # Pluma de guerra roja y dorada
        rect(d, cx - 2, cy - 20, 4, 6, HAIR_PLUME, OUTLINE)
        rect(d, cx - 1, cy - 19, 2, 3, HAIR_PLUME_LIGHT)
    elif direction == 3: # Mirando atrás
        rect(d, cx - 6, cy - 15, 12, 13, STEEL_DARK, OUTLINE)
        d.line([(cx - 4, cy - 13), (cx + 3, cy - 13)], fill=STEEL_MID)
        rect(d, cx - 2, cy - 20, 4, 8, HAIR_PLUME, OUTLINE)
        rect(d, cx - 1, cy - 18, 2, 4, HAIR_PLUME_LIGHT)
        rect(d, cx - 6, cy - 2, 12, 14, BLUE_CAPE, OUTLINE) # Capa ondeante trasera
        rect(d, cx - 4, cy + 1, 8, 10, BLUE_CAPE_SHADOW)
    elif direction in (1, 2): # Lado
        sgn = -1 if direction == 1 else 1
        rect(d, cx - 5 * sgn, cy - 11, 9, 9, SKIN_BASE, OUTLINE)
        d.point((cx + 2 * sgn, cy - 8), fill=(25, 20, 30, 255))
        rect(d, cx - 6, cy - 15, 12, 6, STEEL_MID, OUTLINE)
        d.line([(cx - 4, cy - 14), (cx + 3, cy - 14)], fill=STEEL_LIGHT)
        rect(d, cx - 3 * sgn, cy - 20, 4, 7, HAIR_PLUME, OUTLINE)
        rect(d, cx - 2 * sgn, cy - 18, 2, 4, HAIR_PLUME_LIGHT)

    # Armas: Escudo y Espada
    if not is_attack:
        if direction == 0: # Frente
            # Escudo de heráldica con borde dorado
            rect(d, cx - 12, cy - 2, 7, 12, BLUE_CAPE, OUTLINE)
            rect(d, cx - 11, cy - 1, 5, 10, STEEL_MID)
            rect(d, cx - 10, cy + 2, 3, 5, GOLD_TRIM) # Blasón dorado
            d.line([(cx - 11, cy - 1), (cx - 7, cy - 1)], fill=GOLD_BRIGHT)
            # Espada de acero en mano derecha
            rect(d, cx + 7, cy, 3, 11, STEEL_LIGHT, OUTLINE)
            d.point((cx + 8, cy + 2), fill=STEEL_WHITE) # Brillo en hoja
            rect(d, cx + 5, cy - 1, 7, 2, GOLD_TRIM, OUTLINE) # Guarda dorada
            rect(d, cx + 7, cy - 3, 3, 3, STEEL_DARK, OUTLINE) # Empuñadura
            d.point((cx + 8, cy - 4), fill=GOLD_BRIGHT) # Pomo
        elif direction == 1: # Izquierda
            rect(d, cx - 10, cy - 2, 6, 12, BLUE_CAPE, OUTLINE)
            rect(d, cx - 9, cy - 1, 4, 9, STEEL_MID)
            rect(d, cx - 8, cy + 2, 2, 4, GOLD_TRIM)
        elif direction == 2: # Derecha
            rect(d, cx + 6, cy - 2, 3, 12, STEEL_LIGHT, OUTLINE)
            d.point((cx + 7, cy), fill=STEEL_WHITE)
            rect(d, cx + 4, cy - 3, 7, 2, GOLD_TRIM, OUTLINE)
            rect(d, cx + 6, cy - 5, 3, 3, STEEL_DARK, OUTLINE)
        elif direction == 3: # Espalda
            rect(d, cx - 11, cy - 1, 6, 11, BLUE_CAPE, OUTLINE)
            rect(d, cx + 7, cy - 1, 3, 11, STEEL_DARK, OUTLINE)
    else:
        # Modo Ataque con Espadazo y Arco de Corte Luminoso
        if direction in (0, 2): # Frente o Derecha
            # Espada empuñada con destello
            rect(d, cx + 6, cy - 8, 16, 4, STEEL_LIGHT, OUTLINE)
            d.line([(cx + 8, cy - 7), (cx + 20, cy - 7)], fill=STEEL_WHITE)
            rect(d, cx + 4, cy - 10, 3, 8, GOLD_TRIM, OUTLINE)
            # Arco semicircular de corte brillante
            arc_color = (200, 240, 255, 230)
            arc_glow = (120, 200, 255, 180)
            ellipse(d, cx + 6, cy - 16, 20, 22, None, arc_glow)
            ellipse(d, cx + 8, cy - 14, 18, 18, None, arc_color)
            d.point((cx + 22, cy - 10), fill=(255, 255, 255, 255))
        elif direction == 1: # Izquierda
            rect(d, cx - 22, cy - 8, 16, 4, STEEL_LIGHT, OUTLINE)
            d.line([(cx - 20, cy - 7), (cx - 8, cy - 7)], fill=STEEL_WHITE)
            rect(d, cx - 7, cy - 10, 3, 8, GOLD_TRIM, OUTLINE)
            ellipse(d, cx - 26, cy - 16, 20, 22, None, (120, 200, 255, 180))
            ellipse(d, cx - 24, cy - 14, 18, 18, None, (200, 240, 255, 230))
        elif direction == 3: # Arriba
            rect(d, cx + 2, cy - 22, 4, 16, STEEL_LIGHT, OUTLINE)
            d.line([(cx + 3, cy - 20), (cx + 3, cy - 8)], fill=STEEL_WHITE)
            rect(d, cx, cy - 6, 8, 3, GOLD_TRIM, OUTLINE)
            ellipse(d, cx - 8, cy - 24, 22, 20, None, (120, 200, 255, 180))
            ellipse(d, cx - 6, cy - 22, 18, 18, None, (200, 240, 255, 230))
            
    return img

def draw_archer_frame(direction, anim_frame, is_attack=False):
    """Arquero: Capucha verde esmeralda, túnica de cuero, carcaj y arco."""
    img = create_canvas(48, 48)
    d = ImageDraw.Draw(img)
    
    leg_offset = 0
    bob_y = 0
    if not is_attack and anim_frame in (1, 3):
        bob_y = -1
        leg_offset = 2 if anim_frame == 1 else -2
        
    cx, cy = 24, 25 + bob_y
    
    # Paleta Arquero
    CLOAK_GREEN = (45, 115, 60, 255)
    CLOAK_DARK = (28, 75, 40, 255)
    LEATHER_BROWN = (125, 80, 45, 255)
    BOOT_BROWN = (80, 50, 30, 255)
    BOW_WOOD = (155, 100, 50, 255)
    SKIN_BASE = (245, 195, 160, 255)
    
    # Piernas
    rect(d, cx - 5 + leg_offset, cy + 9, 4, 9, BOOT_BROWN, OUTLINE)
    rect(d, cx + 1 - leg_offset, cy + 9, 4, 9, BOOT_BROWN, OUTLINE)
    
    # Capucha caída / capa
    if direction != 3:
        rect(d, cx - 7, cy - 2, 14, 11, CLOAK_DARK, OUTLINE)
    
    # Túnica de cuero
    rect(d, cx - 5, cy - 2, 10, 10, LEATHER_BROWN, OUTLINE)
    rect(d, cx - 4, cy + 5, 8, 3, BOOT_BROWN, OUTLINE) # Cinturón
    
    # Cabeza y Caperuza Verde
    if direction == 0: # Frente
        rect(d, cx - 5, cy - 12, 10, 10, SKIN_BASE, OUTLINE)
        rect(d, cx - 6, cy - 14, 12, 6, CLOAK_GREEN, OUTLINE)
        d.point((cx - 3, cy - 8), fill=OUTLINE)
        d.point((cx + 2, cy - 8), fill=OUTLINE)
    elif direction == 3: # Espalda
        rect(d, cx - 6, cy - 14, 12, 12, CLOAK_GREEN, OUTLINE)
        # Carcaj con flechas
        rect(d, cx - 3, cy - 8, 4, 10, LEATHER_BROWN, OUTLINE)
        d.point((cx - 2, cy - 10), fill=(210, 210, 210, 255))
        d.point((cx, cy - 11), fill=(210, 210, 210, 255))
    elif direction in (1, 2):
        if direction == 1: # Izquierda
            # Cabeza y capucha alineadas hacia la izquierda
            rect(d, cx - 6, cy - 12, 10, 10, SKIN_BASE, OUTLINE)
            rect(d, cx - 7, cy - 14, 12, 6, CLOAK_GREEN, OUTLINE)
            d.point((cx - 4, cy - 8), fill=OUTLINE)
        else: # Derecha (direction == 2)
            # Cabeza y capucha alineadas hacia la derecha
            rect(d, cx - 4, cy - 12, 10, 10, SKIN_BASE, OUTLINE)
            rect(d, cx - 5, cy - 14, 12, 6, CLOAK_GREEN, OUTLINE)
            d.point((cx + 3, cy - 8), fill=OUTLINE)

    # Arco
    if not is_attack:
        if direction in (0, 2):
            # Arco al hombro / mano
            d.line([(cx + 6, cy - 10), (cx + 8, cy), (cx + 6, cy + 10)], fill=BOW_WOOD, width=2)
            d.line([(cx + 6, cy - 10), (cx + 6, cy + 10)], fill=(210, 210, 210, 200))
        else:
            d.line([(cx - 7, cy - 10), (cx - 9, cy), (cx - 7, cy + 10)], fill=BOW_WOOD, width=2)
    else:
        # Ataque: Disparando arco tenso con flecha
        if direction in (0, 2):
            d.line([(cx + 8, cy - 12), (cx + 14, cy), (cx + 8, cy + 12)], fill=BOW_WOOD, width=2)
            # Cuerda tensada
            d.line([(cx + 8, cy - 12), (cx + 2, cy), (cx + 8, cy + 12)], fill=(230, 230, 230, 255))
            # Flecha apuntando
            d.line([(cx + 2, cy), (cx + 18, cy)], fill=(220, 220, 220, 255), width=2)
            d.polygon([(cx + 18, cy - 2), (cx + 21, cy), (cx + 18, cy + 2)], fill=(160, 160, 160, 255))
        elif direction == 1:
            d.line([(cx - 8, cy - 12), (cx - 14, cy), (cx - 8, cy + 12)], fill=BOW_WOOD, width=2)
            d.line([(cx - 8, cy - 12), (cx - 2, cy), (cx - 8, cy + 12)], fill=(230, 230, 230, 255))
            d.line([(cx - 2, cy), (cx - 18, cy)], fill=(220, 220, 220, 255), width=2)
            d.polygon([(cx - 18, cy - 2), (cx - 21, cy), (cx - 18, cy + 2)], fill=(160, 160, 160, 255))
        elif direction == 3:
            d.line([(cx - 12, cy - 10), (cx, cy - 14), (cx + 12, cy - 10)], fill=BOW_WOOD, width=2)
            d.line([(cx, cy - 4), (cx, cy - 20)], fill=(220, 220, 220, 255), width=2)
            
    return img

def draw_mage_frame(direction, anim_frame, is_attack=False):
    """Mago: Túnica violeta mística, bordados dorados, bastón con gema incandescente."""
    img = create_canvas(48, 48)
    d = ImageDraw.Draw(img)
    
    bob_y = 0
    if not is_attack and anim_frame in (1, 3):
        bob_y = -1
        
    cx, cy = 24, 25 + bob_y
    
    # Paleta Mago
    ROBE_PURPLE = (110, 45, 145, 255)
    ROBE_DARK = (65, 25, 95, 255)
    GOLD_RUNES = (245, 205, 50, 255)
    STAFF_WOOD = (120, 75, 45, 255)
    GEM_FIRE = (255, 140, 25, 255)
    GEM_CORE = (255, 240, 160, 255)
    SKIN_BASE = (245, 195, 160, 255)
    
    # Túnica flotante / falda larga
    f_offset = 1 if anim_frame in (1, 2) else -1
    rect(d, cx - 7 + f_offset, cy + 5, 14, 13, ROBE_DARK, OUTLINE)
    rect(d, cx - 6 + f_offset, cy + 15, 12, 3, GOLD_RUNES) # Bordado inferior
    
    # Torso de túnica
    rect(d, cx - 6, cy - 2, 12, 9, ROBE_PURPLE, OUTLINE)
    # Estola dorada central
    rect(d, cx - 2, cy - 1, 4, 8, GOLD_RUNES)
    
    # Cabeza y Caperuza Mística
    if direction == 0:
        rect(d, cx - 5, cy - 11, 10, 9, SKIN_BASE, OUTLINE)
        rect(d, cx - 6, cy - 15, 12, 7, ROBE_PURPLE, OUTLINE)
        # Ojos brillantes místicos
        d.point((cx - 3, cy - 7), fill=(100, 220, 255, 255))
        d.point((cx + 2, cy - 7), fill=(100, 220, 255, 255))
    elif direction == 3:
        rect(d, cx - 6, cy - 15, 12, 12, ROBE_PURPLE, OUTLINE)
        rect(d, cx - 2, cy - 18, 4, 4, ROBE_DARK, OUTLINE) # Punta de capucha
    elif direction in (1, 2):
        if direction == 1: # Izquierda
            # Cara y túnica/capucha alineadas a la izquierda
            rect(d, cx - 6, cy - 11, 10, 9, SKIN_BASE, OUTLINE)
            rect(d, cx - 7, cy - 15, 12, 7, ROBE_PURPLE, OUTLINE)
            d.point((cx - 4, cy - 7), fill=(100, 220, 255, 255))
        else: # Derecha (direction == 2)
            # Cara y túnica/capucha alineadas a la derecha
            rect(d, cx - 4, cy - 11, 10, 9, SKIN_BASE, OUTLINE)
            rect(d, cx - 5, cy - 15, 12, 7, ROBE_PURPLE, OUTLINE)
            d.point((cx + 3, cy - 7), fill=(100, 220, 255, 255))

    # Bastón con Gema Encendida
    if not is_attack:
        staff_x = cx + 8 if direction != 1 else cx - 9
        rect(d, staff_x, cy - 14, 3, 26, STAFF_WOOD, OUTLINE)
        # Gema y fuego
        ellipse(d, staff_x - 2, cy - 19, 7, 7, GEM_FIRE, OUTLINE)
        ellipse(d, staff_x - 1, cy - 18, 5, 5, GEM_CORE)
    else:
        # Ataque mágico: Bastón alzado radiating energía
        staff_x = cx + 10 if direction != 1 else cx - 11
        rect(d, staff_x, cy - 22, 3, 26, STAFF_WOOD, OUTLINE)
        ellipse(d, staff_x - 4, cy - 27, 11, 11, GEM_FIRE, OUTLINE)
        ellipse(d, staff_x - 2, cy - 25, 7, 7, GEM_CORE)
        # Partículas de conjuro
        d.point((staff_x - 6, cy - 22), fill=(255, 250, 180, 255))
        d.point((staff_x + 8, cy - 24), fill=(255, 250, 180, 255))
        d.point((staff_x + 2, cy - 30), fill=(255, 200, 80, 255))
        
    return img

# ==============================================================================
# 2. GENERADOR DE ENEMIGOS Y MONSTRUOS
# Bandido, Esqueleto, Araña, Hombre Lobo, Demonio Menor
# ==============================================================================

def draw_bandit_frame(direction, anim_frame, is_attack=False):
    """Bandido: Ropa desgastada, pañuelo rojo en rostro, dagas afiladas."""
    img = create_canvas(48, 48)
    d = ImageDraw.Draw(img)
    
    leg_offset = 2 if anim_frame == 1 else (-2 if anim_frame == 3 else 0)
    cx, cy = 24, 25
    
    CLOTH_BROWN = (100, 70, 50, 255)
    PANTS_DARK = (55, 55, 65, 255)
    RED_MASK = (190, 40, 40, 255)
    STEEL = (210, 220, 230, 255)
    SKIN = (235, 180, 145, 255)
    
    # Piernas
    rect(d, cx - 5 + leg_offset, cy + 9, 4, 8, PANTS_DARK, OUTLINE)
    rect(d, cx + 1 - leg_offset, cy + 9, 4, 8, PANTS_DARK, OUTLINE)
    
    # Torso desgastado
    rect(d, cx - 5, cy - 2, 10, 11, CLOTH_BROWN, OUTLINE)
    rect(d, cx - 4, cy + 4, 8, 3, (40, 30, 25, 255)) # Cinturón
    
    # Cabeza y Máscara Roja
    rect(d, cx - 5, cy - 12, 10, 10, SKIN, OUTLINE)
    rect(d, cx - 6, cy - 8, 12, 6, RED_MASK, OUTLINE) # Pañuelo
    # Colas de pañuelo ondeando
    rect(d, cx + 5, cy - 6, 4, 3, RED_MASK)
    # Ojos amenazantes
    d.point((cx - 3, cy - 10), fill=OUTLINE)
    d.point((cx + 2, cy - 10), fill=OUTLINE)
    
    # Dagas de acero
    if not is_attack:
        rect(d, cx + 6, cy + 1, 3, 7, STEEL, OUTLINE)
        rect(d, cx - 9, cy + 1, 3, 7, STEEL, OUTLINE)
    else:
        # Estocada
        rect(d, cx + 8, cy - 4, 11, 4, STEEL, OUTLINE)
        ellipse(d, cx + 16, cy - 6, 8, 8, None, (255, 230, 180, 200))
        
    return img

def draw_skeleton_frame(direction, anim_frame, is_attack=False):
    """Esqueleto Guerrero: Anatomía ósea completa, cuencas oculares con fuego espectral, espada mellada o arco de hueso, sombra elíptica."""
    img = create_canvas(48, 48)
    d = ImageDraw.Draw(img)
    
    leg_offset = 2 if anim_frame == 1 else (-2 if anim_frame == 3 else 0)
    cx, cy = 24, 25
    
    BONE_WHITE = (240, 235, 220, 255)
    BONE_LIGHT = (255, 252, 240, 255)
    BONE_SHADOW = (150, 140, 120, 255)
    BONE_DARK = (105, 95, 80, 255)
    RUST_STEEL = (160, 130, 110, 255)
    RUST_DARK = (95, 75, 60, 255)
    BOW_WOOD = (130, 90, 50, 255)
    GLOW_EYE = (255, 45, 45, 255)
    GLOW_CORE = (255, 200, 200, 255)
    
    # Sombra proyectada en el suelo
    ellipse(d, cx - 8, cy + 15, 16, 5, (10, 10, 16, 110))
    
    # Piernas huesudas con fémur y tibia visibles
    rect(d, cx - 4 + leg_offset, cy + 8, 3, 5, BONE_WHITE, OUTLINE) # Fémur izq
    rect(d, cx - 4 + leg_offset, cy + 12, 3, 5, BONE_WHITE, OUTLINE) # Tibia izq
    rect(d, cx - 5 + leg_offset, cy + 16, 4, 2, BONE_LIGHT, OUTLINE) # Pie
    
    rect(d, cx + 2 - leg_offset, cy + 8, 3, 5, BONE_WHITE, OUTLINE) # Fémur der
    rect(d, cx + 2 - leg_offset, cy + 12, 3, 5, BONE_WHITE, OUTLINE) # Tibia der
    rect(d, cx + 2 - leg_offset, cy + 16, 4, 2, BONE_LIGHT, OUTLINE) # Pie
    
    # Pelvis
    rect(d, cx - 4, cy + 6, 9, 3, BONE_SHADOW, OUTLINE)
    
    # Columna vertebral y Caja torácica (Costillas tridimensionales)
    rect(d, cx - 1, cy - 3, 3, 10, BONE_DARK) # Columna
    for r in range(4):
        rect(d, cx - 5, cy - 3 + r * 2, 11, 1, BONE_WHITE, OUTLINE)
        d.point((cx - 4, cy - 3 + r * 2), fill=BONE_LIGHT)
        d.point((cx + 4, cy - 3 + r * 2), fill=BONE_LIGHT)
    
    # Cráneo con mandíbula articulada
    rect(d, cx - 6, cy - 14, 12, 10, BONE_WHITE, OUTLINE)
    d.line([(cx - 5, cy - 13), (cx + 4, cy - 13)], fill=BONE_LIGHT) # Frente iluminada
    rect(d, cx - 4, cy - 4, 8, 3, BONE_SHADOW, OUTLINE) # Mandíbula
    d.point((cx - 3, cy - 3), fill=BONE_WHITE) # Dientes
    d.point((cx - 1, cy - 3), fill=BONE_WHITE)
    d.point((cx + 1, cy - 3), fill=BONE_WHITE)
    
    # Cuencas oculares con fuego espectral rojo
    if direction == 0: # Mirando al frente
        rect(d, cx - 4, cy - 10, 3, 3, (15, 10, 20, 255))
        rect(d, cx + 1, cy - 10, 3, 3, (15, 10, 20, 255))
        d.point((cx - 3, cy - 9), fill=GLOW_EYE)
        d.point((cx - 3, cy - 10), fill=GLOW_CORE)
        d.point((cx + 2, cy - 9), fill=GLOW_EYE)
        d.point((cx + 2, cy - 10), fill=GLOW_CORE)
    elif direction in (1, 2): # Lado
        sgn = -1 if direction == 1 else 1
        rect(d, cx + 1 * sgn, cy - 10, 3, 3, (15, 10, 20, 255))
        d.point((cx + 2 * sgn, cy - 9), fill=GLOW_EYE)
        d.point((cx + 2 * sgn, cy - 10), fill=GLOW_CORE)
    
    # Armamento: Espada rota o Arco de hueso según dirección/ataque
    if not is_attack:
        if direction in (0, 2):
            # Espada de hierro mellado
            rect(d, cx + 6, cy - 1, 3, 13, RUST_STEEL, OUTLINE)
            d.line([(cx + 7, cy), (cx + 7, cy + 9)], fill=(220, 200, 185, 255)) # Filo
            rect(d, cx + 4, cy - 2, 7, 2, RUST_DARK, OUTLINE) # Guarda
        else:
            # Arco de hueso al hombro
            d.line([(cx - 7, cy - 8), (cx - 10, cy + 2), (cx - 7, cy + 12)], fill=BONE_WHITE, width=2)
            d.line([(cx - 7, cy - 8), (cx - 7, cy + 12)], fill=(180, 180, 180, 200))
    else:
        # Ataque con espada cortante o flecha
        if direction in (0, 2):
            rect(d, cx + 6, cy - 7, 14, 4, RUST_STEEL, OUTLINE)
            d.line([(cx + 8, cy - 6), (cx + 18, cy - 6)], fill=(240, 220, 200, 255))
            ellipse(d, cx + 10, cy - 12, 16, 14, None, (255, 100, 100, 180)) # Destello rojo
        else:
            rect(d, cx - 18, cy - 7, 14, 4, RUST_STEEL, OUTLINE)
            ellipse(d, cx - 22, cy - 12, 16, 14, None, (255, 100, 100, 180))
            
    return img

def draw_spider_frame(direction, anim_frame):
    """Araña Gigante: Abdomen oscuro con veneno verde neón, 8 patas articuladas y sombra elíptica suave en el suelo."""
    img = create_canvas(48, 48)
    d = ImageDraw.Draw(img)
    
    cx, cy = 24, 24
    
    BODY_PURPLE = (48, 26, 58, 255)
    BODY_DARK = (24, 14, 30, 255)
    POISON_GREEN = (95, 245, 50, 255)
    POISON_BRIGHT = (180, 255, 80, 255)
    RED_EYES = (255, 35, 35, 255)
    LEG_COLOR = (38, 22, 44, 255)
    LEG_JOINT = (65, 38, 75, 255)
    
    # Sombra proyectada en el suelo
    ellipse(d, cx - 14, cy + 8, 28, 10, (10, 10, 16, 120))
    
    # Animación de patas alternadas
    p = 3 if anim_frame in (1, 2) else -3
    
    # 8 Patas largas articuladas
    # Lado Izquierdo
    d.line([(cx - 4, cy - 3), (cx - 14, cy - 10 + p), (cx - 20, cy - 4)], fill=LEG_COLOR, width=2)
    d.point((cx - 14, cy - 10 + p), fill=LEG_JOINT)
    d.line([(cx - 5, cy), (cx - 17, cy - 2 - p), (cx - 22, cy + 4)], fill=LEG_COLOR, width=2)
    d.point((cx - 17, cy - 2 - p), fill=LEG_JOINT)
    d.line([(cx - 5, cy + 3), (cx - 16, cy + 8 + p), (cx - 20, cy + 14)], fill=LEG_COLOR, width=2)
    d.line([(cx - 4, cy + 6), (cx - 13, cy + 15 - p), (cx - 17, cy + 19)], fill=LEG_COLOR, width=2)
    
    # Lado Derecho
    d.line([(cx + 4, cy - 3), (cx + 14, cy - 10 - p), (cx + 20, cy - 4)], fill=LEG_COLOR, width=2)
    d.point((cx + 14, cy - 10 - p), fill=LEG_JOINT)
    d.line([(cx + 5, cy), (cx + 17, cy - 2 + p), (cx + 22, cy + 4)], fill=LEG_COLOR, width=2)
    d.point((cx + 17, cy - 2 + p), fill=LEG_JOINT)
    d.line([(cx + 5, cy + 3), (cx + 16, cy + 8 - p), (cx + 20, cy + 14)], fill=LEG_COLOR, width=2)
    d.line([(cx + 4, cy + 6), (cx + 13, cy + 15 + p), (cx + 17, cy + 19)], fill=LEG_COLOR, width=2)

    # Abdomen trasero hinchado
    ellipse(d, cx - 8, cy - 2, 16, 17, BODY_PURPLE, OUTLINE)
    ellipse(d, cx - 6, cy, 12, 13, (36, 20, 44, 255))
    
    # Patrón venenoso brillante
    ellipse(d, cx - 4, cy + 2, 8, 8, POISON_GREEN)
    ellipse(d, cx - 2, cy + 4, 4, 4, POISON_BRIGHT)
    d.point((cx, cy + 8), fill=BODY_DARK)
    
    # Cefalotórax y Ojos
    ellipse(d, cx - 5, cy - 9, 10, 9, BODY_DARK, OUTLINE)
    # Múltiples ojos rojos incandescentes
    d.point((cx - 3, cy - 7), fill=RED_EYES)
    d.point((cx - 1, cy - 8), fill=RED_EYES)
    d.point((cx + 1, cy - 8), fill=RED_EYES)
    d.point((cx + 3, cy - 7), fill=RED_EYES)
    # Colmillos con veneno goteando
    rect(d, cx - 3, cy - 2, 2, 4, POISON_GREEN, OUTLINE)
    rect(d, cx + 1, cy - 2, 2, 4, POISON_GREEN, OUTLINE)
    
    return img

def draw_rat_frame(direction, anim_frame, is_attack=False):
    """Rata Gigante: Pelaje hirsuto marrón/gris, ojos rojos penetrantes, hocico con bigotes, cola larga serpenteante y sombra en el suelo."""
    img = create_canvas(48, 48)
    d = ImageDraw.Draw(img)
    
    cx, cy = 24, 26
    leg_off = 2 if anim_frame in (1, 3) else -2
    
    FUR_BROWN = (95, 75, 60, 255)
    FUR_DARK = (60, 45, 35, 255)
    FUR_LIGHT = (130, 105, 85, 255)
    SKIN_PINK = (215, 145, 145, 255)
    EYE_RED = (255, 30, 30, 255)
    
    # Sombra en el suelo
    ellipse(d, cx - 12, cy + 8, 24, 8, (10, 10, 16, 120))
    
    # Cola rosada sinuosa
    tail_w = 4 if anim_frame % 2 == 0 else -4
    d.line([(cx - 10, cy + 2), (cx - 16, cy + 4 + tail_w), (cx - 21, cy + 1)], fill=SKIN_PINK, width=2)
    
    # Patas traseras y delanteras
    rect(d, cx - 8 + leg_off, cy + 6, 4, 5, SKIN_PINK, OUTLINE)
    rect(d, cx + 4 - leg_off, cy + 6, 4, 5, SKIN_PINK, OUTLINE)
    
    # Cuerpo / Lomo arqueado
    ellipse(d, cx - 11, cy - 5, 20, 14, FUR_BROWN, OUTLINE)
    ellipse(d, cx - 8, cy - 3, 14, 9, FUR_LIGHT)
    
    # Cabeza y Hocico
    if direction in (0, 2): # Frente o Derecha
        ellipse(d, cx + 1, cy - 6, 11, 10, FUR_BROWN, OUTLINE)
        # Hocico alargado
        d.polygon([(cx + 8, cy - 3), (cx + 15, cy - 1), (cx + 8, cy + 2)], fill=SKIN_PINK, outline=OUTLINE)
        # Ojo rojo
        d.point((cx + 7, cy - 4), fill=EYE_RED)
        # Oreja
        ellipse(d, cx + 1, cy - 9, 5, 5, SKIN_PINK, OUTLINE)
        # Dientes incisivos afilados
        if is_attack:
            d.line([(cx + 14, cy - 1), (cx + 18, cy)], fill=(255, 255, 240, 255), width=2)
    else: # Izquierda o Espalda
        ellipse(d, cx - 12, cy - 6, 11, 10, FUR_BROWN, OUTLINE)
        d.polygon([(cx - 8, cy - 3), (cx - 15, cy - 1), (cx - 8, cy + 2)], fill=SKIN_PINK, outline=OUTLINE)
        d.point((cx - 7, cy - 4), fill=EYE_RED)
        ellipse(d, cx - 5, cy - 9, 5, 5, SKIN_PINK, OUTLINE)
        if is_attack:
            d.line([(cx - 14, cy - 1), (cx - 18, cy)], fill=(255, 255, 240, 255), width=2)
            
    return img

def draw_werewolf_frame(direction, anim_frame, is_attack=False):
    """Hombre Lobo: Bestia jorobada, pelaje grisáceo, garras letales."""
    img = create_canvas(56, 56)
    d = ImageDraw.Draw(img)
    
    cx, cy = 28, 28
    leg_offset = 3 if anim_frame == 1 else (-3 if anim_frame == 3 else 0)
    
    FUR_GREY = (90, 80, 75, 255)
    FUR_DARK = (55, 45, 42, 255)
    FUR_LIGHT = (130, 115, 105, 255)
    CLAW_BONE = (220, 220, 210, 255)
    EYE_YELLOW = (255, 220, 30, 255)
    
    # Patas digitígradas
    rect(d, cx - 6 + leg_offset, cy + 11, 5, 10, FUR_DARK, OUTLINE)
    rect(d, cx + 1 - leg_offset, cy + 11, 5, 10, FUR_DARK, OUTLINE)
    
    # Torso jorobado musculoso
    ellipse(d, cx - 9, cy - 4, 18, 17, FUR_GREY, OUTLINE)
    rect(d, cx - 5, cy - 2, 10, 6, FUR_LIGHT) # Pecho
    
    # Cabeza lupina con orejas puntiagudas
    rect(d, cx - 7, cy - 15, 14, 12, FUR_GREY, OUTLINE)
    # Orejas
    d.polygon([(cx - 7, cy - 15), (cx - 5, cy - 21), (cx - 3, cy - 15)], fill=FUR_DARK, outline=OUTLINE)
    d.polygon([(cx + 3, cy - 15), (cx + 5, cy - 21), (cx + 7, cy - 15)], fill=FUR_DARK, outline=OUTLINE)
    # Hocico y colmillos
    rect(d, cx - 4, cy - 8, 8, 6, FUR_DARK, OUTLINE)
    d.point((cx - 3, cy - 5), fill=CLAW_BONE)
    d.point((cx + 2, cy - 5), fill=CLAW_BONE)
    # Ojos amarillos brillantes
    d.point((cx - 4, cy - 11), fill=EYE_YELLOW)
    d.point((cx + 3, cy - 11), fill=EYE_YELLOW)
    
    # Brazos y Garras
    if not is_attack:
        rect(d, cx - 14, cy + 2, 5, 10, FUR_GREY, OUTLINE)
        rect(d, cx + 9, cy + 2, 5, 10, FUR_GREY, OUTLINE)
        # Garras
        rect(d, cx - 14, cy + 12, 5, 3, CLAW_BONE)
        rect(d, cx + 9, cy + 12, 5, 3, CLAW_BONE)
    else:
        # Zarpazo desgarrador
        rect(d, cx + 9, cy - 6, 12, 6, FUR_GREY, OUTLINE)
        # 3 garras cortando
        d.line([(cx + 21, cy - 8), (cx + 26, cy - 2)], fill=CLAW_BONE, width=2)
        d.line([(cx + 21, cy - 4), (cx + 26, cy + 2)], fill=CLAW_BONE, width=2)
        d.line([(cx + 21, cy), (cx + 26, cy + 6)], fill=CLAW_BONE, width=2)
        
    return img

def draw_demon_frame(direction, anim_frame, is_attack=False):
    """Demonio Menor: Piel carmesí, cuernos curvos, alas oscuras y cola."""
    img = create_canvas(56, 56)
    d = ImageDraw.Draw(img)
    
    cx, cy = 28, 28
    leg_offset = 2 if anim_frame == 1 else (-2 if anim_frame == 3 else 0)
    
    DEMON_RED = (185, 35, 45, 255)
    DEMON_DARK = (110, 20, 30, 255)
    HORN_BLACK = (45, 30, 40, 255)
    WING_PURPLE = (75, 35, 90, 255)
    EYE_FIRE = (255, 200, 30, 255)
    
    # Alas en espalda
    d.polygon([(cx - 6, cy - 4), (cx - 22, cy - 14), (cx - 14, cy + 4)], fill=WING_PURPLE, outline=OUTLINE)
    d.polygon([(cx + 6, cy - 4), (cx + 22, cy - 14), (cx + 14, cy + 4)], fill=WING_PURPLE, outline=OUTLINE)
    
    # Cola con púa
    d.line([(cx, cy + 8), (cx - 10, cy + 14), (cx - 14, cy + 10)], fill=DEMON_DARK, width=2)
    d.polygon([(cx - 14, cy + 8), (cx - 18, cy + 10), (cx - 14, cy + 13)], fill=DEMON_RED)
    
    # Piernas unguladas (pezuñas)
    rect(d, cx - 6 + leg_offset, cy + 10, 4, 10, DEMON_DARK, OUTLINE)
    rect(d, cx + 2 - leg_offset, cy + 10, 4, 10, DEMON_DARK, OUTLINE)
    
    # Torso muscular rojo
    rect(d, cx - 7, cy - 3, 14, 14, DEMON_RED, OUTLINE)
    
    # Cabeza y Cuernos Prominentes
    rect(d, cx - 6, cy - 14, 12, 11, DEMON_RED, OUTLINE)
    # Cuernos curvados hacia arriba
    d.polygon([(cx - 6, cy - 14), (cx - 13, cy - 22), (cx - 4, cy - 16)], fill=HORN_BLACK, outline=OUTLINE)
    d.polygon([(cx + 6, cy - 14), (cx + 13, cy - 22), (cx + 4, cy - 16)], fill=HORN_BLACK, outline=OUTLINE)
    # Ojos de fuego
    d.point((cx - 3, cy - 10), fill=EYE_FIRE)
    d.point((cx + 2, cy - 10), fill=EYE_FIRE)
    
    if is_attack:
        ellipse(d, cx + 8, cy - 6, 12, 12, (180, 30, 220, 200), (255, 100, 255, 255))
        
    return img

# ==============================================================================
# 3. SUB-JEFE ABRACADABRA (Piso 8) - 72x72
# Obeso, grotesco, pálido-verdoso, pústulas neón, hinchado de tórax y vómito ácido.
# ==============================================================================

def draw_abracadabra_frame(state, frame_idx):
    """
    state: 'walk', 'swell', 'vomit', 'charge'
    """
    img = create_canvas(72, 72)
    d = ImageDraw.Draw(img)
    
    cx, cy = 36, 38
    
    FLESH_GREEN = (145, 175, 130, 255)
    FLESH_DARK = (95, 125, 85, 255)
    PUSTULE_NEON = (180, 255, 30, 255)
    ACID_GREEN = (90, 240, 50, 255)
    TEETH_YELLOW = (220, 210, 130, 255)
    RAGS_DIRT = (80, 65, 55, 255)
    
    # Hinchado de tórax dinámico
    swell_w = 0
    if state == 'swell':
        swell_w = frame_idx * 4  # Tórax se hincha notoriamente
    elif state == 'vomit':
        swell_w = 2
    elif state == 'charge':
        swell_w = 1
        cx += 4 # Inclinado hacia adelante
        
    # Piernas obesas
    leg_off = 2 if frame_idx % 2 == 1 else -2
    rect(d, cx - 15 + leg_off, cy + 16, 12, 14, FLESH_DARK, OUTLINE)
    rect(d, cx + 3 - leg_off, cy + 16, 12, 14, FLESH_DARK, OUTLINE)
    
    # Ropaje andrajoso
    rect(d, cx - 18 - swell_w//2, cy + 10, 36 + swell_w, 10, RAGS_DIRT, OUTLINE)
    
    # Cuerpo / Vientre colosal obeso
    ellipse(d, cx - 22 - swell_w, cy - 14 - swell_w//2, 44 + swell_w * 2, 38 + swell_w, FLESH_GREEN, OUTLINE)
    
    # Pliegues de grasa oscura
    d.arc([cx - 16, cy + 2, cx + 16, cy + 14], 0, 180, fill=FLESH_DARK, width=2)
    
    # Pústulas Neón brillantes en hombros y espalda
    ellipse(d, cx - 18, cy - 12, 8, 8, PUSTULE_NEON, OUTLINE)
    ellipse(d, cx - 12, cy - 8, 6, 6, PUSTULE_NEON, OUTLINE)
    ellipse(d, cx + 12, cy - 14, 10, 10, PUSTULE_NEON, OUTLINE)
    ellipse(d, cx + 18, cy - 6, 6, 6, PUSTULE_NEON, OUTLINE)
    
    # Cabeza grotesca
    ellipse(d, cx - 11, cy - 26 - swell_w//2, 22, 18, FLESH_GREEN, OUTLINE)
    # Ojos amarillentos desquiciados
    d.point((cx - 6, cy - 22 - swell_w//2), fill=(255, 230, 40, 255))
    d.point((cx + 5, cy - 22 - swell_w//2), fill=(255, 230, 40, 255))
    
    # Boca babeante / Vomitando
    if state != 'vomit':
        rect(d, cx - 7, cy - 17 - swell_w//2, 14, 5, OUTLINE)
        # Dientes torcidos
        d.point((cx - 5, cy - 16 - swell_w//2), fill=TEETH_YELLOW)
        d.point((cx, cy - 16 - swell_w//2), fill=TEETH_YELLOW)
        d.point((cx + 4, cy - 16 - swell_w//2), fill=TEETH_YELLOW)
        # Baba ácida
        rect(d, cx - 2, cy - 12 - swell_w//2, 4, 6, ACID_GREEN)
    else:
        # Vómito masivo de ácido verde
        ellipse(d, cx - 9, cy - 18, 18, 12, OUTLINE)
        # Chorro de ácido saliendo
        d.polygon([(cx - 6, cy - 12), (cx + 6, cy - 12), (cx + 20, cy + 16), (cx - 20, cy + 16)], fill=ACID_GREEN, outline=OUTLINE)
        # Gotas de ácido
        ellipse(d, cx - 14, cy + 18, 6, 6, PUSTULE_NEON)
        ellipse(d, cx + 8, cy + 20, 8, 8, PUSTULE_NEON)
        
    return img

# ==============================================================================
# 4. JEFE FINAL HONG DEVORADOR DE HOMBRES (Piso 10) - 96x96
# Demonio masivo (2x personaje), múltiples bocas dentadas en torso, garras gigantes.
# ==============================================================================

def draw_hong_frame(frame_idx, is_cleave=False):
    img = create_canvas(96, 96)
    d = ImageDraw.Draw(img)
    
    cx, cy = 48, 48
    
    HONG_RED = (165, 30, 40, 255)
    HONG_DARK = (90, 15, 25, 255)
    HONG_CHITIN = (40, 25, 35, 255)
    TOOTH_IVORY = (245, 240, 210, 255)
    VOID_PURPLE = (140, 30, 190, 255)
    FIRE_EYES = (255, 180, 20, 255)
    
    bob = 2 if frame_idx in (1, 3) else 0
    cy += bob
    
    # Piernas colosales demoníacas
    rect(d, cx - 18, cy + 24, 14, 18, HONG_CHITIN, OUTLINE)
    rect(d, cx + 4, cy + 24, 14, 18, HONG_CHITIN, OUTLINE)
    
    # Alas de dragón demoníaco de fondo
    d.polygon([(cx - 10, cy - 10), (cx - 44, cy - 36), (cx - 26, cy + 10)], fill=HONG_DARK, outline=OUTLINE)
    d.polygon([(cx + 10, cy - 10), (cx + 44, cy - 36), (cx + 26, cy + 10)], fill=HONG_DARK, outline=OUTLINE)
    
    # Torso masivo
    ellipse(d, cx - 24, cy - 16, 48, 46, HONG_RED, OUTLINE)
    
    # MÚLTIPLES BOCAS EN EL CUERPO (Identidad visual estricta)
    # Boca 1 (Pecho izquierdo)
    mouth_open = 2 + (frame_idx % 2) * 2
    ellipse(d, cx - 16, cy - 8, 14, 8 + mouth_open, VOID_PURPLE, OUTLINE)
    for t in range(4):
        d.point((cx - 14 + t * 3, cy - 7), fill=TOOTH_IVORY)
        d.point((cx - 14 + t * 3, cy - 2 + mouth_open), fill=TOOTH_IVORY)
        
    # Boca 2 (Centro de abdomen - gigante)
    ellipse(d, cx - 16, cy + 6, 32, 12 + mouth_open * 2, (20, 5, 25, 255), OUTLINE)
    for t in range(8):
        d.line([(cx - 13 + t * 4, cy + 8), (cx - 11 + t * 4, cy + 11)], fill=TOOTH_IVORY, width=2)
        d.line([(cx - 13 + t * 4, cy + 15 + mouth_open * 2), (cx - 11 + t * 4, cy + 12 + mouth_open * 2)], fill=TOOTH_IVORY, width=2)
        
    # Baba de vacío saliendo de las fauces
    rect(d, cx - 2, cy + 18 + mouth_open * 2, 4, 8, VOID_PURPLE)
    
    # Cabeza imponente con cuernos arqueados
    ellipse(d, cx - 14, cy - 34, 28, 22, HONG_RED, OUTLINE)
    # Cuernos masivos curvados
    d.polygon([(cx - 12, cy - 30), (cx - 32, cy - 44), (cx - 22, cy - 24)], fill=HONG_CHITIN, outline=OUTLINE)
    d.polygon([(cx + 12, cy - 30), (cx + 32, cy - 44), (cx + 22, cy - 24)], fill=HONG_CHITIN, outline=OUTLINE)
    # Ojos ígneos
    ellipse(d, cx - 9, cy - 28, 5, 5, FIRE_EYES, OUTLINE)
    ellipse(d, cx + 4, cy - 28, 5, 5, FIRE_EYES, OUTLINE)
    
    # Brazos con Garras Descomunales
    if not is_cleave:
        rect(d, cx - 34, cy - 10, 10, 24, HONG_RED, OUTLINE)
        rect(d, cx + 24, cy - 10, 10, 24, HONG_RED, OUTLINE)
        # Garras afiladas
        for g in range(3):
            d.line([(cx - 32 + g * 3, cy + 14), (cx - 36 + g * 3, cy + 22)], fill=TOOTH_IVORY, width=2)
            d.line([(cx + 26 + g * 3, cy + 14), (cx + 30 + g * 3, cy + 22)], fill=TOOTH_IVORY, width=2)
    else:
        # Zarpazo demoledor
        rect(d, cx + 18, cy - 26, 26, 12, HONG_RED, OUTLINE)
        for g in range(4):
            d.line([(cx + 44, cy - 26 + g * 4), (cx + 52, cy - 20 + g * 4)], fill=TOOTH_IVORY, width=3)
        # Ráfaga de energía del vacío
        ellipse(d, cx + 30, cy - 20, 24, 24, None, (220, 80, 255, 220))
        
    return img

# ==============================================================================
# 5. TILES, PROPS E ICONOS
# ==============================================================================

def generate_tiles():
    """
    Genera texturas pixel art de alta fidelidad estilo 'Dungeons & Pixels' para los 4 biomas (32x32 cada tile).
    Cada bioma tiene:
    - Col 0 (x:0..31): Suelo con baldosas agrietadas, variaciones tonales y musgo/suciedad en las juntas.
    - Col 1 (x:32..63): Pared frontal con relieve 3D/Top-Down (borde superior biselado iluminado, sillares de piedra y sombra inferior).
    - Col 2 (x:64..95): Suelo decorado alternativo con charco de agua/ácido verdoso o rejilla de alcantarilla/runa.
    - Col 3 (x:96..127): Pared decorada con rejilla de ventilación/alcantarilla de hierro o grieta profunda.
    Ancho total: 128px, Alto: 32px.
    """
    # 1. Cripta y Mazmorras (Pisos 1-4)
    tile_crypt = create_canvas(128, 32)
    d = ImageDraw.Draw(tile_crypt)
    
    STONE_BASE = (54, 58, 68, 255)
    STONE_LIGHT = (78, 86, 102, 255)
    STONE_MID = (65, 72, 85, 255)
    STONE_DARK = (40, 44, 52, 255)
    STONE_DEEP = (26, 28, 34, 255)
    MOSS_GREEN = (50, 95, 45, 255)
    MOSS_LIGHT = (75, 135, 60, 255)
    WATER_PUDDLE = (45, 75, 95, 220)
    WATER_SPECULAR = (120, 180, 215, 255)
    
    # [Tile 0 - Suelo de baldosas de piedra agrietadas con musgo] (0..31)
    rect(d, 0, 0, 32, 32, STONE_BASE)
    # Baldosa grande superior izquierda
    rect(d, 1, 1, 14, 14, STONE_MID, STONE_DARK)
    d.line([(2, 2), (13, 2)], fill=STONE_LIGHT)
    d.line([(2, 2), (2, 13)], fill=STONE_LIGHT)
    # Grieta en baldosa
    d.line([(5, 4), (8, 9), (11, 10)], fill=STONE_DEEP)
    
    # Baldosa superior derecha
    rect(d, 17, 1, 14, 14, STONE_MID, STONE_DARK)
    d.line([(18, 2), (29, 2)], fill=STONE_LIGHT)
    # Mancha de humedad
    ellipse(d, 22, 6, 6, 5, STONE_DARK)
    
    # Baldosa inferior alargada con esquinas desgastadas
    rect(d, 1, 17, 30, 14, STONE_MID, STONE_DARK)
    d.line([(2, 18), (29, 18)], fill=STONE_LIGHT)
    d.line([(12, 22), (18, 25), (25, 24)], fill=STONE_DEEP)
    
    # Musgo en las juntas de los ladrillos
    rect(d, 14, 2, 3, 4, MOSS_GREEN)
    d.point((15, 3), fill=MOSS_LIGHT)
    rect(d, 6, 15, 5, 2, MOSS_GREEN)
    rect(d, 15, 15, 4, 3, MOSS_GREEN)
    d.point((16, 16), fill=MOSS_LIGHT)
    rect(d, 23, 16, 4, 2, MOSS_GREEN)
    
    # [Tile 1 - Pared 2.5D con profundidad superior y sillares] (32..63)
    ox = 32
    # Borde superior biselado (cara superior del muro visible en perspectiva Top-Down)
    rect(d, ox, 0, 32, 7, STONE_LIGHT, STONE_DEEP)
    d.line([(ox + 1, 1), (ox + 30, 1)], fill=(110, 120, 140, 255)) # Brillo filo superior
    rect(d, ox, 7, 32, 2, STONE_DEEP) # Borde sombreado que proyecta el bisel
    
    # Cara vertical del muro de piedra
    rect(d, ox, 9, 32, 23, STONE_DARK)
    # Hilera de sillares de piedra labrada
    # Fila superior de sillares
    rect(d, ox + 1, 9, 14, 10, STONE_MID, STONE_DEEP)
    d.line([(ox + 2, 10), (ox + 13, 10)], fill=STONE_LIGHT)
    rect(d, ox + 17, 9, 14, 10, STONE_MID, STONE_DEEP)
    d.line([(ox + 18, 10), (ox + 29, 10)], fill=STONE_LIGHT)
    
    # Fila inferior de sillares
    rect(d, ox + 1, 20, 9, 9, STONE_MID, STONE_DEEP)
    rect(d, ox + 12, 20, 18, 9, STONE_MID, STONE_DEEP)
    d.line([(ox + 13, 21), (ox + 28, 21)], fill=STONE_LIGHT)
    
    # Telaraña en la esquina superior izquierda
    d.line([(ox + 1, 9), (ox + 8, 9)], fill=(180, 185, 195, 180))
    d.line([(ox + 1, 9), (ox + 1, 16)], fill=(180, 185, 195, 180))
    d.line([(ox + 1, 13), (ox + 6, 9)], fill=(180, 185, 195, 150))
    # Sombra al pie de pared
    rect(d, ox, 29, 32, 3, STONE_DEEP)
    
    # [Tile 2 - Suelo con charco de agua/humedad y huesos] (64..95)
    ox = 64
    rect(d, ox, 0, 32, 32, STONE_BASE)
    rect(d, ox + 1, 1, 30, 30, STONE_MID, STONE_DARK)
    d.line([(ox + 2, 2), (ox + 29, 2)], fill=STONE_LIGHT)
    # Charco de agua estancada con reflejo
    ellipse(d, ox + 6, 7, 20, 14, WATER_PUDDLE, (25, 45, 60, 255))
    ellipse(d, ox + 9, 9, 12, 7, (60, 105, 135, 230))
    d.line([(ox + 10, 10), (ox + 14, 10)], fill=WATER_SPECULAR) # Brillo de luz en agua
    # Detalle de hueso o cráneo enterrado en esquina
    rect(d, ox + 22, 23, 6, 3, (220, 215, 195, 255), STONE_DEEP)
    d.point((ox + 22, 22), fill=(220, 215, 195, 255))
    d.point((ox + 27, 22), fill=(220, 215, 195, 255))
    rect(d, ox + 3, 24, 4, 3, MOSS_GREEN)
    
    # [Tile 3 - Muro con Rejilla de Alcantarilla de Hierro Forjado] (96..127)
    ox = 96
    rect(d, ox, 0, 32, 7, STONE_LIGHT, STONE_DEEP)
    d.line([(ox + 1, 1), (ox + 30, 1)], fill=(110, 120, 140, 255))
    rect(d, ox, 7, 32, 2, STONE_DEEP)
    rect(d, ox, 9, 32, 23, STONE_DARK)
    rect(d, ox + 1, 9, 30, 20, STONE_MID, STONE_DEEP)
    # Marco de rejilla de alcantarilla
    rect(d, ox + 8, 12, 16, 14, (20, 22, 25, 255), STONE_DEEP)
    # Barrotes de hierro con óxido
    for bar in range(4):
        bx = ox + 10 + bar * 3
        d.line([(bx, 13), (bx, 24)], fill=(130, 135, 145, 255), width=1)
        d.point((bx, 18), fill=(160, 100, 60, 255)) # Pátina de óxido
    rect(d, ox, 29, 32, 3, STONE_DEEP)
    
    tile_crypt.save(os.path.join(ASSETS_DIR, 'tileset_crypt.png'))
    
    # 2. Salón Demoníaco (Pisos 5-7)
    tile_demon = create_canvas(128, 32)
    d = ImageDraw.Draw(tile_demon)
    
    OBSID_BASE = (32, 22, 26, 255)
    OBSID_LIGHT = (68, 42, 52, 255)
    OBSID_MID = (48, 30, 38, 255)
    OBSID_DEEP = (18, 10, 14, 255)
    LAVA_RED = (235, 55, 30, 255)
    LAVA_ORANGE = (255, 140, 35, 255)
    LAVA_YELLOW = (255, 230, 80, 255)
    
    # [Tile 0 - Obsidiana con fisuras de magma]
    rect(d, 0, 0, 32, 32, OBSID_BASE)
    rect(d, 1, 1, 14, 14, OBSID_MID, OBSID_DEEP)
    d.line([(2, 2), (13, 2)], fill=OBSID_LIGHT)
    rect(d, 17, 1, 14, 14, OBSID_MID, OBSID_DEEP)
    d.line([(18, 2), (29, 2)], fill=OBSID_LIGHT)
    rect(d, 1, 17, 30, 14, OBSID_MID, OBSID_DEEP)
    # Grieta incandescente de lava
    d.line([(4, 8), (14, 18), (27, 21)], fill=LAVA_RED, width=2)
    d.line([(6, 8), (14, 17), (25, 21)], fill=LAVA_ORANGE)
    d.point((14, 17), fill=LAVA_YELLOW)
    
    # [Tile 1 - Muro Carmesí Demoníaco 2.5D con gárgola/calavera]
    ox = 32
    rect(d, ox, 0, 32, 7, OBSID_LIGHT, OBSID_DEEP)
    d.line([(ox + 1, 1), (ox + 30, 1)], fill=(120, 60, 75, 255))
    rect(d, ox, 7, 32, 2, OBSID_DEEP)
    rect(d, ox, 9, 32, 23, (55, 20, 28, 255))
    rect(d, ox + 1, 9, 14, 10, (75, 28, 38, 255), OBSID_DEEP)
    rect(d, ox + 17, 9, 14, 10, (75, 28, 38, 255), OBSID_DEEP)
    rect(d, ox + 1, 20, 30, 9, (65, 24, 34, 255), OBSID_DEEP)
    # Ojos demoníacos tallados en la pared
    d.point((ox + 14, 14), fill=LAVA_YELLOW)
    d.point((ox + 18, 14), fill=LAVA_YELLOW)
    rect(d, ox, 29, 32, 3, OBSID_DEEP)
    
    # [Tile 2 - Suelo de pozo de lava volcánica]
    ox = 64
    rect(d, ox, 0, 32, 32, OBSID_BASE)
    rect(d, ox + 1, 1, 30, 30, OBSID_MID, OBSID_DEEP)
    ellipse(d, ox + 5, 6, 22, 18, LAVA_RED, OBSID_DEEP)
    ellipse(d, ox + 8, 9, 16, 12, LAVA_ORANGE)
    ellipse(d, ox + 11, 12, 10, 6, LAVA_YELLOW)
    
    # [Tile 3 - Muro con grieta de magma ardiente]
    ox = 96
    rect(d, ox, 0, 32, 7, OBSID_LIGHT, OBSID_DEEP)
    rect(d, ox, 7, 32, 2, OBSID_DEEP)
    rect(d, ox, 9, 32, 23, (55, 20, 28, 255))
    d.line([(ox + 16, 9), (ox + 12, 18), (ox + 19, 28)], fill=LAVA_RED, width=3)
    d.line([(ox + 16, 10), (ox + 13, 18), (ox + 18, 27)], fill=LAVA_YELLOW, width=1)
    rect(d, ox, 29, 32, 3, OBSID_DEEP)
    
    tile_demon.save(os.path.join(ASSETS_DIR, 'tileset_demon.png'))
    
    # 3. Rotonda Virulenta (Piso 8 - Ácido y Pústulas)
    tile_acid = create_canvas(128, 32)
    d = ImageDraw.Draw(tile_acid)
    
    ACID_BASE = (36, 44, 34, 255)
    ACID_LIGHT = (65, 80, 60, 255)
    ACID_MID = (48, 62, 45, 255)
    ACID_DEEP = (18, 24, 18, 255)
    TOXIC_GREEN = (85, 235, 45, 255)
    TOXIC_NEON = (185, 255, 75, 255)
    
    # [Tile 0 - Suelo mohoso y baldosas carcomidas]
    rect(d, 0, 0, 32, 32, ACID_BASE)
    rect(d, 1, 1, 14, 14, ACID_MID, ACID_DEEP)
    d.line([(2, 2), (13, 2)], fill=ACID_LIGHT)
    rect(d, 17, 1, 14, 14, ACID_MID, ACID_DEEP)
    rect(d, 1, 17, 30, 14, ACID_MID, ACID_DEEP)
    # Mancha de corrosión ácida
    ellipse(d, 8, 10, 12, 10, (50, 95, 40, 255))
    d.point((13, 14), fill=TOXIC_GREEN)
    
    # [Tile 1 - Pared virulenta 2.5D con biomasa]
    ox = 32
    rect(d, ox, 0, 32, 7, ACID_LIGHT, ACID_DEEP)
    d.line([(ox + 1, 1), (ox + 30, 1)], fill=(90, 115, 85, 255))
    rect(d, ox, 7, 32, 2, ACID_DEEP)
    rect(d, ox, 9, 32, 23, (30, 42, 30, 255))
    rect(d, ox + 1, 9, 14, 10, (45, 62, 45, 255), ACID_DEEP)
    rect(d, ox + 17, 9, 14, 10, (45, 62, 45, 255), ACID_DEEP)
    # Pústulas en la pared
    ellipse(d, ox + 10, 20, 6, 6, TOXIC_GREEN, ACID_DEEP)
    d.point((ox + 12, 22), fill=TOXIC_NEON)
    rect(d, ox, 29, 32, 3, ACID_DEEP)
    
    # [Tile 2 - Charco de ácido burbujeante]
    ox = 64
    rect(d, ox, 0, 32, 32, ACID_BASE)
    rect(d, ox + 1, 1, 30, 30, ACID_MID, ACID_DEEP)
    ellipse(d, ox + 5, 6, 22, 18, (40, 120, 35, 255), ACID_DEEP)
    ellipse(d, ox + 8, 9, 16, 12, TOXIC_GREEN)
    # Burbujas
    ellipse(d, ox + 11, 11, 4, 4, TOXIC_NEON)
    ellipse(d, ox + 18, 14, 3, 3, TOXIC_NEON)
    
    # [Tile 3 - Rejilla con derrame tóxico verde]
    ox = 96
    rect(d, ox, 0, 32, 7, ACID_LIGHT, ACID_DEEP)
    rect(d, ox, 7, 32, 2, ACID_DEEP)
    rect(d, ox, 9, 32, 23, (30, 42, 30, 255))
    rect(d, ox + 8, 11, 16, 12, (15, 22, 15, 255), ACID_DEEP)
    for b in range(4):
        d.line([(ox + 10 + b * 3, 12), (ox + 10 + b * 3, 22)], fill=(80, 95, 75, 255))
    rect(d, ox + 12, 23, 8, 6, TOXIC_GREEN) # Baba cayendo
    rect(d, ox, 29, 32, 3, ACID_DEEP)
    
    tile_acid.save(os.path.join(ASSETS_DIR, 'tileset_acid.png'))
    
    # 4. Cúspide Abisal (Pisos 9-10 - Piedra Astral y Vacío)
    tile_apex = create_canvas(128, 32)
    d = ImageDraw.Draw(tile_apex)
    
    APEX_BASE = (24, 22, 38, 255)
    APEX_LIGHT = (62, 58, 92, 255)
    APEX_MID = (40, 36, 62, 255)
    APEX_DEEP = (14, 12, 24, 255)
    RUNE_BLUE = (110, 180, 255, 255)
    RUNE_BRIGHT = (210, 235, 255, 255)
    
    # [Tile 0 - Lajas de piedra mística con runas]
    rect(d, 0, 0, 32, 32, APEX_BASE)
    rect(d, 1, 1, 14, 14, APEX_MID, APEX_DEEP)
    d.line([(2, 2), (13, 2)], fill=APEX_LIGHT)
    rect(d, 17, 1, 14, 14, APEX_MID, APEX_DEEP)
    rect(d, 1, 17, 30, 14, APEX_MID, APEX_DEEP)
    # Runa mágica incrustada
    d.line([(7, 24), (25, 24)], fill=RUNE_BLUE, width=1)
    d.line([(16, 19), (16, 29)], fill=RUNE_BLUE, width=1)
    d.point((16, 24), fill=RUNE_BRIGHT)
    
    # [Tile 1 - Muro Cósmico 2.5D]
    ox = 32
    rect(d, ox, 0, 32, 7, APEX_LIGHT, APEX_DEEP)
    d.line([(ox + 1, 1), (ox + 30, 1)], fill=(95, 90, 135, 255))
    rect(d, ox, 7, 32, 2, APEX_DEEP)
    rect(d, ox, 9, 32, 23, (20, 18, 32, 255))
    rect(d, ox + 1, 9, 14, 10, (36, 30, 52, 255), APEX_DEEP)
    rect(d, ox + 17, 9, 14, 10, (36, 30, 52, 255), APEX_DEEP)
    rect(d, ox + 1, 20, 30, 9, (32, 26, 46, 255), APEX_DEEP)
    rect(d, ox, 29, 32, 3, APEX_DEEP)
    
    # [Tile 2 - Suelo del portal cósmico con orbe abisal]
    ox = 64
    rect(d, ox, 0, 32, 32, APEX_BASE)
    rect(d, ox + 1, 1, 30, 30, APEX_MID, APEX_DEEP)
    ellipse(d, ox + 6, 6, 20, 20, (12, 8, 22, 255), RUNE_BLUE)
    ellipse(d, ox + 10, 10, 12, 12, (35, 20, 65, 255))
    d.point((ox + 16, 16), fill=RUNE_BRIGHT)
    
    # [Tile 3 - Muro con constelaciones astrales]
    ox = 96
    rect(d, ox, 0, 32, 7, APEX_LIGHT, APEX_DEEP)
    rect(d, ox, 7, 32, 2, APEX_DEEP)
    rect(d, ox, 9, 32, 23, (20, 18, 32, 255))
    d.line([(ox + 6, 18), (ox + 14, 13), (ox + 24, 21)], fill=RUNE_BLUE, width=1)
    d.point((ox + 6, 18), fill=RUNE_BRIGHT)
    d.point((ox + 14, 13), fill=RUNE_BRIGHT)
    d.point((ox + 24, 21), fill=RUNE_BRIGHT)
    rect(d, ox, 29, 32, 3, APEX_DEEP)
    
    tile_apex.save(os.path.join(ASSETS_DIR, 'tileset_apex.png'))

def generate_props():
    """
    Genera utilería y objetos interactivos de mazmorra estilo 'Dungeons & Pixels' (32x32 cada uno):
    0: Antorcha de pared encendida (soporte de hierro forjado + llama cálida)
    1: Barril de madera con refuerzo de bandas de hierro
    2: Cofre del tesoro de madera reforzada y herrajes dorados
    3: Pergamino antiguo de Lore flotante con aura arcana dorada
    4: Escaleras de descenso a la mazmorra con arco de piedra
    5: Caja de madera reforzada con listones diagonales (Crate)
    6: Estandarte / Bandera roja heráldica colgada en la pared
    7: Esqueleto caído en el suelo con cráneo y espada
    8: Puerta de madera con arco de sillería de piedra
    Ancho total: 288px (9 props x 32px), Alto: 32px.
    """
    props = create_canvas(288, 32)
    d = ImageDraw.Draw(props)
    
    WOOD_DARK = (75, 48, 28, 255)
    WOOD_MID = (125, 82, 48, 255)
    WOOD_LIGHT = (165, 115, 68, 255)
    IRON_DARK = (45, 48, 54, 255)
    IRON_LIGHT = (145, 155, 168, 255)
    GOLD_TRIM = (225, 185, 45, 255)
    GOLD_LIGHT = (255, 230, 110, 255)
    BANNER_RED = (185, 30, 40, 255)
    BANNER_DARK = (115, 18, 24, 255)
    BONE_COLOR = (235, 230, 210, 255)
    BONE_SHADOW = (150, 140, 120, 255)
    
    # 0. Antorcha de pared (0..31): Brazo de hierro, remaches y fuego
    ox = 0
    # Placa de hierro anclada a la pared
    rect(d, ox + 13, 14, 6, 12, IRON_DARK, OUTLINE)
    d.point((ox + 15, 16), fill=IRON_LIGHT)
    # Brazo angular que sostiene el cuenco de fuego
    rect(d, ox + 11, 10, 10, 4, IRON_DARK, OUTLINE)
    d.line([(ox + 12, 11), (ox + 19, 11)], fill=IRON_LIGHT)
    # Llama viva en capas (fuego rojo/naranja con núcleo amarillo y blanco)
    ellipse(d, ox + 9, 2, 14, 12, (255, 60, 20, 255), OUTLINE)
    ellipse(d, ox + 11, 4, 10, 9, (255, 165, 25, 255))
    ellipse(d, ox + 13, 6, 6, 6, (255, 245, 120, 255))
    d.point((ox + 15, 7), fill=(255, 255, 240, 255))
    
    # 1. Barril de madera reforzado (32..63): Tablones arqueados y aros de hierro remachados
    ox = 32
    # Sombra del barril
    ellipse(d, ox + 5, 24, 22, 7, (10, 10, 16, 120))
    # Cuerpo abombado
    ellipse(d, ox + 5, 3, 22, 26, WOOD_MID, OUTLINE)
    rect(d, ox + 8, 4, 16, 24, WOOD_MID)
    # Tablones de madera
    d.line([(ox + 11, 4), (ox + 11, 27)], fill=WOOD_DARK)
    d.line([(ox + 16, 4), (ox + 16, 27)], fill=WOOD_LIGHT) # Brillo tablón central
    d.line([(ox + 21, 4), (ox + 21, 27)], fill=WOOD_DARK)
    # Banda de hierro superior
    rect(d, ox + 6, 7, 20, 4, IRON_DARK, OUTLINE)
    d.line([(ox + 7, 8), (ox + 24, 8)], fill=IRON_LIGHT)
    d.point((ox + 10, 8), fill=(200, 205, 215, 255)) # Remache
    d.point((ox + 21, 8), fill=(200, 205, 215, 255))
    # Banda de hierro inferior
    rect(d, ox + 6, 20, 20, 4, IRON_DARK, OUTLINE)
    d.line([(ox + 7, 21), (ox + 24, 21)], fill=IRON_LIGHT)
    d.point((ox + 10, 21), fill=(200, 205, 215, 255))
    d.point((ox + 21, 21), fill=(200, 205, 215, 255))
    
    # 2. Cofre del tesoro de madera reforzada (64..95)
    ox = 64
    ellipse(d, ox + 4, 23, 24, 7, (10, 10, 16, 120))
    # Base del cofre
    rect(d, ox + 4, 11, 24, 15, WOOD_MID, OUTLINE)
    d.line([(ox + 5, 12), (ox + 26, 12)], fill=WOOD_LIGHT)
    # Tapa abovedada
    ellipse(d, ox + 4, 6, 24, 12, WOOD_MID, OUTLINE)
    rect(d, ox + 5, 10, 22, 4, WOOD_MID)
    # Herrajes y cantoneras de hierro/oro
    rect(d, ox + 4, 7, 4, 19, IRON_DARK, OUTLINE)
    rect(d, ox + 24, 7, 4, 19, IRON_DARK, OUTLINE)
    d.line([(ox + 5, 8), (ox + 5, 24)], fill=IRON_LIGHT)
    d.line([(ox + 25, 8), (ox + 25, 24)], fill=IRON_LIGHT)
    # Cerradura frontal de oro brillante
    rect(d, ox + 13, 13, 6, 8, GOLD_TRIM, OUTLINE)
    rect(d, ox + 15, 16, 2, 3, OUTLINE)
    d.point((ox + 14, 14), fill=GOLD_LIGHT)
    
    # 3. Pergamino de Lore Brillante (96..127)
    ox = 96
    # Resplandor arcano circular
    ellipse(d, ox + 3, 3, 26, 26, None, (255, 225, 75, 170))
    ellipse(d, ox + 6, 6, 20, 20, None, (255, 245, 150, 120))
    # Rollo de pergamino enrollado con textura de papiro
    rect(d, ox + 7, 10, 18, 12, (245, 232, 190, 255), OUTLINE)
    d.line([(ox + 8, 11), (ox + 23, 11)], fill=(255, 248, 225, 255))
    d.line([(ox + 8, 20), (ox + 23, 20)], fill=(195, 175, 130, 255))
    # Runas manuscritas visibles
    d.line([(ox + 9, 13), (ox + 12, 13)], fill=(120, 95, 65, 255))
    d.line([(ox + 19, 13), (ox + 22, 13)], fill=(120, 95, 65, 255))
    d.line([(ox + 9, 17), (ox + 13, 17)], fill=(120, 95, 65, 255))
    # Cinta y cera de sello rojo carmesí
    rect(d, ox + 14, 8, 4, 16, BANNER_RED, OUTLINE)
    ellipse(d, ox + 13, 13, 6, 6, (220, 35, 45, 255), OUTLINE)
    d.point((ox + 15, 14), fill=(255, 180, 180, 255)) # Destello en cera
    
    # 4. Escaleras de Descenso con Arco de Piedra (128..159)
    ox = 128
    rect(d, ox + 2, 2, 28, 28, (20, 18, 26, 255), OUTLINE)
    # Peldaños de piedra que descienden en perspectiva Top-Down
    for st in range(5):
        sy = 5 + st * 5
        rect(d, ox + 4 + st, sy, 24 - st * 2, 4, (65 + st * 14, 70 + st * 14, 82 + st * 14, 255), OUTLINE)
        d.line([(ox + 5 + st, sy), (ox + 26 - st, sy)], fill=(110 + st * 14, 120 + st * 14, 135 + st * 14, 255))
        
    # 5. Caja de Madera Reforzada (Crate) (160..191)
    ox = 160
    ellipse(d, ox + 5, 24, 22, 7, (10, 10, 16, 120))
    rect(d, ox + 5, 5, 22, 22, WOOD_MID, OUTLINE)
    # Marco exterior de la caja
    rect(d, ox + 5, 5, 22, 22, None, IRON_DARK)
    # Tablones internos
    rect(d, ox + 8, 8, 16, 16, WOOD_DARK)
    # Cruz diagonal de refuerzo
    d.line([(ox + 6, 6), (ox + 25, 25)], fill=WOOD_LIGHT, width=2)
    d.line([(ox + 25, 6), (ox + 6, 25)], fill=WOOD_LIGHT, width=2)
    # Remaches de hierro en esquinas
    d.point((ox + 7, 7), fill=IRON_LIGHT)
    d.point((ox + 24, 7), fill=IRON_LIGHT)
    d.point((ox + 7, 24), fill=IRON_LIGHT)
    d.point((ox + 24, 24), fill=IRON_LIGHT)
    
    # 6. Estandarte / Bandera Roja Heráldica para Muros (192..223)
    ox = 192
    # Barra dorada horizontal de sujeción
    rect(d, ox + 6, 3, 20, 3, GOLD_TRIM, OUTLINE)
    ellipse(d, ox + 4, 2, 4, 5, GOLD_LIGHT)
    ellipse(d, ox + 24, 2, 4, 5, GOLD_LIGHT)
    # Tela roja ondeante con corte en cola de golondrina
    rect(d, ox + 8, 6, 16, 18, BANNER_RED, OUTLINE)
    rect(d, ox + 10, 6, 4, 18, (215, 45, 55, 255)) # Pliegue claro
    rect(d, ox + 18, 6, 4, 18, BANNER_DARK) # Sombra pliegue
    # Emblema heráldico de espada dorada en el centro
    d.line([(ox + 15, 9), (ox + 15, 19)], fill=GOLD_LIGHT, width=2)
    d.line([(ox + 13, 12), (ox + 17, 12)], fill=GOLD_LIGHT)
    # Puntas de la bandera
    d.polygon([(ox + 8, 24), (ox + 12, 28), (ox + 15, 23), (ox + 19, 28), (ox + 23, 24)], fill=BANNER_RED, outline=OUTLINE)
    
    # 7. Esqueleto tirado en el suelo con espada (224..255)
    ox = 224
    ellipse(d, ox + 3, 18, 26, 10, (10, 10, 16, 110)) # Sombra
    # Cráneo en el suelo con cuenca oscura
    rect(d, ox + 5, 12, 7, 6, BONE_COLOR, OUTLINE)
    d.point((ox + 6, 14), fill=OUTLINE)
    d.point((ox + 9, 14), fill=OUTLINE)
    # Costillas rotas desparramadas
    rect(d, ox + 13, 14, 8, 2, BONE_COLOR)
    rect(d, ox + 14, 17, 6, 2, BONE_COLOR)
    # Fémur y huesos
    d.line([(ox + 19, 16), (ox + 26, 20)], fill=BONE_COLOR, width=2)
    d.line([(ox + 16, 20), (ox + 22, 24)], fill=BONE_SHADOW, width=2)
    # Espada mellada caída junto al esqueleto
    d.line([(ox + 7, 24), (ox + 24, 10)], fill=IRON_LIGHT, width=2)
    rect(d, ox + 6, 23, 3, 3, GOLD_TRIM, OUTLINE)
    
    # 8. Puerta de Madera con Arco de Sillería de Piedra (256..287)
    ox = 256
    # Arco de sillería de piedra exterior
    rect(d, ox + 3, 2, 26, 28, (65, 72, 85, 255), OUTLINE)
    d.line([(ox + 4, 3), (ox + 27, 3)], fill=(95, 105, 122, 255))
    # Dintel y jambas
    rect(d, ox + 6, 6, 20, 24, OUTLINE)
    # Hojas de madera gruesa
    rect(d, ox + 7, 7, 18, 23, WOOD_DARK)
    d.line([(ox + 15, 7), (ox + 15, 29)], fill=OUTLINE, width=2) # Junta central de dos hojas
    # Refuerzos de hierro forjado curvado
    rect(d, ox + 8, 10, 16, 3, IRON_DARK)
    rect(d, ox + 8, 22, 16, 3, IRON_DARK)
    d.point((ox + 10, 11), fill=IRON_LIGHT)
    d.point((ox + 22, 11), fill=IRON_LIGHT)
    # Aldabas o argollas de hierro
    ellipse(d, ox + 11, 15, 4, 4, None, IRON_LIGHT)
    ellipse(d, ox + 17, 15, 4, 4, None, IRON_LIGHT)
    
    props.save(os.path.join(ASSETS_DIR, 'props.png'))

def generate_icons():
    """Genera iconos de armas, armaduras, pociones y materiales (24x24 cada uno)"""
    # 10 iconos x 24 = 240x24
    icons = create_canvas(240, 24)
    d = ImageDraw.Draw(icons)
    
    # 0: Espada Corta (Común)
    rect(d, 4, 18, 5, 2, (120, 80, 40, 255), OUTLINE)
    d.line([(7, 17), (18, 6)], fill=(220, 230, 240, 255), width=3)
    d.line([(7, 17), (19, 5)], fill=OUTLINE, width=1)
    
    # 1: Hoja Demoníaca (Legendaria - Oro)
    ox = 24
    d.line([(ox + 6, 18), (ox + 18, 5)], fill=(245, 50, 60, 255), width=4)
    d.line([(ox + 7, 17), (ox + 17, 6)], fill=(255, 200, 50, 255), width=2)
    
    # 2: Arco de Cazador (Rara - Azul)
    ox = 48
    d.line([(ox + 6, 4), (ox + 18, 12), (ox + 6, 20)], fill=(150, 95, 50, 255), width=2)
    d.line([(ox + 6, 4), (ox + 6, 20)], fill=(210, 210, 210, 255))
    
    # 3: Bastón de Fuego (Épica - Púrpura)
    ox = 72
    d.line([(ox + 5, 19), (ox + 17, 7)], fill=(120, 75, 45, 255), width=2)
    ellipse(d, ox + 15, 4, 6, 6, (255, 130, 20, 255), OUTLINE)
    
    # 4: Peto de Acero (Épica)
    ox = 96
    rect(d, ox + 4, 5, 16, 14, (170, 185, 205, 255), OUTLINE)
    rect(d, ox + 6, 7, 12, 5, (230, 240, 255, 255))
    
    # 5: Túnica Mística (Rara)
    ox = 120
    rect(d, ox + 4, 5, 16, 15, (110, 50, 140, 255), OUTLINE)
    d.line([(ox + 12, 5), (ox + 12, 20)], fill=(245, 210, 50, 255), width=2)
    
    # 6: Poción de Vida Roja
    ox = 144
    rect(d, ox + 10, 3, 4, 4, (180, 180, 190, 255), OUTLINE)
    ellipse(d, ox + 6, 7, 12, 14, (235, 40, 50, 255), OUTLINE)
    ellipse(d, ox + 8, 10, 4, 4, (255, 200, 200, 255))
    
    # 7: Poción de Maná Azul
    ox = 168
    rect(d, ox + 10, 3, 4, 4, (180, 180, 190, 255), OUTLINE)
    ellipse(d, ox + 6, 7, 12, 14, (40, 120, 245, 255), OUTLINE)
    ellipse(d, ox + 8, 10, 4, 4, (200, 230, 255, 255))
    
    # 8: Piel de Lobo / Seda
    ox = 192
    ellipse(d, ox + 4, 6, 16, 12, (100, 90, 85, 255), OUTLINE)
    ellipse(d, ox + 6, 8, 12, 8, (135, 125, 120, 255))
    
    # 9: Monedas de Oro
    ox = 216
    ellipse(d, ox + 4, 9, 10, 10, (245, 195, 40, 255), OUTLINE)
    ellipse(d, ox + 10, 6, 10, 10, (255, 220, 70, 255), OUTLINE)
    
    icons.save(os.path.join(ASSETS_DIR, 'icons.png'))

def build_all_spritesheets():
    """Genera las hojas completas de spritesheets para los personajes y monstruos"""
    print("Generando spritesheets...")
    
    # Clases: Guerrera, Arquero, Mago
    # 7 columnas (4 caminar + 3 ataque/especial) x 4 filas (Abajo, Izq, Der, Arriba)
    classes = [
        ('player_warrior.png', draw_warrior_frame),
        ('player_archer.png', draw_archer_frame),
        ('player_mage.png', draw_mage_frame),
    ]
    
    for filename, drawer in classes:
        sheet = create_canvas(48 * 7, 48 * 4)
        for direction in range(4):
            # 4 frames caminar
            for frame in range(4):
                f_img = drawer(direction, frame, is_attack=False)
                sheet.paste(f_img, (frame * 48, direction * 48))
            # 3 frames ataque
            for atk in range(3):
                f_img = drawer(direction, atk, is_attack=True)
                sheet.paste(f_img, ((4 + atk) * 48, direction * 48))
        sheet.save(os.path.join(ASSETS_DIR, filename))
        print(f"Creado: {filename}")
        
    # Enemigos básicos: Bandido, Esqueleto, Rata Gigante
    enemies_48 = [
        ('enemy_bandit.png', draw_bandit_frame),
        ('enemy_skeleton.png', draw_skeleton_frame),
        ('enemy_rat.png', draw_rat_frame),
    ]
    for filename, drawer in enemies_48:
        sheet = create_canvas(48 * 6, 48 * 4)
        for direction in range(4):
            for frame in range(4):
                f_img = drawer(direction, frame, is_attack=False)
                sheet.paste(f_img, (frame * 48, direction * 48))
            for atk in range(2):
                f_img = drawer(direction, atk, is_attack=True)
                sheet.paste(f_img, ((4 + atk) * 48, direction * 48))
        sheet.save(os.path.join(ASSETS_DIR, filename))
        print(f"Creado: {filename}")
        
    # Araña (48x48, 4 frames por 4 direcciones)
    spider_sheet = create_canvas(48 * 4, 48 * 4)
    for direction in range(4):
        for frame in range(4):
            f_img = draw_spider_frame(direction, frame)
            spider_sheet.paste(f_img, (frame * 48, direction * 48))
    spider_sheet.save(os.path.join(ASSETS_DIR, 'enemy_spider.png'))
    print("Creado: enemy_spider.png")
    
    # Hombre Lobo y Demonio (56x56)
    enemies_56 = [
        ('enemy_werewolf.png', draw_werewolf_frame),
        ('enemy_demon.png', draw_demon_frame),
    ]
    for filename, drawer in enemies_56:
        sheet = create_canvas(56 * 6, 56 * 4)
        for direction in range(4):
            for frame in range(4):
                f_img = drawer(direction, frame, is_attack=False)
                sheet.paste(f_img, (frame * 56, direction * 56))
            for atk in range(2):
                f_img = drawer(direction, atk, is_attack=True)
                sheet.paste(f_img, ((4 + atk) * 56, direction * 56))
        sheet.save(os.path.join(ASSETS_DIR, filename))
        print(f"Creado: {filename}")
        
    # SUB-JEFE ABRACADABRA (72x72)
    # Filas: 0: Caminar (4 frames), 1: Hinchado tórax (4 frames), 2: Vómito ácido (4 frames), 3: Embestida (4 frames)
    abra_sheet = create_canvas(72 * 4, 72 * 4)
    states = ['walk', 'swell', 'vomit', 'charge']
    for row, state in enumerate(states):
        for frame in range(4):
            f_img = draw_abracadabra_frame(state, frame)
            abra_sheet.paste(f_img, (frame * 72, row * 72))
    abra_sheet.save(os.path.join(ASSETS_DIR, 'boss_abracadabra.png'))
    print("Creado: boss_abracadabra.png")
    
    # JEFE FINAL HONG (96x96)
    # Filas: 0: Normal / fauces abriéndose (4 frames), 1: Zarpazo descomunal (4 frames)
    hong_sheet = create_canvas(96 * 4, 96 * 2)
    for frame in range(4):
        f_img = draw_hong_frame(frame, is_cleave=False)
        hong_sheet.paste(f_img, (frame * 96, 0))
        f_atk = draw_hong_frame(frame, is_cleave=True)
        hong_sheet.paste(f_atk, (frame * 96, 96))
    hong_sheet.save(os.path.join(ASSETS_DIR, 'boss_hong.png'))
    print("Creado: boss_hong.png")
    
    # Tiles, Props e Iconos
    generate_tiles()
    generate_props()
    generate_icons()
    print("Tiles, Props e Iconos generados con éxito.")

if __name__ == '__main__':
    build_all_spritesheets()
