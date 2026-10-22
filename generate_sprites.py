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
# 1. GENERADOR DE JUGADORES v2 (Guerrero, Arquero, Mago)
#    Rig compartido: paletas de 5 tonos con cambio de matiz, contorno automático
#    coloreado por pieza, ciclo de caminata de 4 frames y poses de ataque por clase.
#    Contrato de la hoja (no cambiar): 48x48 por frame, filas 0=abajo 1=izq 2=der 3=arriba,
#    columnas 0-3 caminar, 4-6 ataque.
# ==============================================================================
import math
from PIL import ImageOps

HI, LT, MD, DK, DP = range(5)

P_SKIN    = [(255, 232, 204), (246, 204, 164), (224, 164, 124), (178, 116, 96), (122, 76, 76)]
P_STEEL   = [(252, 253, 255), (208, 220, 240), (152, 170, 200), (100, 114, 152), (60, 68, 106)]
P_GOLD    = [(255, 244, 160), (255, 214, 88), (224, 162, 50), (164, 102, 42), (104, 62, 38)]
P_BLUE    = [(120, 158, 236), (72, 110, 206), (46, 72, 156), (32, 46, 110), (22, 30, 74)]
P_RED     = [(255, 178, 138), (238, 90, 74), (198, 46, 56), (142, 32, 52), (92, 22, 44)]
P_LEATHER = [(220, 166, 104), (182, 122, 74), (140, 88, 56), (100, 62, 48), (64, 40, 40)]
P_GREEN   = [(160, 226, 124), (98, 182, 88), (56, 136, 76), (38, 96, 68), (24, 62, 54)]
P_PURPLE  = [(196, 148, 244), (146, 98, 210), (104, 64, 168), (74, 44, 122), (46, 28, 82)]
P_WOOD    = [(226, 176, 114), (176, 126, 76), (130, 88, 56), (92, 60, 44), (58, 38, 36)]
P_WHITE   = [(255, 255, 255), (236, 236, 248), (200, 200, 220), (154, 154, 182), (108, 108, 138)]
P_HAIR    = [(196, 126, 84), (154, 92, 60), (112, 66, 48), (78, 46, 40), (50, 30, 32)]
P_PANTS   = [(168, 156, 134), (136, 122, 106), (102, 90, 82), (72, 62, 66), (48, 42, 52)]
P_ORB     = [(255, 255, 232), (255, 232, 124), (255, 172, 52), (222, 102, 32), (152, 52, 30)]


def _dn(R):
    """Rampa un paso más oscura (para piezas lejanas o sombreadas)."""
    return [R[1], R[2], R[3], R[4], R[4]]


class _L:
    """Capa 48x48 con helpers de dibujo. noline=True => sin contorno (efectos)."""
    def __init__(s, noline=False):
        s.im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
        s.d = ImageDraw.Draw(s.im)
        s.noline = noline

    def rect(s, x0, y0, x1, y1, c):
        s.d.rectangle([x0, y0, x1, y1], fill=c)

    def poly(s, pts, c):
        s.d.polygon(pts, fill=c)

    def ell(s, x0, y0, x1, y1, c):
        s.d.ellipse([x0, y0, x1, y1], fill=c)

    def px(s, x, y, c):
        if 0 <= x < 48 and 0 <= y < 48:
            s.im.putpixel((x, y), c)

    def line(s, pts, c, w=1):
        s.d.line(pts, fill=c, width=w)

    def arc(s, box, a0, a1, c, w=1):
        s.d.arc(box, a0, a1, fill=c, width=w)


def _box(L, x0, y0, x1, y1, R):
    """Caja con luz arriba-izquierda y sombra abajo-derecha."""
    L.rect(x0, y0, x1, y1, R[MD])
    L.line([(x0, y0), (x1, y0)], R[LT])
    L.line([(x0, y0), (x0, y1)], R[LT])
    L.line([(x0, y1), (x1, y1)], R[DK])
    L.line([(x1, y0 + 1), (x1, y1)], R[DK])
    if x1 - x0 >= 3 and y1 - y0 >= 3:
        L.px(x0 + 1, y0 + 1, R[HI])


def _ball(L, x0, y0, x1, y1, R):
    """Esfera sombreada (cabezas, hombreras, orbes)."""
    L.ell(x0, y0, x1, y1, R[DK])
    L.ell(x0, y0, x1 - 1, y1 - 1, R[MD])
    if x1 - x0 >= 4:
        L.ell(x0 + 1, y0 + 1, x1 - 3, y1 - 3, R[LT])
    L.px(x0 + 1, y0 + 1, R[HI])


def _outline(im, strength=0.30):
    """Contorno de 1px coloreado: cada borde toma un tono oscuro del pixel vecino."""
    w, h = im.size
    px = im.load()
    out = im.copy()
    po = out.load()
    for y in range(h):
        for x in range(w):
            if px[x, y][3] == 0:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] > 0:
                        c = px[nx, ny]
                        po[x, y] = (min(58, int(c[0] * strength)) + 8,
                                    min(52, int(c[1] * strength)) + 6,
                                    min(70, int(c[2] * strength)) + 18, 255)
                        break
    return out


def _shift(L, dx, dy):
    im = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
    im.paste(L.im, (dx, dy))
    L.im = im
    L.d = ImageDraw.Draw(im)
    return L


def _pose(is_attack, anim):
    p = dict(b=0, s=0, ll=0, lr=0, al=0, ar=0)
    if not is_attack and anim in (1, 3):
        sg = 1 if anim == 1 else -1
        p['b'] = -1
        p['s'] = 3 * sg
        p['ll'] = 0 if sg > 0 else -2
        p['lr'] = -2 if sg > 0 else 0
        p['al'], p['ar'] = -sg, sg
    return p


def _legs(dr, p, pal, boot):
    L = _L()
    if dr in (0, 3):
        for x0, lift in ((19, p['ll']), (25, p['lr'])):
            _box(L, x0, 30 + lift, x0 + 3, 36 + lift, pal)
            _box(L, x0 - 1, 36 + lift, x0 + 4, 39 + lift, boot)
    else:
        s = p['s']
        for off, pl, bt in ((-s, _dn(pal), _dn(boot)), (s, pal, boot)):
            L.poly([(22, 30), (25, 30), (25 + off, 37), (22 + off, 37)], pl[MD])
            L.line([(22, 30), (22 + off, 37)], pl[LT])
            L.line([(25, 30), (25 + off, 37)], pl[DK])
            _box(L, 20 + off, 37, 26 + off, 39, bt)
    return L


def _hand(L, x, y):
    L.rect(x - 1, y - 1, x + 1, y + 1, P_SKIN[MD])
    L.px(x - 1, y - 1, P_SKIN[LT])


def _blade(L, hand, tip, R=P_STEEL):
    """Espada: pomo, guarda dorada y hoja con filo de luz."""
    hx, hy = hand
    tx, ty = tip
    ln = math.hypot(tx - hx, ty - hy) or 1
    ux, uy = (tx - hx) / ln, (ty - hy) / ln
    nx, ny = -uy, ux
    gx, gy = hx + ux * 2, hy + uy * 2
    L.line([(hx - ux * 2, hy - uy * 2), (hx, hy)], P_WOOD[DK], 2)
    L.px(int(hx - ux * 3), int(hy - uy * 3), P_GOLD[MD])
    L.line([(gx - nx * 3, gy - ny * 3), (gx + nx * 3, gy + ny * 3)], P_GOLD[MD], 2)
    L.px(int(gx - nx * 3), int(gy - ny * 3), P_GOLD[HI])
    sx, sy = hx + ux * 3, hy + uy * 3
    L.line([(sx, sy), (tx, ty)], R[MD], 3)
    L.line([(sx - nx, sy - ny), (tx - nx, ty - ny)], R[HI], 1)
    L.line([(sx + nx, sy + ny), (tx + nx, ty + ny)], R[DK], 1)
    L.px(int(tx), int(ty), R[HI])


# ------------------------------------------------------------------------------
# GUERRERO: armadura de acero, capa azul, pluma roja, espada y escudo
# ------------------------------------------------------------------------------
SWORD = {
    0: {'idle': ((32, 29), (32, 13)), 0: ((33, 24), (40, 8)),  1: ((31, 30), (31, 46)), 2: ((30, 31), (22, 45))},
    1: {'idle': ((16, 29), (14, 13)), 0: ((24, 22), (30, 7)),  1: ((15, 27), (0, 27)),  2: ((14, 30), (4, 42))},
    3: {'idle': ((32, 29), (32, 13)), 0: ((31, 26), (37, 12)), 1: ((28, 22), (26, 2)),  2: ((26, 22), (19, 5))},
}


def _warrior_layers(dr, p, ai):
    b = p['b']
    S, G, C, R, K = P_STEEL, P_GOLD, P_BLUE, P_RED, P_SKIN
    out = []

    # --- capa (detrás)
    L = _L()
    if dr == 3:
        L.poly([(18, 22 + b), (29, 22 + b), (32, 37), (15, 37)], C[MD])
        L.line([(18, 22 + b), (15, 37)], C[LT])
        L.line([(29, 22 + b), (32, 37)], C[DK])
        for x in (21, 24, 27):
            L.line([(x, 26 + b), (x + (x - 24) // 3, 35)], C[DK])
        L.line([(15, 37), (32, 37)], G[MD])
    elif dr == 1:
        L.poly([(26, 23 + b), (31, 25 + b), (34, 37), (27, 36)], C[MD])
        L.line([(30, 25 + b), (34, 37)], C[DK])
        L.line([(27, 36), (34, 37)], G[MD])
    else:
        L.rect(17, 24 + b, 18, 34, C[DK])
        L.rect(29, 24 + b, 30, 34, C[DK])
    out.append(L)

    out.append(_legs(dr, p, _dn(S), _dn(_dn(S))))

    # --- espada detrás del cuerpo en vista lateral/idle (mano lejana)
    sw = SWORD[1 if dr == 2 else dr]['idle' if ai is None else ai]
    sword_back = (dr == 1 and ai is None)
    if sword_back:
        L = _L()
        _blade(L, sw[0], sw[1])
        out.append(L)

    # --- torso
    L = _L()
    if dr == 0:
        _box(L, 19, 21 + b, 28, 30 + b, S)
        L.line([(23, 22 + b), (23, 27 + b)], S[HI])
        L.line([(24, 22 + b), (24, 27 + b)], S[DK])
        L.rect(19, 28 + b, 28, 30 + b, G[MD])
        L.line([(19, 28 + b), (28, 28 + b)], G[LT])
        L.rect(23, 28 + b, 24, 30 + b, G[HI])
        L.rect(21, 20 + b, 26, 21 + b, S[DK])
    elif dr == 3:
        _box(L, 19, 21 + b, 28, 30 + b, _dn(S))
        L.rect(19, 28 + b, 28, 30 + b, G[DK])
        L.line([(21, 22 + b), (21, 27 + b)], S[DP])
        L.line([(26, 22 + b), (26, 27 + b)], S[DP])
    else:
        _box(L, 20, 21 + b, 28, 30 + b, S)
        L.line([(21, 23 + b), (21, 27 + b)], S[HI])
        L.rect(20, 28 + b, 28, 30 + b, G[MD])
        L.line([(20, 28 + b), (28, 28 + b)], G[LT])
    out.append(L)

    # --- cabeza
    L = _L()
    if dr == 0:
        L.ell(17, 7 + b, 30, 19 + b, S[MD])
        L.ell(18, 8 + b, 27, 15 + b, S[LT])
        L.line([(20, 9 + b), (25, 8 + b)], S[HI])
        L.rect(20, 14 + b, 27, 20 + b, K[MD])
        L.line([(20, 20 + b), (27, 20 + b)], K[DK])
        L.rect(17, 14 + b, 19, 19 + b, S[DK])
        L.rect(28, 14 + b, 30, 19 + b, S[DK])
        L.line([(18, 14 + b), (29, 14 + b)], S[DP])
        L.rect(23, 11 + b, 24, 16 + b, S[LT])
        L.rect(21, 16 + b, 21, 17 + b, (28, 22, 40, 255))
        L.rect(26, 16 + b, 26, 17 + b, (28, 22, 40, 255))
        L.poly([(21, 8 + b), (23, 2 + b), (26, 2 + b), (27, 8 + b)], R[MD])
        L.line([(23, 3 + b), (22, 7 + b)], R[HI])
        L.line([(26, 3 + b), (27, 7 + b)], R[DK])
    elif dr == 3:
        L.ell(17, 7 + b, 30, 20 + b, S[DK])
        L.ell(18, 8 + b, 28, 17 + b, S[MD])
        L.line([(20, 10 + b), (25, 9 + b)], S[LT])
        L.rect(21, 19 + b, 26, 21 + b, K[DK])
        L.poly([(21, 8 + b), (23, 2 + b), (26, 2 + b), (27, 8 + b)], R[MD])
        L.rect(22, 8 + b, 26, 14 + b, R[MD])
        L.line([(22, 8 + b), (22, 14 + b)], R[LT])
        L.line([(26, 8 + b), (26, 14 + b)], R[DK])
    else:
        L.ell(17, 7 + b, 29, 19 + b, S[MD])
        L.ell(18, 8 + b, 26, 15 + b, S[LT])
        L.line([(20, 9 + b), (24, 8 + b)], S[HI])
        L.rect(17, 14 + b, 22, 20 + b, K[MD])
        L.line([(17, 20 + b), (22, 20 + b)], K[DK])
        L.px(16, 17 + b, K[LT])
        L.rect(23, 14 + b, 29, 19 + b, S[DK])
        L.line([(17, 14 + b), (29, 14 + b)], S[DP])
        L.rect(19, 16 + b, 19, 17 + b, (28, 22, 40, 255))
        L.poly([(23, 8 + b), (25, 3 + b), (31, 5 + b), (32, 13 + b), (28, 10 + b)], R[MD])
        L.line([(25, 4 + b), (30, 6 + b)], R[HI])
        L.line([(28, 10 + b), (32, 13 + b)], R[DK])
    out.append(L)

    # --- hombreras
    L = _L()
    if dr in (0, 3):
        _ball(L, 14, 20 + b, 19, 25 + b, S)
        _ball(L, 28, 20 + b, 33, 25 + b, S)
        L.px(16, 22 + b, G[LT])
        L.px(30, 22 + b, G[LT])
    else:
        _ball(L, 21, 20 + b, 27, 26 + b, S)
        L.px(23, 22 + b, G[LT])
    out.append(L)

    # --- brazos, escudo, espada (delante)
    L = _L()
    al, ar = p['al'], p['ar']
    if dr == 0:
        # escudo (izquierda de pantalla)
        L.poly([(9, 22 + b), (18, 22 + b), (18, 31 + b), (13, 37 + b), (9, 31 + b)], S[MD])
        L.poly([(10, 23 + b), (17, 23 + b), (17, 30 + b), (13, 35 + b), (10, 30 + b)], C[MD])
        L.line([(10, 23 + b), (17, 23 + b)], C[LT])
        L.line([(13, 24 + b), (13, 34 + b)], G[MD])
        L.line([(10, 28 + b), (17, 28 + b)], G[MD])
        _ball(L, 12, 26 + b, 15, 29 + b, G)
        # brazo derecho
        _box(L, 29, 25 + b + ar, 31, 29 + b + ar, _dn(S))
        _hand(L, 30, 30 + b + ar)
    elif dr == 3:
        _box(L, 15, 25 + b + al, 17, 29 + b + al, _dn(S))
        _hand(L, 16, 30 + b + al)
        L.poly([(10, 23 + b), (15, 23 + b), (15, 33 + b), (12, 36 + b), (10, 32 + b)], C[DK])
        L.line([(10, 23 + b), (15, 23 + b)], S[MD])
        _box(L, 29, 25 + b + ar, 31, 29 + b + ar, _dn(S))
        _hand(L, 30, 30 + b + ar)
    else:
        # escudo de perfil (brazo cercano) + brazo
        L.poly([(19, 22 + b), (25, 22 + b), (25, 32 + b), (22, 36 + b), (19, 32 + b)], S[MD])
        L.poly([(20, 23 + b), (24, 23 + b), (24, 31 + b), (22, 34 + b), (20, 31 + b)], C[MD])
        L.line([(20, 23 + b), (24, 23 + b)], C[LT])
        L.px(22, 28 + b, G[HI])
        _hand(L, 18, 28 + b)
    out.append(L)

    if not sword_back:
        L = _L()
        _blade(L, sw[0], sw[1])
        out.append(L)
        # mano sobre la empuñadura
        L = _L()
        _hand(L, sw[0][0], sw[0][1] + 1)
        out.append(L)

    # --- estela del tajo
    if ai in (1, 2):
        fx = _L(noline=True)
        a = 235 if ai == 1 else 120
        cfg = {0: ((24, 24), 22, 30, 150), 1: ((24, 27), 24, 130, 230), 3: ((24, 24), 22, 210, 330)}
        (ccx, ccy), r, a0, a1 = cfg[1 if dr == 2 else dr]
        bx = (ccx - r, ccy - r, ccx + r, ccy + r)
        fx.arc(bx, a0, a1, (110, 190, 255, a // 3), 6)
        fx.arc(bx, a0, a1, (160, 220, 255, a // 2), 4)
        fx.arc(bx, a0, a1, (235, 248, 255, a), 2)
        out.append(fx)
    return out


# ------------------------------------------------------------------------------
# ARQUERO: capucha verde, jubón de cuero, carcaj y arco
# ------------------------------------------------------------------------------
def _bow(L, dr, ai):
    W = P_WOOD
    string = (236, 230, 204, 255)
    if dr in (0, 3):
        # arco horizontal frente al pecho, disparando hacia el espectador / hacia arriba
        sg = 1 if dr == 0 else -1
        cy = 26
        if ai is None:
            L.arc((10, 14, 20, 40), 90, 270, W[MD], 2)
            L.line([(15, 14), (15, 40)], string, 1)
            return
        if dr == 0:
            L.arc((12, 19, 36, 33), 0, 180, W[MD], 2)
        else:
            L.arc((12, 19, 36, 33), 180, 360, W[MD], 2)
        pull = {0: 2, 1: 6, 2: 0}[ai] * (-sg)
        L.line([(12, 26), (24, 26 + pull)], string, 1)
        L.line([(24, 26 + pull), (36, 26)], string, 1)
        if ai in (0, 1):
            y0 = 26 + pull
            y1 = y0 + sg * 17
            L.line([(24, y0), (24, y1)], W[LT], 1)
            L.px(24, y1, P_STEEL[HI])
            L.px(24, y1 + sg, P_STEEL[MD])
            L.px(23, y0 + sg, P_RED[MD])
            L.px(25, y0 + sg, P_RED[MD])
        return
    # perfil (izquierda)
    if ai is None:
        L.arc((8, 14, 18, 40), 90, 270, W[MD], 2)
        L.line([(13, 14), (13, 40)], string, 1)
        return
    L.arc((7, 14, 17, 40), 90, 270, W[MD], 2)
    pull = {0: 3, 1: 8, 2: 0}[ai]
    L.line([(12, 14), (12 + pull, 27)], string, 1)
    L.line([(12 + pull, 27), (12, 40)], string, 1)
    if ai in (0, 1):
        x1 = 12 + pull
        L.line([(2, 27), (x1 + 2, 27)], W[LT], 1)
        L.px(1, 27, P_STEEL[HI])
        L.px(2, 27, P_STEEL[MD])
        L.px(x1 + 1, 26, P_RED[MD])
        L.px(x1 + 1, 28, P_RED[MD])


def _archer_layers(dr, p, ai):
    b = p['b']
    G, T, K, H, W = P_GREEN, P_LEATHER, P_SKIN, P_HAIR, P_WOOD
    out = []

    # --- carcaj (detrás en frente/perfil, delante en espalda)
    if dr != 3:
        L = _L()
        if dr == 0:
            L.rect(29, 15 + b, 32, 27 + b, T[DK])
            L.line([(29, 15 + b), (29, 27 + b)], T[MD])
            L.px(30, 13 + b, P_RED[MD]); L.px(30, 14 + b, P_WHITE[LT])
            L.px(32, 13 + b, P_RED[MD]); L.px(32, 14 + b, P_WHITE[LT])
        else:
            L.poly([(27, 18 + b), (31, 16 + b), (33, 27 + b), (29, 29 + b)], T[DK])
            L.line([(27, 18 + b), (29, 29 + b)], T[MD])
            L.px(30, 14 + b, P_RED[MD]); L.px(31, 15 + b, P_WHITE[LT])
        out.append(L)

    out.append(_legs(dr, p, P_PANTS, T if dr else T))

    # --- torso
    L = _L()
    if dr == 0:
        _box(L, 19, 21 + b, 28, 30 + b, T)
        L.line([(20, 22 + b), (27, 29 + b)], T[DK])
        L.rect(19, 28 + b, 28, 29 + b, T[DP])
        L.rect(23, 28 + b, 24, 29 + b, P_GOLD[MD])
        L.px(23, 28 + b, P_GOLD[HI])
        L.poly([(17, 21 + b), (30, 21 + b), (30, 25 + b), (27, 27 + b), (24, 25 + b), (21, 27 + b), (17, 25 + b)], G[MD])
        L.line([(17, 21 + b), (30, 21 + b)], G[LT])
        L.line([(18, 25 + b), (21, 27 + b)], G[DK])
    elif dr == 3:
        _box(L, 19, 21 + b, 28, 30 + b, _dn(T))
        L.rect(19, 28 + b, 28, 29 + b, T[DP])
        L.poly([(17, 21 + b), (30, 21 + b), (30, 28 + b), (24, 31 + b), (17, 28 + b)], G[MD])
        L.line([(17, 21 + b), (30, 21 + b)], G[LT])
        L.line([(30, 22 + b), (30, 28 + b)], G[DK])
        L.line([(20, 24 + b), (22, 30 + b)], G[DK]); L.line([(26, 24 + b), (25, 30 + b)], G[DK])
    else:
        _box(L, 20, 21 + b, 28, 30 + b, T)
        L.rect(20, 28 + b, 28, 29 + b, T[DP])
        L.px(20, 28 + b, P_GOLD[MD])
        L.poly([(19, 21 + b), (29, 21 + b), (29, 26 + b), (24, 28 + b), (19, 26 + b)], G[MD])
        L.line([(19, 21 + b), (29, 21 + b)], G[LT])
    out.append(L)

    if dr == 3:
        L = _L()
        L.rect(25, 17 + b, 28, 28 + b, T[DK])
        L.line([(25, 17 + b), (25, 28 + b)], T[MD])
        L.px(26, 14 + b, P_RED[MD]); L.px(26, 15 + b, P_WHITE[LT])
        L.px(28, 14 + b, P_RED[MD]); L.px(28, 15 + b, P_WHITE[LT])
        L.px(27, 15 + b, P_RED[LT]); L.px(27, 16 + b, P_WHITE[MD])
        L.line([(20, 21 + b), (27, 29 + b)], T[DP])
        out.append(L)

    # --- cabeza con capucha
    L = _L()
    if dr == 0:
        L.ell(17, 7 + b, 30, 20 + b, G[MD])
        L.ell(18, 8 + b, 27, 16 + b, G[LT])
        L.poly([(22, 9 + b), (27, 2 + b), (30, 6 + b), (29, 11 + b)], G[MD])
        L.line([(23, 8 + b), (27, 3 + b)], G[HI])
        L.rect(20, 13 + b, 27, 20 + b, K[MD])
        L.line([(20, 20 + b), (27, 20 + b)], K[DK])
        L.rect(20, 13 + b, 27, 14 + b, H[MD])
        L.px(20, 15 + b, H[MD]); L.px(27, 15 + b, H[MD])
        L.line([(19, 13 + b), (19, 19 + b)], G[DK]); L.line([(28, 13 + b), (28, 19 + b)], G[DK])
        L.rect(21, 16 + b, 21, 17 + b, (28, 22, 40, 255))
        L.rect(26, 16 + b, 26, 17 + b, (28, 22, 40, 255))
        L.px(23, 18 + b, K[DK]); L.px(24, 18 + b, K[DK])
    elif dr == 3:
        L.ell(17, 7 + b, 30, 21 + b, G[MD])
        L.ell(18, 8 + b, 27, 17 + b, G[LT])
        L.poly([(22, 9 + b), (27, 2 + b), (30, 6 + b), (29, 11 + b)], G[MD])
        L.line([(23, 8 + b), (27, 3 + b)], G[HI])
        L.line([(18, 18 + b), (29, 18 + b)], G[DK])
        L.rect(20, 19 + b, 27, 21 + b, G[DK])
    else:
        L.ell(17, 7 + b, 29, 20 + b, G[MD])
        L.ell(18, 8 + b, 26, 16 + b, G[LT])
        L.poly([(24, 9 + b), (31, 4 + b), (33, 10 + b), (29, 14 + b)], G[MD])
        L.line([(25, 8 + b), (31, 5 + b)], G[HI])
        L.rect(17, 13 + b, 22, 20 + b, K[MD])
        L.line([(17, 20 + b), (22, 20 + b)], K[DK])
        L.rect(17, 13 + b, 22, 14 + b, H[MD])
        L.px(16, 17 + b, K[LT])
        L.rect(19, 16 + b, 19, 17 + b, (28, 22, 40, 255))
        L.line([(23, 13 + b), (23, 19 + b)], G[DK])
    out.append(L)

    # --- brazos, arco, flecha
    L = _L()
    al, ar = p['al'], p['ar']
    if dr == 0:
        _box(L, 29, 24 + b + ar, 31, 28 + b + ar, _dn(T))
        _hand(L, 30, 29 + b + ar)
        if ai is None:
            _bow(L, dr, None)
            _box(L, 15, 24 + b + al, 17, 28 + b + al, _dn(T))
            _hand(L, 15, 29 + b + al)
        else:
            _bow(L, dr, ai)
            _hand(L, 12, 26); _hand(L, 36, 26)
            _box(L, 13, 23 + b, 15, 26 + b, _dn(T))
    elif dr == 3:
        _box(L, 29, 24 + b + ar, 31, 28 + b + ar, _dn(T))
        _hand(L, 30, 29 + b + ar)
        if ai is None:
            _box(L, 15, 24 + b + al, 17, 28 + b + al, _dn(T))
            _hand(L, 16, 29 + b + al)
            _bow(L, dr, None)
        else:
            _bow(L, dr, ai)
            _hand(L, 12, 26); _hand(L, 36, 26)
    else:
        s = p['s']
        if ai is None:
            L.line([(23, 24 + b), (16 - s // 3, 27 + b)], T[MD], 3)
            _hand(L, 15 - s // 3, 28 + b)
            _bow(L, dr, None)
        else:
            L.line([(23, 24 + b), (12, 27)], T[MD], 3)
            _hand(L, 12, 27)
            _bow(L, dr, ai)
            pull = {0: 3, 1: 8, 2: 0}[ai]
            _hand(L, 12 + pull + 1, 27)
    out.append(L)
    return out


# ------------------------------------------------------------------------------
# MAGO: túnica púrpura, sombrero puntiagudo, barba blanca y bastón con orbe
# ------------------------------------------------------------------------------
STAFF = {
    0: {'idle': ((33, 32), (33, 9)), 0: ((33, 28), (35, 3)), 1: ((32, 27), (30, 36)), 2: ((33, 28), (34, 12))},
    1: {'idle': ((17, 31), (16, 9)), 0: ((16, 26), (14, 3)), 1: ((14, 27), (7, 23)),  2: ((15, 28), (10, 10))},
    3: {'idle': ((33, 32), (33, 9)), 0: ((32, 27), (33, 3)), 1: ((30, 24), (27, 2)),  2: ((32, 28), (33, 7))},
}


def _mage_layers(dr, p, ai, anim):
    b = p['b']
    M, G, K, Wh, Wd = P_PURPLE, P_GOLD, P_SKIN, P_WHITE, P_WOOD
    out = []
    sway = 1 if p['s'] > 0 else (-1 if p['s'] < 0 else 0)

    # --- zapatos
    L = _L()
    if dr in (0, 3):
        for x0, lift in ((19, p['ll']), (25, p['lr'])):
            _box(L, x0, 38 + lift, x0 + 3, 40 + lift, P_LEATHER)
    else:
        s = p['s']
        _box(L, 19 - s, 38, 24 - s, 40, _dn(P_LEATHER))
        _box(L, 19 + s, 38, 24 + s, 40, P_LEATHER)
    out.append(L)

    # --- túnica
    L = _L()
    if dr == 0:
        L.poly([(19, 21 + b), (28, 21 + b), (32 + sway, 38), (15 + sway, 38)], M[MD])
        L.line([(19, 22 + b), (15 + sway, 37)], M[LT])
        L.line([(28, 22 + b), (32 + sway, 37)], M[DK])
        for x in (21, 26):
            L.line([(x, 31), (x + (x - 23) // 2 + sway, 37)], M[DK])
        L.rect(15 + sway, 36, 32 + sway, 38, G[MD])
        L.line([(15 + sway, 36), (32 + sway, 36)], G[LT])
        L.rect(19, 28 + b, 28, 29 + b, G[MD])
        L.px(23, 28 + b, G[HI]); L.px(24, 28 + b, G[HI])
        L.rect(23, 30 + b, 24, 35, G[DK])
    elif dr == 3:
        L.poly([(19, 21 + b), (28, 21 + b), (32 + sway, 38), (15 + sway, 38)], _dn(M)[MD])
        L.line([(19, 22 + b), (15 + sway, 37)], M[MD])
        L.line([(28, 22 + b), (32 + sway, 37)], M[DP])
        L.line([(24, 25 + b), (24, 36)], M[DP])
        L.rect(15 + sway, 36, 32 + sway, 38, G[DK])
        L.rect(19, 28 + b, 28, 29 + b, G[DK])
    else:
        L.poly([(20, 21 + b), (28, 21 + b), (31 + sway, 38), (17 + sway, 38)], M[MD])
        L.line([(20, 22 + b), (17 + sway, 37)], M[LT])
        L.line([(28, 22 + b), (31 + sway, 37)], M[DK])
        L.line([(24, 32), (23 + sway, 37)], M[DK])
        L.rect(17 + sway, 36, 31 + sway, 38, G[MD])
        L.line([(17 + sway, 36), (31 + sway, 36)], G[LT])
        L.rect(20, 28 + b, 28, 29 + b, G[MD])
    out.append(L)

    # --- bastón (detrás del cuerpo en perfil)
    stf = STAFF[1 if dr == 2 else dr]['idle' if ai is None else ai]

    def staff(L2):
        (hx, hy), (tx, ty) = stf
        L2.line([(hx, hy), (tx, ty)], Wd[MD], 2)
        L2.line([(hx - 1, hy), (tx - 1, ty)], Wd[LT], 1)
        L2.px(tx + 1, ty + 2, G[MD]); L2.px(tx - 1, ty + 2, G[MD])
        r = 3
        _ball(L2, tx - r, ty - r - 1, tx + r, ty + r - 1, P_ORB)

    if dr == 1:
        L = _L()
        staff(L)
        out.append(L)

    # --- cabeza
    L = _L()
    if dr == 0:
        _ball(L, 18, 11 + b, 29, 22 + b, K)
        L.rect(21, 16 + b, 21, 17 + b, (28, 22, 40, 255))
        L.rect(26, 16 + b, 26, 17 + b, (28, 22, 40, 255))
        L.poly([(18, 18 + b), (29, 18 + b), (27, 27 + b), (24, 31 + b), (21, 27 + b)], Wh[LT])
        L.line([(19, 19 + b), (21, 27 + b)], Wh[HI])
        L.line([(28, 19 + b), (26, 27 + b)], Wh[DK])
        L.line([(21, 19 + b), (26, 19 + b)], Wh[MD])
    elif dr == 3:
        _ball(L, 18, 11 + b, 29, 22 + b, Wh)
        L.poly([(19, 18 + b), (28, 18 + b), (27, 28 + b), (24, 31 + b), (21, 28 + b)], Wh[MD])
        L.line([(24, 20 + b), (24, 29 + b)], Wh[DK])
    else:
        _ball(L, 18, 11 + b, 28, 22 + b, K)
        L.rect(19, 16 + b, 19, 17 + b, (28, 22, 40, 255))
        L.px(17, 17 + b, K[LT])
        L.poly([(17, 18 + b), (23, 18 + b), (23, 27 + b), (20, 29 + b), (18, 24 + b)], Wh[LT])
        L.line([(18, 19 + b), (19, 25 + b)], Wh[HI])
        L.poly([(23, 16 + b), (29, 16 + b), (28, 24 + b), (24, 24 + b)], Wh[MD])
    _shift(L, 0, 2)
    out.append(L)

    # --- sombrero
    L = _L()
    if dr == 3:
        L.ell(13, 9 + b, 34, 17 + b, M[DK])
        L.ell(14, 9 + b, 33, 15 + b, M[MD])
        L.poly([(18, 11 + b), (29, 11 + b), (27, 5 + b), (31, 0 + b), (24, 3 + b), (22, 6 + b)], M[MD])
        L.line([(19, 11 + b), (22, 6 + b)], M[LT])
        L.line([(29, 11 + b), (27, 5 + b)], M[DK])
        L.rect(18, 9 + b, 29, 10 + b, G[DK])
    elif dr == 0:
        L.ell(13, 9 + b, 34, 17 + b, M[DK])
        L.ell(14, 9 + b, 33, 15 + b, M[MD])
        L.line([(16, 10 + b), (30, 10 + b)], M[LT])
        L.poly([(18, 12 + b), (29, 12 + b), (27, 5 + b), (31, 0 + b), (24, 3 + b), (22, 6 + b)], M[MD])
        L.line([(19, 11 + b), (22, 6 + b)], M[LT])
        L.line([(29, 11 + b), (27, 5 + b)], M[DK])
        L.rect(18, 10 + b, 29, 11 + b, G[MD])
        L.line([(18, 10 + b), (29, 10 + b)], G[HI])
        L.px(23, 11 + b, P_RED[LT]); L.px(24, 11 + b, P_RED[MD])
    else:
        L.ell(13, 9 + b, 32, 17 + b, M[DK])
        L.ell(14, 9 + b, 31, 15 + b, M[MD])
        L.line([(16, 10 + b), (28, 10 + b)], M[LT])
        L.poly([(18, 12 + b), (28, 12 + b), (28, 6 + b), (33, 2 + b), (25, 4 + b), (21, 7 + b)], M[MD])
        L.line([(19, 11 + b), (21, 7 + b)], M[LT])
        L.line([(28, 11 + b), (28, 6 + b)], M[DK])
        L.rect(18, 10 + b, 28, 11 + b, G[MD])
        L.line([(18, 10 + b), (28, 10 + b)], G[HI])
    out.append(L)

    # --- bastón delante (frente/espalda) + mangas
    if dr != 1:
        L = _L()
        staff(L)
        out.append(L)
    L = _L()
    al, ar = p['al'], p['ar']
    if dr == 0:
        L.poly([(15, 22 + b), (19, 22 + b), (18, 30 + b + al), (11, 31 + b + al)], M[MD])
        L.line([(15, 22 + b), (11, 31 + b + al)], M[LT])
        L.line([(11, 31 + b + al), (18, 30 + b + al)], G[MD])
        _hand(L, 14, 32 + b + al)
        L.poly([(28, 22 + b), (32, 22 + b), (34, 30 + b + ar), (27, 30 + b + ar)], M[MD])
        L.line([(32, 22 + b), (34, 30 + b + ar)], M[DK])
        L.line([(27, 30 + b + ar), (34, 30 + b + ar)], G[MD])
        _hand(L, 33, 32 + b + ar)
    elif dr == 3:
        L.poly([(15, 22 + b), (19, 22 + b), (18, 30 + b + al), (11, 31 + b + al)], _dn(M)[MD])
        L.line([(11, 31 + b + al), (18, 30 + b + al)], G[DK])
        L.poly([(28, 22 + b), (32, 22 + b), (34, 30 + b + ar), (27, 30 + b + ar)], _dn(M)[MD])
        L.line([(27, 30 + b + ar), (34, 30 + b + ar)], G[DK])
        _hand(L, 33, 32 + b + ar)
    else:
        s = p['s']
        hx, hy = stf[0]
        L.poly([(22, 22 + b), (27, 22 + b), (hx + 4, hy - 2), (hx - 3, hy - 2)], M[MD])
        L.line([(22, 22 + b), (hx - 3, hy - 2)], M[LT])
        L.line([(hx - 3, hy - 2), (hx + 4, hy - 2)], G[MD])
        _hand(L, hx, hy)
    out.append(L)

    # --- brillo del orbe (efecto sin contorno)
    fx = _L(noline=True)
    (tx, ty) = stf[1]
    if ai is None:
        rad = 5 + (anim % 2)
        al_ = 70
    else:
        rad = {0: 6, 1: 9, 2: 7}[ai]
        al_ = {0: 90, 1: 150, 2: 100}[ai]
    fx.ell(tx - rad, ty - 1 - rad, tx + rad, ty - 1 + rad, (255, 190, 90, al_ // 2))
    fx.ell(tx - rad + 2, ty - 1 - rad + 2, tx + rad - 2, ty - 1 + rad - 2, (255, 225, 130, al_))
    if ai == 1:
        for ang in range(0, 360, 60):
            ax = tx + int(math.cos(math.radians(ang)) * (rad + 3))
            ay = ty - 1 + int(math.sin(math.radians(ang)) * (rad + 3))
            fx.px(ax, ay, (255, 245, 190, 230))
    out.append(fx)
    return out


def _render_hero(cls, direction, anim, is_attack):
    """direction: 0 abajo, 1 izquierda, 2 derecha (espejo de 1), 3 arriba."""
    dr = 1 if direction == 2 else direction
    p = _pose(is_attack, anim)
    ai = anim if is_attack else None
    if is_attack and cls == 'warrior':
        p['s'] = 0
    if cls == 'warrior':
        layers = _warrior_layers(dr, p, ai)
    elif cls == 'archer':
        layers = _archer_layers(dr, p, ai)
    else:
        layers = _mage_layers(dr, p, ai, anim)

    img = create_canvas(48, 48)
    sh = ImageDraw.Draw(img)
    sh.ellipse([13, 38, 35, 44], fill=(10, 10, 18, 105))
    sh.ellipse([16, 39, 32, 43], fill=(10, 10, 18, 70))
    for L in layers:
        img.alpha_composite(L.im if L.noline else _outline(L.im))
    if direction == 2:
        img = ImageOps.mirror(img)
    return img


def draw_warrior_frame(direction, anim_frame, is_attack=False):
    """Guerrero: armadura de acero, capa azul, pluma roja, espada y escudo."""
    return _render_hero('warrior', direction, anim_frame, is_attack)


def draw_archer_frame(direction, anim_frame, is_attack=False):
    """Arquero: capucha verde, jubón de cuero, carcaj y arco."""
    return _render_hero('archer', direction, anim_frame, is_attack)


def draw_mage_frame(direction, anim_frame, is_attack=False):
    """Mago: túnica púrpura, sombrero puntiagudo, barba y bastón con orbe."""
    return _render_hero('mage', direction, anim_frame, is_attack)


# ==============================================================================
# 2. GENERADOR DE ENEMIGOS Y MONSTRUOS
# ==============================================================================

def draw_bandit_frame(direction, anim_frame, is_attack=False):
    img = create_canvas(48, 48)
    d = ImageDraw.Draw(img)
    
    leg_offset = 2 if anim_frame == 1 else (-2 if anim_frame == 3 else 0)
    cx, cy = 24, 25
    
    CLOTH_BROWN = (100, 70, 50, 255)
    PANTS_DARK = (55, 55, 65, 255)
    RED_MASK = (190, 40, 40, 255)
    STEEL = (210, 220, 230, 255)
    SKIN = (235, 180, 145, 255)
    
    rect(d, cx - 5 + leg_offset, cy + 9, 4, 8, PANTS_DARK, OUTLINE)
    rect(d, cx + 1 - leg_offset, cy + 9, 4, 8, PANTS_DARK, OUTLINE)
    
    rect(d, cx - 5, cy - 2, 10, 11, CLOTH_BROWN, OUTLINE)
    rect(d, cx - 4, cy + 4, 8, 3, (40, 30, 25, 255))
    
    rect(d, cx - 5, cy - 12, 10, 10, SKIN, OUTLINE)
    rect(d, cx - 6, cy - 8, 12, 6, RED_MASK, OUTLINE)
    rect(d, cx + 5, cy - 6, 4, 3, RED_MASK)
    d.point((cx - 3, cy - 10), fill=OUTLINE)
    d.point((cx + 2, cy - 10), fill=OUTLINE)
    
    if not is_attack:
        rect(d, cx + 6, cy + 1, 3, 7, STEEL, OUTLINE)
        rect(d, cx - 9, cy + 1, 3, 7, STEEL, OUTLINE)
    else:
        rect(d, cx + 8, cy - 4, 11, 4, STEEL, OUTLINE)
        ellipse(d, cx + 16, cy - 6, 8, 8, None, (255, 230, 180, 200))
        
    return img

def draw_skeleton_frame(direction, anim_frame, is_attack=False):
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
    GLOW_EYE = (255, 45, 45, 255)
    GLOW_CORE = (255, 200, 200, 255)
    
    ellipse(d, cx - 8, cy + 15, 16, 5, (10, 10, 16, 110))
    
    rect(d, cx - 4 + leg_offset, cy + 8, 3, 5, BONE_WHITE, OUTLINE)
    rect(d, cx - 4 + leg_offset, cy + 12, 3, 5, BONE_WHITE, OUTLINE)
    rect(d, cx - 5 + leg_offset, cy + 16, 4, 2, BONE_LIGHT, OUTLINE)
    
    rect(d, cx + 2 - leg_offset, cy + 8, 3, 5, BONE_WHITE, OUTLINE)
    rect(d, cx + 2 - leg_offset, cy + 12, 3, 5, BONE_WHITE, OUTLINE)
    rect(d, cx + 2 - leg_offset, cy + 16, 4, 2, BONE_LIGHT, OUTLINE)
    
    rect(d, cx - 4, cy + 6, 9, 3, BONE_SHADOW, OUTLINE)
    
    rect(d, cx - 1, cy - 3, 3, 10, BONE_DARK)
    for r in range(4):
        rect(d, cx - 5, cy - 3 + r * 2, 11, 1, BONE_WHITE, OUTLINE)
        d.point((cx - 4, cy - 3 + r * 2), fill=BONE_LIGHT)
        d.point((cx + 4, cy - 3 + r * 2), fill=BONE_LIGHT)
    
    rect(d, cx - 6, cy - 14, 12, 10, BONE_WHITE, OUTLINE)
    d.line([(cx - 5, cy - 13), (cx + 4, cy - 13)], fill=BONE_LIGHT)
    rect(d, cx - 4, cy - 4, 8, 3, BONE_SHADOW, OUTLINE)
    d.point((cx - 3, cy - 3), fill=BONE_WHITE)
    d.point((cx - 1, cy - 3), fill=BONE_WHITE)
    d.point((cx + 1, cy - 3), fill=BONE_WHITE)
    
    if direction == 0:
        rect(d, cx - 4, cy - 10, 3, 3, (15, 10, 20, 255))
        rect(d, cx + 1, cy - 10, 3, 3, (15, 10, 20, 255))
        d.point((cx - 3, cy - 9), fill=GLOW_EYE)
        d.point((cx - 3, cy - 10), fill=GLOW_CORE)
        d.point((cx + 2, cy - 9), fill=GLOW_EYE)
        d.point((cx + 2, cy - 10), fill=GLOW_CORE)
    elif direction in (1, 2):
        sgn = -1 if direction == 1 else 1
        rect(d, cx + 1 * sgn, cy - 10, 3, 3, (15, 10, 20, 255))
        d.point((cx + 2 * sgn, cy - 9), fill=GLOW_EYE)
        d.point((cx + 2 * sgn, cy - 10), fill=GLOW_CORE)
    
    if not is_attack:
        if direction in (0, 2):
            rect(d, cx + 6, cy - 1, 3, 13, RUST_STEEL, OUTLINE)
            d.line([(cx + 7, cy), (cx + 7, cy + 9)], fill=(220, 200, 185, 255))
            rect(d, cx + 4, cy - 2, 7, 2, RUST_DARK, OUTLINE)
        else:
            d.line([(cx - 7, cy - 8), (cx - 10, cy + 2), (cx - 7, cy + 12)], fill=BONE_WHITE, width=2)
            d.line([(cx - 7, cy - 8), (cx - 7, cy + 12)], fill=(180, 180, 180, 200))
    else:
        if direction in (0, 2):
            rect(d, cx + 6, cy - 7, 14, 4, RUST_STEEL, OUTLINE)
            d.line([(cx + 8, cy - 6), (cx + 18, cy - 6)], fill=(240, 220, 200, 255))
            ellipse(d, cx + 10, cy - 12, 16, 14, None, (255, 100, 100, 180))
        else:
            rect(d, cx - 18, cy - 7, 14, 4, RUST_STEEL, OUTLINE)
            ellipse(d, cx - 22, cy - 12, 16, 14, None, (255, 100, 100, 180))
            
    return img

def draw_spider_frame(direction, anim_frame):
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
    
    ellipse(d, cx - 14, cy + 8, 28, 10, (10, 10, 16, 120))
    p = 3 if anim_frame in (1, 2) else -3
    
    d.line([(cx - 4, cy - 3), (cx - 14, cy - 10 + p), (cx - 20, cy - 4)], fill=LEG_COLOR, width=2)
    d.point((cx - 14, cy - 10 + p), fill=LEG_JOINT)
    d.line([(cx - 5, cy), (cx - 17, cy - 2 - p), (cx - 22, cy + 4)], fill=LEG_COLOR, width=2)
    d.point((cx - 17, cy - 2 - p), fill=LEG_JOINT)
    d.line([(cx - 5, cy + 3), (cx - 16, cy + 8 + p), (cx - 20, cy + 14)], fill=LEG_COLOR, width=2)
    d.line([(cx - 4, cy + 6), (cx - 13, cy + 15 - p), (cx - 17, cy + 19)], fill=LEG_COLOR, width=2)
    
    d.line([(cx + 4, cy - 3), (cx + 14, cy - 10 - p), (cx + 20, cy - 4)], fill=LEG_COLOR, width=2)
    d.point((cx + 14, cy - 10 - p), fill=LEG_JOINT)
    d.line([(cx + 5, cy), (cx + 17, cy - 2 + p), (cx + 22, cy + 4)], fill=LEG_COLOR, width=2)
    d.point((cx + 17, cy - 2 + p), fill=LEG_JOINT)
    d.line([(cx + 5, cy + 3), (cx + 16, cy + 8 - p), (cx + 20, cy + 14)], fill=LEG_COLOR, width=2)
    d.line([(cx + 4, cy + 6), (cx + 13, cy + 15 + p), (cx + 17, cy + 19)], fill=LEG_COLOR, width=2)

    ellipse(d, cx - 8, cy - 2, 16, 17, BODY_PURPLE, OUTLINE)
    ellipse(d, cx - 6, cy, 12, 13, (36, 20, 44, 255))
    
    ellipse(d, cx - 4, cy + 2, 8, 8, POISON_GREEN)
    ellipse(d, cx - 2, cy + 4, 4, 4, POISON_BRIGHT)
    d.point((cx, cy + 8), fill=BODY_DARK)
    
    ellipse(d, cx - 5, cy - 9, 10, 9, BODY_DARK, OUTLINE)
    d.point((cx - 3, cy - 7), fill=RED_EYES)
    d.point((cx - 1, cy - 8), fill=RED_EYES)
    d.point((cx + 1, cy - 8), fill=RED_EYES)
    d.point((cx + 3, cy - 7), fill=RED_EYES)
    rect(d, cx - 3, cy - 2, 2, 4, POISON_GREEN, OUTLINE)
    rect(d, cx + 1, cy - 2, 2, 4, POISON_GREEN, OUTLINE)
    
    return img

def draw_rat_frame(direction, anim_frame, is_attack=False):
    img = create_canvas(48, 48)
    d = ImageDraw.Draw(img)
    
    cx, cy = 24, 26
    leg_off = 2 if anim_frame in (1, 3) else -2
    
    FUR_BROWN = (95, 75, 60, 255)
    FUR_LIGHT = (130, 105, 85, 255)
    SKIN_PINK = (215, 145, 145, 255)
    EYE_RED = (255, 30, 30, 255)
    
    ellipse(d, cx - 12, cy + 8, 24, 8, (10, 10, 16, 120))
    tail_w = 4 if anim_frame % 2 == 0 else -4
    d.line([(cx - 10, cy + 2), (cx - 16, cy + 4 + tail_w), (cx - 21, cy + 1)], fill=SKIN_PINK, width=2)
    
    rect(d, cx - 8 + leg_off, cy + 6, 4, 5, SKIN_PINK, OUTLINE)
    rect(d, cx + 4 - leg_off, cy + 6, 4, 5, SKIN_PINK, OUTLINE)
    
    ellipse(d, cx - 11, cy - 5, 20, 14, FUR_BROWN, OUTLINE)
    ellipse(d, cx - 8, cy - 3, 14, 9, FUR_LIGHT)
    
    if direction in (0, 2):
        ellipse(d, cx + 1, cy - 6, 11, 10, FUR_BROWN, OUTLINE)
        d.polygon([(cx + 8, cy - 3), (cx + 15, cy - 1), (cx + 8, cy + 2)], fill=SKIN_PINK, outline=OUTLINE)
        d.point((cx + 7, cy - 4), fill=EYE_RED)
        ellipse(d, cx + 1, cy - 9, 5, 5, SKIN_PINK, OUTLINE)
        if is_attack:
            d.line([(cx + 14, cy - 1), (cx + 18, cy)], fill=(255, 255, 240, 255), width=2)
    else:
        ellipse(d, cx - 12, cy - 6, 11, 10, FUR_BROWN, OUTLINE)
        d.polygon([(cx - 8, cy - 3), (cx - 15, cy - 1), (cx - 8, cy + 2)], fill=SKIN_PINK, outline=OUTLINE)
        d.point((cx - 7, cy - 4), fill=EYE_RED)
        ellipse(d, cx - 5, cy - 9, 5, 5, SKIN_PINK, OUTLINE)
        if is_attack:
            d.line([(cx - 14, cy - 1), (cx - 18, cy)], fill=(255, 255, 240, 255), width=2)
            
    return img

def draw_werewolf_frame(direction, anim_frame, is_attack=False):
    img = create_canvas(56, 56)
    d = ImageDraw.Draw(img)
    
    cx, cy = 28, 28
    leg_offset = 3 if anim_frame == 1 else (-3 if anim_frame == 3 else 0)
    
    FUR_GREY = (90, 80, 75, 255)
    FUR_DARK = (55, 45, 42, 255)
    FUR_LIGHT = (130, 115, 105, 255)
    CLAW_BONE = (220, 220, 210, 255)
    EYE_YELLOW = (255, 220, 30, 255)
    
    rect(d, cx - 6 + leg_offset, cy + 11, 5, 10, FUR_DARK, OUTLINE)
    rect(d, cx + 1 - leg_offset, cy + 11, 5, 10, FUR_DARK, OUTLINE)
    
    ellipse(d, cx - 9, cy - 4, 18, 17, FUR_GREY, OUTLINE)
    rect(d, cx - 5, cy - 2, 10, 6, FUR_LIGHT)
    
    rect(d, cx - 7, cy - 15, 14, 12, FUR_GREY, OUTLINE)
    d.polygon([(cx - 7, cy - 15), (cx - 5, cy - 21), (cx - 3, cy - 15)], fill=FUR_DARK, outline=OUTLINE)
    d.polygon([(cx + 3, cy - 15), (cx + 5, cy - 21), (cx + 7, cy - 15)], fill=FUR_DARK, outline=OUTLINE)
    rect(d, cx - 4, cy - 8, 8, 6, FUR_DARK, OUTLINE)
    d.point((cx - 3, cy - 5), fill=CLAW_BONE)
    d.point((cx + 2, cy - 5), fill=CLAW_BONE)
    d.point((cx - 4, cy - 11), fill=EYE_YELLOW)
    d.point((cx + 3, cy - 11), fill=EYE_YELLOW)
    
    if not is_attack:
        rect(d, cx - 14, cy + 2, 5, 10, FUR_GREY, OUTLINE)
        rect(d, cx + 9, cy + 2, 5, 10, FUR_GREY, OUTLINE)
        rect(d, cx - 14, cy + 12, 5, 3, CLAW_BONE)
        rect(d, cx + 9, cy + 12, 5, 3, CLAW_BONE)
    else:
        rect(d, cx + 9, cy - 6, 12, 6, FUR_GREY, OUTLINE)
        d.line([(cx + 21, cy - 8), (cx + 26, cy - 2)], fill=CLAW_BONE, width=2)
        d.line([(cx + 21, cy - 4), (cx + 26, cy + 2)], fill=CLAW_BONE, width=2)
        d.line([(cx + 21, cy), (cx + 26, cy + 6)], fill=CLAW_BONE, width=2)
        
    return img

def draw_demon_frame(direction, anim_frame, is_attack=False):
    img = create_canvas(56, 56)
    d = ImageDraw.Draw(img)
    
    cx, cy = 28, 28
    leg_offset = 2 if anim_frame == 1 else (-2 if anim_frame == 3 else 0)
    
    DEMON_RED = (185, 35, 45, 255)
    DEMON_DARK = (110, 20, 30, 255)
    HORN_BLACK = (45, 30, 40, 255)
    WING_PURPLE = (75, 35, 90, 255)
    EYE_FIRE = (255, 200, 30, 255)
    
    d.polygon([(cx - 6, cy - 4), (cx - 22, cy - 14), (cx - 14, cy + 4)], fill=WING_PURPLE, outline=OUTLINE)
    d.polygon([(cx + 6, cy - 4), (cx + 22, cy - 14), (cx + 14, cy + 4)], fill=WING_PURPLE, outline=OUTLINE)
    
    d.line([(cx, cy + 8), (cx - 10, cy + 14), (cx - 14, cy + 10)], fill=DEMON_DARK, width=2)
    d.polygon([(cx - 14, cy + 8), (cx - 18, cy + 10), (cx - 14, cy + 13)], fill=DEMON_RED)
    
    rect(d, cx - 6 + leg_offset, cy + 10, 4, 10, DEMON_DARK, OUTLINE)
    rect(d, cx + 2 - leg_offset, cy + 10, 4, 10, DEMON_DARK, OUTLINE)
    
    rect(d, cx - 7, cy - 3, 14, 14, DEMON_RED, OUTLINE)
    
    rect(d, cx - 6, cy - 14, 12, 11, DEMON_RED, OUTLINE)
    d.polygon([(cx - 6, cy - 14), (cx - 13, cy - 22), (cx - 4, cy - 16)], fill=HORN_BLACK, outline=OUTLINE)
    d.polygon([(cx + 6, cy - 14), (cx + 13, cy - 22), (cx + 4, cy - 16)], fill=HORN_BLACK, outline=OUTLINE)
    d.point((cx - 3, cy - 10), fill=EYE_FIRE)
    d.point((cx + 2, cy - 10), fill=EYE_FIRE)
    
    if is_attack:
        ellipse(d, cx + 8, cy - 6, 12, 12, (180, 30, 220, 200), (255, 100, 255, 255))
        
    return img

def draw_abracadabra_frame(state, frame_idx):
    img = create_canvas(72, 72)
    d = ImageDraw.Draw(img)
    
    cx, cy = 36, 38
    
    FLESH_GREEN = (145, 175, 130, 255)
    FLESH_DARK = (95, 125, 85, 255)
    PUSTULE_NEON = (180, 255, 30, 255)
    ACID_GREEN = (90, 240, 50, 255)
    TEETH_YELLOW = (220, 210, 130, 255)
    RAGS_DIRT = (80, 65, 55, 255)
    
    swell_w = 0
    if state == 'swell':
        swell_w = frame_idx * 4
    elif state == 'vomit':
        swell_w = 2
    elif state == 'charge':
        swell_w = 1
        cx += 4
        
    leg_off = 2 if frame_idx % 2 == 1 else -2
    rect(d, cx - 15 + leg_off, cy + 16, 12, 14, FLESH_DARK, OUTLINE)
    rect(d, cx + 3 - leg_off, cy + 16, 12, 14, FLESH_DARK, OUTLINE)
    
    rect(d, cx - 18 - swell_w//2, cy + 10, 36 + swell_w, 10, RAGS_DIRT, OUTLINE)
    ellipse(d, cx - 22 - swell_w, cy - 14 - swell_w//2, 44 + swell_w * 2, 38 + swell_w, FLESH_GREEN, OUTLINE)
    
    d.arc([cx - 16, cy + 2, cx + 16, cy + 14], 0, 180, fill=FLESH_DARK, width=2)
    
    ellipse(d, cx - 18, cy - 12, 8, 8, PUSTULE_NEON, OUTLINE)
    ellipse(d, cx - 12, cy - 8, 6, 6, PUSTULE_NEON, OUTLINE)
    ellipse(d, cx + 12, cy - 14, 10, 10, PUSTULE_NEON, OUTLINE)
    ellipse(d, cx + 18, cy - 6, 6, 6, PUSTULE_NEON, OUTLINE)
    
    ellipse(d, cx - 11, cy - 26 - swell_w//2, 22, 18, FLESH_GREEN, OUTLINE)
    d.point((cx - 6, cy - 22 - swell_w//2), fill=(255, 230, 40, 255))
    d.point((cx + 5, cy - 22 - swell_w//2), fill=(255, 230, 40, 255))
    
    if state != 'vomit':
        rect(d, cx - 7, cy - 17 - swell_w//2, 14, 5, OUTLINE)
        d.point((cx - 5, cy - 16 - swell_w//2), fill=TEETH_YELLOW)
        d.point((cx, cy - 16 - swell_w//2), fill=TEETH_YELLOW)
        d.point((cx + 4, cy - 16 - swell_w//2), fill=TEETH_YELLOW)
        rect(d, cx - 2, cy - 12 - swell_w//2, 4, 6, ACID_GREEN)
    else:
        ellipse(d, cx - 9, cy - 18, 18, 12, OUTLINE)
        d.polygon([(cx - 6, cy - 12), (cx + 6, cy - 12), (cx + 20, cy + 16), (cx - 20, cy + 16)], fill=ACID_GREEN, outline=OUTLINE)
        ellipse(d, cx - 14, cy + 18, 6, 6, PUSTULE_NEON)
        ellipse(d, cx + 8, cy + 20, 8, 8, PUSTULE_NEON)
        
    return img

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
    
    cy += 2 if frame_idx in (1, 3) else 0
    
    rect(d, cx - 18, cy + 24, 14, 18, HONG_CHITIN, OUTLINE)
    rect(d, cx + 4, cy + 24, 14, 18, HONG_CHITIN, OUTLINE)
    
    d.polygon([(cx - 10, cy - 10), (cx - 44, cy - 36), (cx - 26, cy + 10)], fill=HONG_DARK, outline=OUTLINE)
    d.polygon([(cx + 10, cy - 10), (cx + 44, cy - 36), (cx + 26, cy + 10)], fill=HONG_DARK, outline=OUTLINE)
    
    ellipse(d, cx - 24, cy - 16, 48, 46, HONG_RED, OUTLINE)
    
    mouth_open = 2 + (frame_idx % 2) * 2
    ellipse(d, cx - 16, cy - 8, 14, 8 + mouth_open, VOID_PURPLE, OUTLINE)
    for t in range(4):
        d.point((cx - 14 + t * 3, cy - 7), fill=TOOTH_IVORY)
        d.point((cx - 14 + t * 3, cy - 2 + mouth_open), fill=TOOTH_IVORY)
        
    ellipse(d, cx - 16, cy + 6, 32, 12 + mouth_open * 2, (20, 5, 25, 255), OUTLINE)
    for t in range(8):
        d.line([(cx - 13 + t * 4, cy + 8), (cx - 11 + t * 4, cy + 11)], fill=TOOTH_IVORY, width=2)
        d.line([(cx - 13 + t * 4, cy + 15 + mouth_open * 2), (cx - 11 + t * 4, cy + 12 + mouth_open * 2)], fill=TOOTH_IVORY, width=2)
        
    rect(d, cx - 2, cy + 18 + mouth_open * 2, 4, 8, VOID_PURPLE)
    
    ellipse(d, cx - 14, cy - 34, 28, 22, HONG_RED, OUTLINE)
    d.polygon([(cx - 12, cy - 30), (cx - 32, cy - 44), (cx - 22, cy - 24)], fill=HONG_CHITIN, outline=OUTLINE)
    d.polygon([(cx + 12, cy - 30), (cx + 32, cy - 44), (cx + 22, cy - 24)], fill=HONG_CHITIN, outline=OUTLINE)
    ellipse(d, cx - 9, cy - 28, 5, 5, FIRE_EYES, OUTLINE)
    ellipse(d, cx + 4, cy - 28, 5, 5, FIRE_EYES, OUTLINE)
    
    if not is_cleave:
        rect(d, cx - 34, cy - 10, 10, 24, HONG_RED, OUTLINE)
        rect(d, cx + 24, cy - 10, 10, 24, HONG_RED, OUTLINE)
        for g in range(3):
            d.line([(cx - 32 + g * 3, cy + 14), (cx - 36 + g * 3, cy + 22)], fill=TOOTH_IVORY, width=2)
            d.line([(cx + 26 + g * 3, cy + 14), (cx + 30 + g * 3, cy + 22)], fill=TOOTH_IVORY, width=2)
    else:
        rect(d, cx + 18, cy - 26, 26, 12, HONG_RED, OUTLINE)
        for g in range(4):
            d.line([(cx + 44, cy - 26 + g * 4), (cx + 52, cy - 20 + g * 4)], fill=TOOTH_IVORY, width=3)
        ellipse(d, cx + 30, cy - 20, 24, 24, None, (220, 80, 255, 220))
        
    return img

# ==============================================================================
# 3. TILES, PROPS E ICONOS (CORREGIDO)
# ==============================================================================

def _shade(c, f):
    """Multiplica el brillo de un color RGB(A) por f."""
    a = c[3] if len(c) > 3 else 255
    return (max(0, min(255, int(c[0] * f))),
            max(0, min(255, int(c[1] * f))),
            max(0, min(255, int(c[2] * f))), a)


# Estilo por bioma. Todos los tilesets comparten el MISMO layout (ver generate_tiles).
TILE_STYLES = {
    'crypt': dict(floor=(108, 99, 92), brick=(62, 54, 76), cap=(112, 100, 130),
                  top=(36, 31, 46), void=(17, 14, 24), crack=(34, 30, 34)),
    'demon': dict(floor=(84, 58, 62), brick=(104, 38, 48), cap=(176, 82, 94),
                  top=(50, 22, 30), void=(21, 9, 14), crack=(30, 16, 20)),
    'acid':  dict(floor=(92, 106, 86), brick=(48, 66, 46), cap=(124, 154, 112),
                  top=(26, 36, 26), void=(11, 17, 11), crack=(30, 40, 28)),
    'apex':  dict(floor=(72, 70, 96), brick=(48, 44, 78), cap=(112, 106, 164),
                  top=(28, 26, 48), void=(12, 11, 22), crack=(22, 20, 40)),
}

# Cada fila: (y0, y1, [cortes en x]). Distintos cortes = 4 variantes de losas.
FLOOR_LAYOUTS = [
    [(0, 16, [16]), (16, 32, [9])],
    [(0, 10, [21]), (10, 21, [8, 24]), (21, 32, [15])],
    [(0, 16, [7, 23]), (16, 32, [17])],
    [(0, 22, [12]), (22, 32, [22])],
]


def _floor_tile(S, variant, rng):
    """Losas con bisel suave y juntas de bajo contraste (no cuadrícula marcada)."""
    mid = S['floor']
    img = Image.new('RGBA', (32, 32), _shade(mid, 0.80))   # color de junta
    d = ImageDraw.Draw(img)
    for (y0, y1, cuts) in FLOOR_LAYOUTS[variant]:
        xs = [0] + cuts + [32]
        for i in range(len(xs) - 1):
            x0, x1 = xs[i], xs[i + 1]
            tone = _shade(mid, rng.choice([0.94, 1.0, 1.0, 1.04, 1.08]))
            d.rectangle([x0, y0, x1 - 2, y1 - 2], fill=tone)
            d.line([(x0, y0), (x1 - 2, y0)], fill=_shade(tone, 1.12))
            d.line([(x0, y0), (x0, y1 - 2)], fill=_shade(tone, 1.06))
            d.line([(x0 + 1, y1 - 2), (x1 - 2, y1 - 2)], fill=_shade(tone, 0.90))
    for _ in range(22):   # granulado
        x, y = rng.randrange(32), rng.randrange(32)
        img.putpixel((x, y), _shade(img.getpixel((x, y)), rng.choice([0.88, 0.92, 1.08, 1.12])))
    return img


def _crack_points(rng):
    x, y = rng.randint(7, 24), rng.randint(2, 7)
    pts = [(x, y)]
    for _ in range(6):
        x = max(3, min(28, x + rng.randint(-4, 4)))
        y = min(30, y + rng.randint(3, 5))
        pts.append((x, y))
    return pts


def _floor_accent(S, kind, which, rng):
    """which: 'crack' | 'a1' | 'a2' | 'rubble' (mapea a la fila 1 del tileset)."""
    img = _floor_tile(S, rng.randrange(4), rng)
    d = ImageDraw.Draw(img)
    if which == 'crack':
        pts = _crack_points(rng)
        d.line(pts, fill=S['crack'], width=1)
        d.line([(x + 1, y) for x, y in pts], fill=_shade(S['floor'], 1.15), width=1)
    elif which == 'rubble':
        for _ in range(4):
            x, y = rng.randint(5, 25), rng.randint(6, 25)
            r = rng.randint(2, 4)
            d.ellipse([x - r, y + 1, x + r + 1, y + r + 2], fill=(10, 10, 16, 110))
            d.ellipse([x - r, y - r // 2, x + r, y + r // 2 + 1], fill=_shade(S['floor'], 0.72), outline=_shade(S['floor'], 0.5))
            d.point((x - 1, y - 1), fill=_shade(S['floor'], 1.2))
    elif kind == 'crypt':
        if which == 'a1':    # charco de agua oscura
            d.ellipse([6, 10, 26, 24], fill=(30, 40, 54, 255), outline=(22, 28, 38, 255))
            d.ellipse([8, 12, 22, 20], fill=(40, 56, 74, 255))
            d.line([(10, 14), (15, 14)], fill=(92, 120, 146, 255))
            d.point((19, 17), fill=(92, 120, 146, 255))
        else:                # musgo
            for _ in range(7):
                x, y = rng.randint(2, 26), rng.randint(2, 28)
                d.rectangle([x, y, x + rng.randint(2, 4), y + 1], fill=(58, 86, 52, 255))
                d.point((x + 1, y), fill=(92, 128, 70, 255))
    elif kind == 'demon':
        if which == 'a1':    # grieta de lava
            pts = _crack_points(rng)
            d.line(pts, fill=(150, 24, 20, 255), width=3)
            d.line(pts, fill=(255, 120, 30, 255), width=2)
            d.line(pts, fill=(255, 220, 90, 255), width=1)
        else:                # ceniza y brasas
            for _ in range(10):
                x, y = rng.randrange(32), rng.randrange(32)
                d.point((x, y), fill=(255, 140, 40, 255) if rng.random() < 0.4 else (40, 26, 30, 255))
    elif kind == 'acid':
        if which == 'a1':    # charco tóxico
            d.ellipse([5, 9, 27, 24], fill=(40, 96, 34, 255), outline=(22, 52, 20, 255))
            d.ellipse([8, 12, 23, 21], fill=(84, 200, 52, 255))
            d.point((12, 15), fill=(190, 255, 90, 255))
            d.point((18, 17), fill=(190, 255, 90, 255))
        else:                # babas
            for _ in range(5):
                x, y = rng.randint(3, 25), rng.randint(3, 26)
                d.ellipse([x, y, x + 4, y + 3], fill=(70, 150, 46, 255))
                d.point((x + 1, y), fill=(170, 240, 90, 255))
    else:                    # apex
        if which == 'a1':    # runa brillante
            d.ellipse([7, 7, 25, 25], outline=(110, 180, 255, 255))
            d.line([(16, 10), (16, 22)], fill=(110, 180, 255, 255))
            d.line([(10, 16), (22, 16)], fill=(110, 180, 255, 255))
            d.point((16, 16), fill=(220, 240, 255, 255))
        else:                # polvo estelar
            for _ in range(9):
                x, y = rng.randrange(32), rng.randrange(32)
                d.point((x, y), fill=(160, 200, 255, 255) if rng.random() < 0.5 else (90, 80, 140, 255))
    return img


def _wall_front(S, kind, accent, rng):
    """Cara frontal: remate claro, ladrillos grandes (15x7) de bajo contraste, zócalo oscuro."""
    brick = S['brick']
    img = Image.new('RGBA', (32, 32), _shade(brick, 0.55))   # mortero
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 31, 2], fill=S['cap'])
    d.line([(0, 3), (31, 3)], fill=_shade(S['cap'], 0.55))
    for i, (y0, y1) in enumerate([(4, 10), (12, 18), (20, 26)]):
        off = 0 if i % 2 == 0 else 8
        for bx in range(-16 + off, 32, 16):
            x0, x1 = max(0, bx), min(31, bx + 14)
            if x1 < x0:
                continue
            tone = _shade(brick, rng.uniform(0.90, 1.12))
            d.rectangle([x0, y0, x1, y1], fill=tone)
            d.line([(x0, y0), (x1, y0)], fill=_shade(tone, 1.16))
            d.line([(x0, y1), (x1, y1)], fill=_shade(tone, 0.84))
    for _ in range(5):   # desportillados
        x, y = rng.randrange(32), rng.randint(5, 26)
        img.putpixel((x, y), _shade(brick, 0.5))
    for y in range(28, 32):   # zócalo
        f = 0.78 - (y - 28) * 0.10
        for x in range(32):
            img.putpixel((x, y), _shade(img.getpixel((x, y)), f))
    if accent:
        d = ImageDraw.Draw(img)
        if kind == 'crypt':      # grieta oscura + musgo en la base
            pts = [(16, 5), (13, 11), (18, 17), (14, 24)]
            d.line(pts, fill=S['crack'], width=1)
            for x in range(4, 28, 3):
                d.rectangle([x, 26, x + 2, 28], fill=(54, 80, 48, 255))
        elif kind == 'demon':    # vena de lava
            pts = [(16, 5), (12, 12), (19, 19), (14, 27)]
            d.line(pts, fill=(150, 24, 20, 255), width=3)
            d.line(pts, fill=(255, 120, 30, 255), width=2)
            d.line(pts, fill=(255, 220, 90, 255), width=1)
        elif kind == 'acid':     # goteo de baba
            for x in (7, 17, 24):
                d.line([(x, 4), (x, rng.randint(14, 24))], fill=(84, 200, 52, 255), width=2)
                d.point((x, 26), fill=(190, 255, 90, 255))
        else:                    # runa
            d.line([(8, 17), (15, 12), (24, 20)], fill=(110, 180, 255, 255))
            for p in [(8, 17), (15, 12), (24, 20)]:
                d.point(p, fill=(220, 240, 255, 255))
    return img


def _wall_top(S, variant, rng):
    """Cima plana del muro: casi lisa, con bloques apenas insinuados (sin ruido de ladrillos)."""
    img = Image.new('RGBA', (32, 32), S['top'])
    d = ImageDraw.Draw(img)
    line = _shade(S['top'], 0.82)
    ox = 0 if variant == 0 else 8
    d.line([(0, 15), (31, 15)], fill=line)
    d.line([((15 + ox) % 32, 0), ((15 + ox) % 32, 14)], fill=line)
    d.line([((7 + ox) % 32, 16), ((7 + ox) % 32, 31)], fill=line)
    for _ in range(14):
        img.putpixel((rng.randrange(32), rng.randrange(32)), _shade(S['top'], rng.choice([0.85, 1.15, 1.25])))
    return img


def _void_tile(S, rng):
    img = Image.new('RGBA', (32, 32), S['void'])
    for _ in range(10):
        img.putpixel((rng.randrange(32), rng.randrange(32)), _shade(S['void'], rng.choice([0.85, 1.2])))
    return img


def generate_tiles():
    """
    Genera 4 tilesets de 128x128 (4 columnas x 4 filas de 32x32) con el MISMO layout:

        fila 0: suelo A, B, C, D            (variantes de losas)
        fila 1: grieta, acento A, acento B, escombros   (decoración de suelo, depende del bioma)
        fila 2: muro frontal A, frontal B, frontal con acento, cima plana
        fila 3: vacío (roca profunda), cima plana B, -, -

    world.js usa la cara frontal solo donde hay suelo al sur, la cima plana en los bordes
    y el vacío en el interior de la roca, así las salas se leen sin ruido de ladrillos.
    """
    import random
    for kind, S in TILE_STYLES.items():
        rng = random.Random(f'tiles-{kind}')
        sheet = create_canvas(128, 128)

        for v in range(4):
            sheet.paste(_floor_tile(S, v, rng), (v * 32, 0))

        for col, which in enumerate(['crack', 'a1', 'a2', 'rubble']):
            sheet.paste(_floor_accent(S, kind, which, rng), (col * 32, 32))

        sheet.paste(_wall_front(S, kind, False, rng), (0, 64))
        sheet.paste(_wall_front(S, kind, False, rng), (32, 64))
        sheet.paste(_wall_front(S, kind, True, rng), (64, 64))
        sheet.paste(_wall_top(S, 0, rng), (96, 64))

        sheet.paste(_void_tile(S, rng), (0, 96))
        sheet.paste(_wall_top(S, 1, rng), (32, 96))

        sheet.save(os.path.join(ASSETS_DIR, f'tileset_{kind}.png'))
        print(f"Creado: tileset_{kind}.png")


def generate_props():
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
    
    ox = 0
    rect(d, ox + 13, 14, 6, 12, IRON_DARK, OUTLINE)
    d.point((ox + 15, 16), fill=IRON_LIGHT)
    rect(d, ox + 11, 10, 10, 4, IRON_DARK, OUTLINE)
    d.line([(ox + 12, 11), (ox + 19, 11)], fill=IRON_LIGHT)
    ellipse(d, ox + 9, 2, 14, 12, (255, 60, 20, 255), OUTLINE)
    ellipse(d, ox + 11, 4, 10, 9, (255, 165, 25, 255))
    ellipse(d, ox + 13, 6, 6, 6, (255, 245, 120, 255))
    d.point((ox + 15, 7), fill=(255, 255, 240, 255))
    
    ox = 32
    ellipse(d, ox + 5, 24, 22, 7, (10, 10, 16, 120))
    ellipse(d, ox + 5, 3, 22, 26, WOOD_MID, OUTLINE)
    rect(d, ox + 8, 4, 16, 24, WOOD_MID)
    d.line([(ox + 11, 4), (ox + 11, 27)], fill=WOOD_DARK)
    d.line([(ox + 16, 4), (ox + 16, 27)], fill=WOOD_LIGHT)
    d.line([(ox + 21, 4), (ox + 21, 27)], fill=WOOD_DARK)
    rect(d, ox + 6, 7, 20, 4, IRON_DARK, OUTLINE)
    d.line([(ox + 7, 8), (ox + 24, 8)], fill=IRON_LIGHT)
    d.point((ox + 10, 8), fill=(200, 205, 215, 255))
    d.point((ox + 21, 8), fill=(200, 205, 215, 255))
    rect(d, ox + 6, 20, 20, 4, IRON_DARK, OUTLINE)
    d.line([(ox + 7, 21), (ox + 24, 21)], fill=IRON_LIGHT)
    d.point((ox + 10, 21), fill=(200, 205, 215, 255))
    d.point((ox + 21, 21), fill=(200, 205, 215, 255))
    
    ox = 64
    ellipse(d, ox + 4, 23, 24, 7, (10, 10, 16, 120))
    rect(d, ox + 4, 11, 24, 15, WOOD_MID, OUTLINE)
    d.line([(ox + 5, 12), (ox + 26, 12)], fill=WOOD_LIGHT)
    ellipse(d, ox + 4, 6, 24, 12, WOOD_MID, OUTLINE)
    rect(d, ox + 5, 10, 22, 4, WOOD_MID)
    rect(d, ox + 4, 7, 4, 19, IRON_DARK, OUTLINE)
    rect(d, ox + 24, 7, 4, 19, IRON_DARK, OUTLINE)
    d.line([(ox + 5, 8), (ox + 5, 24)], fill=IRON_LIGHT)
    d.line([(ox + 25, 8), (ox + 25, 24)], fill=IRON_LIGHT)
    rect(d, ox + 13, 13, 6, 8, GOLD_TRIM, OUTLINE)
    rect(d, ox + 15, 16, 2, 3, OUTLINE)
    d.point((ox + 14, 14), fill=GOLD_LIGHT)
    
    ox = 96
    ellipse(d, ox + 3, 3, 26, 26, None, (255, 225, 75, 170))
    ellipse(d, ox + 6, 6, 20, 20, None, (255, 245, 150, 120))
    rect(d, ox + 7, 10, 18, 12, (245, 232, 190, 255), OUTLINE)
    d.line([(ox + 8, 11), (ox + 23, 11)], fill=(255, 248, 225, 255))
    d.line([(ox + 8, 20), (ox + 23, 20)], fill=(195, 175, 130, 255))
    d.line([(ox + 9, 13), (ox + 12, 13)], fill=(120, 95, 65, 255))
    d.line([(ox + 19, 13), (ox + 22, 13)], fill=(120, 95, 65, 255))
    d.line([(ox + 9, 17), (ox + 13, 17)], fill=(120, 95, 65, 255))
    rect(d, ox + 14, 8, 4, 16, BANNER_RED, OUTLINE)
    ellipse(d, ox + 13, 13, 6, 6, (220, 35, 45, 255), OUTLINE)
    d.point((ox + 15, 14), fill=(255, 180, 180, 255))
    
    ox = 128
    rect(d, ox + 2, 2, 28, 28, (20, 18, 26, 255), OUTLINE)
    for st in range(5):
        sy = 5 + st * 5
        rect(d, ox + 4 + st, sy, 24 - st * 2, 4, (65 + st * 14, 70 + st * 14, 82 + st * 14, 255), OUTLINE)
        d.line([(ox + 5 + st, sy), (ox + 26 - st, sy)], fill=(110 + st * 14, 120 + st * 14, 135 + st * 14, 255))
        
    ox = 160
    ellipse(d, ox + 5, 24, 22, 7, (10, 10, 16, 120))
    rect(d, ox + 5, 5, 22, 22, WOOD_MID, OUTLINE)
    rect(d, ox + 5, 5, 22, 22, None, IRON_DARK)
    rect(d, ox + 8, 8, 16, 16, WOOD_DARK)
    d.line([(ox + 6, 6), (ox + 25, 25)], fill=WOOD_LIGHT, width=2)
    d.line([(ox + 25, 6), (ox + 6, 25)], fill=WOOD_LIGHT, width=2)
    d.point((ox + 7, 7), fill=IRON_LIGHT)
    d.point((ox + 24, 7), fill=IRON_LIGHT)
    d.point((ox + 7, 24), fill=IRON_LIGHT)
    d.point((ox + 24, 24), fill=IRON_LIGHT)
    
    ox = 192
    rect(d, ox + 6, 3, 20, 3, GOLD_TRIM, OUTLINE)
    ellipse(d, ox + 4, 2, 4, 5, GOLD_LIGHT)
    ellipse(d, ox + 24, 2, 4, 5, GOLD_LIGHT)
    rect(d, ox + 8, 6, 16, 18, BANNER_RED, OUTLINE)
    rect(d, ox + 10, 6, 4, 18, (215, 45, 55, 255))
    rect(d, ox + 18, 6, 4, 18, BANNER_DARK)
    d.line([(ox + 15, 9), (ox + 15, 19)], fill=GOLD_LIGHT, width=2)
    d.line([(ox + 13, 12), (ox + 17, 12)], fill=GOLD_LIGHT)
    d.polygon([(ox + 8, 24), (ox + 12, 28), (ox + 15, 23), (ox + 19, 28), (ox + 23, 24)], fill=BANNER_RED, outline=OUTLINE)
    
    ox = 224
    ellipse(d, ox + 3, 18, 26, 10, (10, 10, 16, 110))
    rect(d, ox + 5, 12, 7, 6, BONE_COLOR, OUTLINE)
    d.point((ox + 6, 14), fill=OUTLINE)
    d.point((ox + 9, 14), fill=OUTLINE)
    rect(d, ox + 13, 14, 8, 2, BONE_COLOR)
    rect(d, ox + 14, 17, 6, 2, BONE_COLOR)
    d.line([(ox + 19, 16), (ox + 26, 20)], fill=BONE_COLOR, width=2)
    d.line([(ox + 16, 20), (ox + 22, 24)], fill=BONE_SHADOW, width=2)
    d.line([(ox + 7, 24), (ox + 24, 10)], fill=IRON_LIGHT, width=2)
    rect(d, ox + 6, 23, 3, 3, GOLD_TRIM, OUTLINE)
    
    ox = 256
    rect(d, ox + 3, 2, 26, 28, (65, 72, 85, 255), OUTLINE)
    d.line([(ox + 4, 3), (ox + 27, 3)], fill=(95, 105, 122, 255))
    rect(d, ox + 6, 6, 20, 24, OUTLINE)
    rect(d, ox + 7, 7, 18, 23, WOOD_DARK)
    d.line([(ox + 15, 7), (ox + 15, 29)], fill=OUTLINE, width=2)
    rect(d, ox + 8, 10, 16, 3, IRON_DARK)
    rect(d, ox + 8, 22, 16, 3, IRON_DARK)
    d.point((ox + 10, 11), fill=IRON_LIGHT)
    d.point((ox + 22, 11), fill=IRON_LIGHT)
    ellipse(d, ox + 11, 15, 4, 4, None, IRON_LIGHT)
    ellipse(d, ox + 17, 15, 4, 4, None, IRON_LIGHT)
    
    props.save(os.path.join(ASSETS_DIR, 'props.png'))

def generate_icons():
    icons = create_canvas(240, 24)
    d = ImageDraw.Draw(icons)
    
    rect(d, 4, 18, 5, 2, (120, 80, 40, 255), OUTLINE)
    d.line([(7, 17), (18, 6)], fill=(220, 230, 240, 255), width=3)
    d.line([(7, 17), (19, 5)], fill=OUTLINE, width=1)
    
    ox = 24
    d.line([(ox + 6, 18), (ox + 18, 5)], fill=(245, 50, 60, 255), width=4)
    d.line([(ox + 7, 17), (ox + 17, 6)], fill=(255, 200, 50, 255), width=2)
    
    ox = 48
    d.line([(ox + 6, 4), (ox + 18, 12), (ox + 6, 20)], fill=(150, 95, 50, 255), width=2)
    d.line([(ox + 6, 4), (ox + 6, 20)], fill=(210, 210, 210, 255))
    
    ox = 72
    d.line([(ox + 5, 19), (ox + 17, 7)], fill=(120, 75, 45, 255), width=2)
    ellipse(d, ox + 15, 4, 6, 6, (255, 130, 20, 255), OUTLINE)
    
    ox = 96
    rect(d, ox + 4, 5, 16, 14, (170, 185, 205, 255), OUTLINE)
    rect(d, ox + 6, 7, 12, 5, (230, 240, 255, 255))
    
    ox = 120
    rect(d, ox + 4, 5, 16, 15, (110, 50, 140, 255), OUTLINE)
    d.line([(ox + 12, 5), (ox + 12, 20)], fill=(245, 210, 50, 255), width=2)
    
    ox = 144
    rect(d, ox + 10, 3, 4, 4, (180, 180, 190, 255), OUTLINE)
    ellipse(d, ox + 6, 7, 12, 14, (235, 40, 50, 255), OUTLINE)
    ellipse(d, ox + 8, 10, 4, 4, (255, 200, 200, 255))
    
    ox = 168
    rect(d, ox + 10, 3, 4, 4, (180, 180, 190, 255), OUTLINE)
    ellipse(d, ox + 6, 7, 12, 14, (40, 120, 245, 255), OUTLINE)
    ellipse(d, ox + 8, 10, 4, 4, (200, 230, 255, 255))
    
    ox = 192
    ellipse(d, ox + 4, 6, 16, 12, (100, 90, 85, 255), OUTLINE)
    ellipse(d, ox + 6, 8, 12, 8, (135, 125, 120, 255))
    
    ox = 216
    ellipse(d, ox + 4, 9, 10, 10, (245, 195, 40, 255), OUTLINE)
    ellipse(d, ox + 10, 6, 10, 10, (255, 220, 70, 255), OUTLINE)
    
    icons.save(os.path.join(ASSETS_DIR, 'icons.png'))

def build_all_spritesheets():
    print("Generando spritesheets...")
    
    classes = [
        ('player_warrior.png', draw_warrior_frame),
        ('player_archer.png', draw_archer_frame),
        ('player_mage.png', draw_mage_frame),
    ]
    
    for filename, drawer in classes:
        sheet = create_canvas(48 * 7, 48 * 4)
        for direction in range(4):
            for frame in range(4):
                f_img = drawer(direction, frame, is_attack=False)
                sheet.paste(f_img, (frame * 48, direction * 48))
            for atk in range(3):
                f_img = drawer(direction, atk, is_attack=True)
                sheet.paste(f_img, ((4 + atk) * 48, direction * 48))
        sheet.save(os.path.join(ASSETS_DIR, filename))
        print(f"Creado: {filename}")
        
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
        
    spider_sheet = create_canvas(48 * 4, 48 * 4)
    for direction in range(4):
        for frame in range(4):
            f_img = draw_spider_frame(direction, frame)
            spider_sheet.paste(f_img, (frame * 48, direction * 48))
    spider_sheet.save(os.path.join(ASSETS_DIR, 'enemy_spider.png'))
    print("Creado: enemy_spider.png")
    
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
        
    abra_sheet = create_canvas(72 * 4, 72 * 4)
    states = ['walk', 'swell', 'vomit', 'charge']
    for row, state in enumerate(states):
        for frame in range(4):
            f_img = draw_abracadabra_frame(state, frame)
            abra_sheet.paste(f_img, (frame * 72, row * 72))
    abra_sheet.save(os.path.join(ASSETS_DIR, 'boss_abracadabra.png'))
    print("Creado: boss_abracadabra.png")
    
    hong_sheet = create_canvas(96 * 4, 96 * 2)
    for frame in range(4):
        f_img = draw_hong_frame(frame, is_cleave=False)
        hong_sheet.paste(f_img, (frame * 96, 0))
        f_atk = draw_hong_frame(frame, is_cleave=True)
        hong_sheet.paste(f_atk, (frame * 96, 96))
    hong_sheet.save(os.path.join(ASSETS_DIR, 'boss_hong.png'))
    print("Creado: boss_hong.png")
    
    generate_tiles()
    generate_props()
    generate_icons()
    print("Tiles, Props e Iconos generados con éxito.")

if __name__ == '__main__':
    build_all_spritesheets()