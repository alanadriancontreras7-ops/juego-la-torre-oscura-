"""
Generador de Sprites Pixel Art 16-Bit para 'La Torre Oscura'
Crea spritesheets en formato PNG con fondo transparente, contornos oscuros
y proporciones legibles al estilo Pokémon / RPGs de 16-bit (GBA / SNES).
"""

import os
import math
# pyrefly: ignore[missing-import]
from PIL import Image, ImageDraw, ImageOps

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
# PALETAS Y UTILIDADES BASE
# ==============================================================================
HI, LT, MD, DK, DP = range(5)

# Paletas generales y de héroes
P_SKIN      = [(255, 232, 204), (246, 204, 164), (224, 164, 124), (178, 116, 96), (122, 76, 76)]
P_STEEL     = [(252, 253, 255), (208, 220, 240), (152, 170, 200), (100, 114, 152), (60, 68, 106)]
P_GOLD      = [(255, 244, 160), (255, 214, 88), (224, 162, 50), (164, 102, 42), (104, 62, 38)]
P_BLUE      = [(120, 158, 236), (72, 110, 206), (46, 72, 156), (32, 46, 110), (22, 30, 74)]
P_RED       = [(255, 178, 138), (238, 90, 74), (198, 46, 56), (142, 32, 52), (92, 22, 44)]
P_LEATHER   = [(220, 166, 104), (182, 122, 74), (140, 88, 56), (100, 62, 48), (64, 40, 40)]
P_GREEN     = [(160, 226, 124), (98, 182, 88), (56, 136, 76), (38, 96, 68), (24, 62, 54)]
P_PURPLE    = [(196, 148, 244), (146, 98, 210), (104, 64, 168), (74, 44, 122), (46, 28, 82)]
P_WOOD      = [(226, 176, 114), (176, 126, 76), (130, 88, 56), (92, 60, 44), (58, 38, 36)]
P_WHITE     = [(255, 255, 255), (236, 236, 248), (200, 200, 220), (154, 154, 182), (108, 108, 138)]
P_HAIR      = [(196, 126, 84), (154, 92, 60), (112, 66, 48), (78, 46, 40), (50, 30, 32)]
P_PANTS     = [(168, 156, 134), (136, 122, 106), (102, 90, 82), (72, 62, 66), (48, 42, 52)]
P_ORB       = [(255, 255, 232), (255, 232, 124), (255, 172, 52), (222, 102, 32), (152, 52, 30)]

# Paletas especializadas para Monstruos y Enemigos
P_BONE      = [(255, 252, 238), (240, 232, 208), (202, 192, 164), (150, 138, 114), (98, 86, 70)]
P_RUST      = [(220, 160, 130), (178, 110, 82), (136, 74, 52), (96, 48, 36), (62, 32, 28)]
P_BANDIT    = [(168, 140, 120), (124, 96, 80), (88, 64, 52), (58, 40, 34), (36, 24, 22)]
P_BANDIT_CL = [(110, 120, 135), (78, 88, 104), (52, 60, 74), (34, 40, 52), (22, 26, 36)]
P_ARACHNID  = [(110, 84, 130), (74, 50, 92), (48, 30, 64), (32, 18, 44), (20, 10, 28)]
P_TOXIC     = [(235, 255, 140), (175, 240, 60), (110, 200, 35), (60, 140, 25), (32, 80, 20)]
P_RAT_FUR   = [(160, 138, 120), (122, 100, 86), (90, 70, 58), (62, 46, 38), (40, 28, 24)]
P_RAT_PINK  = [(255, 205, 205), (235, 165, 168), (198, 122, 128), (150, 84, 94), (98, 50, 60)]
P_WOLF_FUR  = [(150, 145, 155), (112, 106, 118), (80, 74, 86), (54, 48, 60), (34, 28, 38)]
P_WOLF_MANE = [(92, 84, 98), (68, 60, 74), (48, 40, 54), (32, 26, 38), (20, 16, 26)]
P_DEMON_SK  = [(255, 120, 100), (220, 60, 55), (168, 30, 38), (112, 18, 28), (68, 10, 20)]
P_DEMON_DK  = [(88, 45, 68), (64, 30, 52), (42, 18, 36), (28, 10, 24), (16, 6, 14)]
P_PUSTULE   = [(255, 255, 140), (210, 255, 50), (145, 220, 25), (90, 160, 20), (45, 95, 15)]
P_PUTRID    = [(178, 195, 150), (135, 158, 110), (96, 122, 78), (65, 88, 52), (40, 58, 34)]
P_TITAN_CH  = [(130, 36, 48), (96, 22, 34), (68, 14, 24), (44, 8, 16), (26, 4, 10)]
P_TITAN_DK  = [(60, 48, 68), (44, 32, 52), (30, 20, 38), (20, 12, 26), (12, 6, 16)]
P_VOID      = [(255, 190, 255), (220, 110, 245), (165, 45, 210), (105, 20, 145), (55, 8, 85)]

def _dn(R):
    return [R[1], R[2], R[3], R[4], R[4]]

class _L:
    """Capa con helpers de dibujo pixel-art. Por defecto 48x48 pero admite cualquier tamaño."""
    def __init__(s, noline=False, w=48, h=48):
        s.w, s.h = w, h
        s.im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        s.d = ImageDraw.Draw(s.im)
        s.noline = noline

    def rect(s, x0, y0, x1, y1, c):
        s.d.rectangle([x0, y0, x1, y1], fill=c)

    def poly(s, pts, c):
        s.d.polygon(pts, fill=c)

    def ell(s, x0, y0, x1, y1, c):
        s.d.ellipse([x0, y0, x1, y1], fill=c)

    def px(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h:
            s.im.putpixel((x, y), c)

    def line(s, pts, c, w=1):
        s.d.line(pts, fill=c, width=w)

    def arc(s, box, a0, a1, c, w=1):
        s.d.arc(box, a0, a1, fill=c, width=w)

def _box(L, x0, y0, x1, y1, R):
    L.rect(x0, y0, x1, y1, R[MD])
    L.line([(x0, y0), (x1, y0)], R[LT])
    L.line([(x0, y0), (x0, y1)], R[LT])
    L.line([(x0, y1), (x1, y1)], R[DK])
    L.line([(x1, y0 + 1), (x1, y1)], R[DK])
    if x1 - x0 >= 3 and y1 - y0 >= 3:
        L.px(x0 + 1, y0 + 1, R[HI])

def _ball(L, x0, y0, x1, y1, R):
    L.ell(x0, y0, x1, y1, R[DK])
    L.ell(x0, y0, x1 - 1, y1 - 1, R[MD])
    if x1 - x0 >= 4:
        L.ell(x0 + 1, y0 + 1, x1 - 3, y1 - 3, R[LT])
    L.px(x0 + 1, y0 + 1, R[HI])

def _outline(im, strength=0.30):
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
    im = Image.new('RGBA', (L.w, L.h), (0, 0, 0, 0))
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

def _hand(L, x, y, skin=P_SKIN):
    L.rect(x - 1, y - 1, x + 1, y + 1, skin[MD])
    L.px(x - 1, y - 1, skin[LT])

def _blade(L, hand, tip, R=P_STEEL):
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

# ==============================================================================
# 1. GENERADOR DE JUGADORES (Guerrero, Arquero, Mago)
# ==============================================================================
SWORD = {
    0: {'idle': ((32, 29), (32, 13)), 0: ((33, 24), (40, 8)),  1: ((31, 30), (31, 46)), 2: ((30, 31), (22, 45))},
    1: {'idle': ((16, 29), (14, 13)), 0: ((24, 22), (30, 7)),  1: ((15, 27), (0, 27)),  2: ((14, 30), (4, 42))},
    3: {'idle': ((32, 29), (32, 13)), 0: ((31, 26), (37, 12)), 1: ((28, 22), (26, 2)),  2: ((26, 22), (19, 5))},
}

def _warrior_layers(dr, p, ai):
    b = p['b']
    S, G, C, R, K = P_STEEL, P_GOLD, P_BLUE, P_RED, P_SKIN
    out = []

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

    sw = SWORD[1 if dr == 2 else dr]['idle' if ai is None else ai]
    sword_back = (dr == 1 and ai is None)
    if sword_back:
        L = _L()
        _blade(L, sw[0], sw[1])
        out.append(L)

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

    L = _L()
    if dr in (0, 3):
        _ball(L, 14, 20 + b, 19, 25 + b, S)
        _ball(L, 28, 20 + b, 33, 25 + b, S)
        L.px(16, 22 + b, G[LT]); L.px(30, 22 + b, G[LT])
    else:
        _ball(L, 21, 20 + b, 27, 26 + b, S)
        L.px(23, 22 + b, G[LT])
    out.append(L)

    L = _L()
    al, ar = p['al'], p['ar']
    if dr == 0:
        L.poly([(9, 22 + b), (18, 22 + b), (18, 31 + b), (13, 37 + b), (9, 31 + b)], S[MD])
        L.poly([(10, 23 + b), (17, 23 + b), (17, 30 + b), (13, 35 + b), (10, 30 + b)], C[MD])
        L.line([(10, 23 + b), (17, 23 + b)], C[LT])
        L.line([(13, 24 + b), (13, 34 + b)], G[MD])
        L.line([(10, 28 + b), (17, 28 + b)], G[MD])
        _ball(L, 12, 26 + b, 15, 29 + b, G)
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
        L = _L()
        _hand(L, sw[0][0], sw[0][1] + 1)
        out.append(L)

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

def _bow(L, dr, ai):
    W = P_WOOD
    string = (236, 230, 204, 255)
    if dr in (0, 3):
        sg = 1 if dr == 0 else -1
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
    G, T, K, H = P_GREEN, P_LEATHER, P_SKIN, P_HAIR
    out = []

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

    out.append(_legs(dr, p, P_PANTS, T))

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

    L = _L()
    if dr in (0, 3):
        for x0, lift in ((19, p['ll']), (25, p['lr'])):
            _box(L, x0, 38 + lift, x0 + 3, 40 + lift, P_LEATHER)
    else:
        s = p['s']
        _box(L, 19 - s, 38, 24 - s, 40, _dn(P_LEATHER))
        _box(L, 19 + s, 38, 24 + s, 40, P_LEATHER)
    out.append(L)

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
        hx, hy = stf[0]
        L.poly([(22, 22 + b), (27, 22 + b), (hx + 4, hy - 2), (hx - 3, hy - 2)], M[MD])
        L.line([(22, 22 + b), (hx - 3, hy - 2)], M[LT])
        L.line([(hx - 3, hy - 2), (hx + 4, hy - 2)], G[MD])
        _hand(L, hx, hy)
    out.append(L)

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
    return _render_hero('warrior', direction, anim_frame, is_attack)

def draw_archer_frame(direction, anim_frame, is_attack=False):
    return _render_hero('archer', direction, anim_frame, is_attack)

def draw_mage_frame(direction, anim_frame, is_attack=False):
    return _render_hero('mage', direction, anim_frame, is_attack)

# ==============================================================================
# 2. GENERADOR DE ENEMIGOS Y MONSTRUOS (MEJORADO - 16-BIT SHADED ART)
# ==============================================================================

def _dagger(L, hand, tip, R=P_STEEL):
    """Daga/Cuchillo curvado de bandido con brillo metálico."""
    hx, hy = hand
    tx, ty = tip
    L.line([(hx, hy), (tx, ty)], R[MD], 2)
    L.line([(hx, hy - 1), (tx, ty - 1)], R[HI], 1)
    L.px(hx, hy + 1, P_WOOD[DK])
    L.px(tx, ty, R[HI])

def _draw_shadow(canvas_draw, cx, cy, rx, ry):
    """Sombra suave en el suelo bajo el personaje/monstruo."""
    canvas_draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(10, 10, 18, 110))
    canvas_draw.ellipse([cx - rx + 2, cy - ry + 1, cx + rx - 2, cy + ry - 1], fill=(10, 10, 18, 70))

# ------------------------------------------------------------------------------
# 2.1 BANDIDO (enemy_bandit.png - 48x48)
# Ropas de sigilo, capucha oscura con máscara roja, cinturón de cuero y dagas gemelas.
# ------------------------------------------------------------------------------
def draw_bandit_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    p = _pose(is_attack, anim_frame)
    if is_attack:
        p['s'] = 4 if anim_frame == 1 else 1

    layers = []
    C, Lth, Msk, Sk = P_BANDIT_CL, P_BANDIT, P_RED, P_SKIN

    # Capa trasera / mochila
    L = _L()
    if dr == 3:
        L.poly([(17, 21 + b), (31, 21 + b), (32, 35), (16, 35)], C[DK])
        L.line([(17, 21 + b), (16, 35)], C[LT])
        L.line([(31, 21 + b), (32, 35)], C[DP])
    elif dr == 1:
        L.poly([(26, 21 + b), (32, 23 + b), (33, 34), (27, 33)], C[DK])
    layers.append(L)

    # Piernas y botas
    layers.append(_legs(dr, p, C, P_LEATHER))

    # Torso (jubón de cuero tachonado + cinturón)
    L = _L()
    if dr == 0:
        _box(L, 19, 21 + b, 29, 29 + b, Lth)
        L.line([(20, 22 + b), (28, 28 + b)], P_WOOD[DK], 1)
        L.line([(28, 22 + b), (20, 28 + b)], P_WOOD[DK], 1)
        L.rect(19, 28 + b, 29, 30 + b, P_WOOD[DK])
        L.px(24, 29 + b, P_GOLD[MD])
    elif dr == 3:
        _box(L, 19, 21 + b, 29, 29 + b, _dn(Lth))
        L.rect(19, 28 + b, 29, 30 + b, P_WOOD[DK])
    else:
        _box(L, 20, 21 + b, 28, 29 + b, Lth)
        L.rect(20, 28 + b, 28, 30 + b, P_WOOD[DK])
        L.px(21, 29 + b, P_GOLD[MD])
    layers.append(L)

    # Cabeza (capucha de forajido + máscara roja)
    L = _L()
    if dr == 0:
        _ball(L, 17, 8 + b, 30, 20 + b, C)
        L.poly([(17, 9 + b), (24, 6 + b), (30, 9 + b), (28, 14 + b), (19, 14 + b)], C[LT])
        L.rect(20, 14 + b, 27, 16 + b, Sk[MD])
        # Ojos astutos
        L.px(21, 15 + b, (22, 18, 30, 255))
        L.px(26, 15 + b, (22, 18, 30, 255))
        # Máscara de bandolero
        _box(L, 19, 17 + b, 28, 22 + b, Msk)
        L.line([(19, 22 + b), (28, 22 + b)], Msk[DP])
    elif dr == 3:
        _ball(L, 17, 8 + b, 30, 20 + b, C)
        L.poly([(20, 14 + b), (24, 22 + b), (28, 14 + b)], C[DK])
    else:
        _ball(L, 17, 8 + b, 29, 20 + b, C)
        L.rect(18, 14 + b, 23, 16 + b, Sk[MD])
        L.px(19, 15 + b, (22, 18, 30, 255))
        _box(L, 17, 17 + b, 24, 22 + b, Msk)
        L.poly([(24, 18 + b), (29, 19 + b), (28, 21 + b), (24, 20 + b)], Msk[DK])
    layers.append(L)

    # Brazos y armas
    L = _L()
    al, ar = p['al'], p['ar']
    if not is_attack:
        if dr in (0, 3):
            _box(L, 16, 23 + b + al, 18, 28 + b + al, C)
            _box(L, 29, 23 + b + ar, 31, 28 + b + ar, C)
            _hand(L, 17, 29 + b + al, Sk)
            _hand(L, 30, 29 + b + ar, Sk)
            _dagger(L, (17, 30 + b + al), (17, 36 + b + al))
            _dagger(L, (30, 30 + b + ar), (30, 36 + b + ar))
        else:
            _box(L, 21, 23 + b, 24, 28 + b, C)
            _hand(L, 20, 29 + b, Sk)
            _dagger(L, (20, 29 + b), (14, 34 + b))
    else:
        # Poses dinámicas de ataque (corte cruzado de dagas)
        atk = anim_frame
        if dr == 0:
            if atk == 0:
                _box(L, 15, 20, 18, 25, C); _hand(L, 14, 19, Sk)
                _dagger(L, (14, 19), (8, 14))
                _box(L, 29, 20, 32, 25, C); _hand(L, 33, 19, Sk)
                _dagger(L, (33, 19), (39, 14))
            else:
                _box(L, 16, 25, 22, 28, C); _hand(L, 24, 27, Sk)
                _dagger(L, (24, 27), (35, 34))
                _box(L, 26, 25, 32, 28, C); _hand(L, 25, 27, Sk)
                _dagger(L, (25, 27), (14, 34))
        elif dr == 3:
            _box(L, 14, 21, 18, 26, C); _hand(L, 14, 20, Sk)
            _dagger(L, (14, 20), (10, 12))
            _box(L, 30, 21, 34, 26, C); _hand(L, 34, 20, Sk)
            _dagger(L, (34, 20), (38, 12))
        else:
            if atk == 0:
                _box(L, 25, 22, 30, 26, C); _hand(L, 31, 23, Sk)
                _dagger(L, (31, 23), (39, 17))
            else:
                _box(L, 18, 24, 26, 28, C); _hand(L, 14, 27, Sk)
                _dagger(L, (14, 27), (2, 27))
    layers.append(L)

    # Estela de corte
    if is_attack and anim_frame == 1:
        fx = _L(noline=True)
        if dr == 1:
            fx.arc((0, 16, 24, 38), 120, 260, (255, 240, 220, 220), 2)
            fx.arc((-2, 14, 26, 40), 120, 260, (230, 70, 70, 140), 4)
        elif dr == 0:
            fx.arc((8, 26, 39, 44), 20, 160, (255, 240, 220, 220), 2)
            fx.arc((6, 24, 41, 46), 20, 160, (230, 70, 70, 130), 4)
        layers.append(fx)

    img = create_canvas(48, 48)
    _draw_shadow(ImageDraw.Draw(img), 24, 41, 11, 4)
    for lay in layers:
        img.alpha_composite(lay.im if lay.noline else _outline(lay.im))
    if direction == 2:
        img = ImageOps.mirror(img)
    return img

# ------------------------------------------------------------------------------
# 2.2 ESQUELETO (enemy_skeleton.png - 48x48)
# Cráneo cadavérico con fulgor ocular, caja torácica, espada herrumbrosa y broquel.
# ------------------------------------------------------------------------------
def draw_skeleton_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    p = _pose(is_attack, anim_frame)
    if is_attack:
        p['s'] = 3 if anim_frame == 1 else 0

    layers = []
    B, Rst = P_BONE, P_RUST

    # Piernas (huesos finos)
    L = _L()
    if dr in (0, 3):
        for x0, lift in ((20, p['ll']), (26, p['lr'])):
            L.line([(x0, 29 + lift), (x0, 35 + lift)], B[MD], 2)
            L.px(x0 - 1, 35 + lift, B[LT])
            L.line([(x0, 35 + lift), (x0, 39 + lift)], B[DK], 2)
            L.rect(x0 - 1, 39 + lift, x0 + 1, 40 + lift, B[HI])
    else:
        s = p['s']
        for off, pal in ((-s, _dn(B)), (s, B)):
            L.line([(24, 29), (23 + off, 35)], pal[MD], 2)
            L.line([(23 + off, 35), (22 + off, 40)], pal[DK], 2)
            L.rect(20 + off, 40, 24 + off, 41, pal[HI])
    layers.append(L)

    # Pelvis y Caja torácica / Columna
    L = _L()
    if dr == 0:
        # Columna y costillas
        L.rect(23, 20 + b, 24, 28 + b, B[DK])
        for y in range(21 + b, 28 + b, 2):
            L.line([(19, y), (28, y)], B[LT], 1)
            L.px(19, y, B[MD]); L.px(28, y, B[MD])
        # Pelvis
        L.poly([(20, 28 + b), (27, 28 + b), (25, 31 + b), (22, 31 + b)], B[MD])
        L.px(21, 29 + b, B[DK]); L.px(26, 29 + b, B[DK])
    elif dr == 3:
        # Columna dorsal
        L.line([(23, 19 + b), (23, 28 + b)], B[HI], 2)
        for y in range(21 + b, 27 + b, 2):
            L.line([(19, y), (28, y)], B[DK], 1)
        L.poly([(20, 28 + b), (27, 28 + b), (24, 31 + b)], B[MD])
    else:
        L.line([(22, 20 + b), (23, 28 + b)], B[MD], 2)
        for y in range(21 + b, 28 + b, 2):
            L.line([(20, y), (25, y + 1)], B[LT], 1)
        L.rect(21, 28 + b, 25, 30 + b, B[MD])
    layers.append(L)

    # Cráneo (sombreado esférico con cuencas profundas)
    L = _L()
    if dr == 0:
        _ball(L, 17, 7 + b, 30, 18 + b, B)
        # Mandíbula
        _box(L, 20, 17 + b, 27, 21 + b, B)
        # Cuencas oculares
        L.rect(20, 12 + b, 22, 14 + b, (18, 12, 16, 255))
        L.rect(25, 12 + b, 27, 14 + b, (18, 12, 16, 255))
        # Ojos de fulgor rojo
        L.px(21, 13 + b, (255, 60, 60, 255))
        L.px(26, 13 + b, (255, 60, 60, 255))
        # Cavidad nasal y dientes
        L.px(23, 16 + b, (20, 14, 18, 255)); L.px(24, 16 + b, (20, 14, 18, 255))
        for x in (21, 23, 25, 27):
            L.px(x, 19 + b, B[HI])
    elif dr == 3:
        _ball(L, 17, 7 + b, 30, 18 + b, B)
        _box(L, 21, 17 + b, 26, 20 + b, _dn(B))
        L.line([(23, 8 + b), (23, 17 + b)], B[LT], 1)
    else:
        _ball(L, 18, 7 + b, 29, 18 + b, B)
        _box(L, 17, 16 + b, 24, 20 + b, B)
        L.rect(19, 12 + b, 21, 14 + b, (18, 12, 16, 255))
        L.px(20, 13 + b, (255, 60, 60, 255))
        L.px(18, 15 + b, (20, 14, 18, 255))
        L.px(19, 19 + b, B[HI]); L.px(21, 19 + b, B[HI])
    layers.append(L)

    # Armas: Espada rota oxidada y broquel de madera
    L = _L()
    if not is_attack:
        if dr == 0:
            # Escudo redondo a la izquierda
            _ball(L, 11, 21 + b, 18, 28 + b, P_WOOD)
            L.px(14, 24 + b, P_STEEL[MD])
            # Espada a la derecha
            _blade(L, (29, 27 + b), (36, 17 + b), Rst)
        elif dr == 3:
            _blade(L, (30, 27 + b), (37, 17 + b), Rst)
        else:
            _ball(L, 19, 21 + b, 25, 27 + b, P_WOOD)
            _blade(L, (18, 27 + b), (10, 36 + b), Rst)
    else:
        # Ataque: tajada cortante
        atk = anim_frame
        if dr in (0, 3):
            if atk == 0:
                _blade(L, (30, 19), (38, 7), Rst)
            else:
                _blade(L, (29, 28), (34, 43), Rst)
        else:
            if atk == 0:
                _blade(L, (24, 18), (32, 6), Rst)
            else:
                _blade(L, (16, 27), (2, 33), Rst)
    layers.append(L)

    if is_attack and anim_frame == 1:
        fx = _L(noline=True)
        cx, cy = (18, 32) if dr == 1 else (31, 35)
        fx.arc((cx - 14, cy - 14, cx + 14, cy + 14), 45, 200, (240, 230, 210, 210), 2)
        layers.append(fx)

    img = create_canvas(48, 48)
    _draw_shadow(ImageDraw.Draw(img), 24, 41, 10, 4)
    for lay in layers:
        img.alpha_composite(lay.im if lay.noline else _outline(lay.im))
    if direction == 2:
        img = ImageOps.mirror(img)
    return img

# ------------------------------------------------------------------------------
# 2.3 ARAÑA GIGANTE (enemy_spider.png - 48x48)
# Cefalotórax y abdomen volumétricos, 8 patas biomecánicas y pedipalpos venenosos.
# ------------------------------------------------------------------------------
def draw_spider_frame(direction, anim_frame):
    dr = 1 if direction == 2 else direction
    cy_shift = 1 if anim_frame in (1, 3) else 0
    layers = []
    Ar, Tox = P_ARACHNID, P_TOXIC

    # Patas traseras (detrás del cuerpo)
    L = _L()
    leg_phase = anim_frame % 2
    if dr == 0:
        # Frente
        p0 = -3 if leg_phase else 3
        L.line([(16, 22), (6, 16 + p0), (2, 28)], Ar[DK], 2)
        L.line([(31, 22), (41, 16 - p0), (45, 28)], Ar[DK], 2)
        L.line([(15, 26), (5, 25 - p0), (1, 35)], Ar[DK], 2)
        L.line([(32, 26), (42, 25 + p0), (46, 35)], Ar[DK], 2)
    elif dr == 3:
        # Espalda
        p0 = 3 if leg_phase else -3
        L.line([(16, 26), (6, 18 + p0), (2, 10)], Ar[DK], 2)
        L.line([(31, 26), (41, 18 - p0), (45, 10)], Ar[DK], 2)
    else:
        # Perfil
        p0 = -2 if leg_phase else 2
        L.line([(26, 24), (36, 18 + p0), (42, 26)], Ar[DP], 2)
        L.line([(28, 25), (40, 24 - p0), (44, 34)], Ar[DP], 2)
    layers.append(L)

    # Abdomen bulboso con marcas de ponzoña
    L = _L()
    if dr == 0:
        _ball(L, 16, 14 + cy_shift, 31, 27 + cy_shift, Ar)
        _ball(L, 20, 16 + cy_shift, 27, 23 + cy_shift, Tox)
        L.px(23, 18 + cy_shift, Tox[HI])
    elif dr == 3:
        _ball(L, 14, 18 + cy_shift, 33, 35 + cy_shift, Ar)
        _ball(L, 19, 21 + cy_shift, 28, 30 + cy_shift, Tox)
        L.px(23, 23 + cy_shift, Tox[HI])
    else:
        _ball(L, 22, 16 + cy_shift, 38, 30 + cy_shift, Ar)
        _ball(L, 27, 18 + cy_shift, 34, 25 + cy_shift, Tox)
    layers.append(L)

    # Cefalotórax (cabeza y ojos múltiples)
    L = _L()
    if dr == 0:
        _ball(L, 18, 24 + cy_shift, 29, 33 + cy_shift, _dn(Ar))
        # Ojos rojos en racimo
        for ox in (-3, -1, 1, 3):
            L.px(23 + ox, 27 + cy_shift, (255, 30, 40, 255))
            L.px(23 + ox, 29 + cy_shift, (180, 20, 30, 255))
        L.px(22, 27 + cy_shift, (255, 230, 140, 255))
        # Quelíceros con veneno goteando
        L.line([(20, 32 + cy_shift), (20, 36 + cy_shift)], Tox[MD], 2)
        L.line([(27, 32 + cy_shift), (27, 36 + cy_shift)], Tox[MD], 2)
        L.px(20, 36 + cy_shift, Tox[HI]); L.px(27, 36 + cy_shift, Tox[HI])
    elif dr == 3:
        _ball(L, 19, 14 + cy_shift, 28, 22 + cy_shift, _dn(Ar))
    else:
        _ball(L, 12, 21 + cy_shift, 24, 31 + cy_shift, _dn(Ar))
        L.px(14, 24 + cy_shift, (255, 30, 40, 255))
        L.px(16, 23 + cy_shift, (255, 30, 40, 255))
        L.px(14, 24 + cy_shift, (255, 230, 140, 255))
        L.line([(12, 29 + cy_shift), (10, 34 + cy_shift)], Tox[MD], 2)
        L.px(10, 34 + cy_shift, Tox[HI])
    layers.append(L)

    # Patas delanteras (delante del cuerpo)
    L = _L()
    p0 = 3 if leg_phase else -3
    if dr in (0, 3):
        L.line([(18, 27), (9, 28 + p0), (4, 40)], Ar[MD], 2)
        L.line([(29, 27), (38, 28 - p0), (43, 40)], Ar[MD], 2)
        L.line([(19, 30), (12, 34 - p0), (9, 44)], Ar[LT], 2)
        L.line([(28, 30), (35, 34 + p0), (38, 44)], Ar[LT], 2)
    else:
        L.line([(17, 26), (8, 27 + p0), (3, 38)], Ar[MD], 2)
        L.line([(20, 28), (14, 33 - p0), (9, 43)], Ar[LT], 2)
    layers.append(L)

    img = create_canvas(48, 48)
    _draw_shadow(ImageDraw.Draw(img), 24, 38, 14, 5)
    for lay in layers:
        img.alpha_composite(lay.im if lay.noline else _outline(lay.im))
    if direction == 2:
        img = ImageOps.mirror(img)
    return img

# ------------------------------------------------------------------------------
# 2.4 RATA GIGANTE (enemy_rat.png - 48x48)
# Peste, lomo arqueado con pelaje hirsuto, cola látigo móvil e incisivos feroces.
# ------------------------------------------------------------------------------
def draw_rat_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    layers = []
    Fur, Pk = P_RAT_FUR, P_RAT_PINK

    # Cola segmentada y animada
    L = _L()
    tail_w = 4 if anim_frame % 2 == 0 else -3
    if dr == 0:
        L.line([(24, 28 + b), (24 + tail_w, 20), (28 + tail_w, 14)], Pk[MD], 2)
    elif dr == 3:
        L.line([(24, 35 + b), (24 - tail_w, 42), (20 - tail_w, 46)], Pk[MD], 2)
    else:
        L.line([(31, 28 + b), (39, 26 + tail_w), (46, 22 + tail_w)], Pk[MD], 2)
        L.px(46, 22 + tail_w, Pk[HI])
    layers.append(L)

    # Patas traseras y delanteras
    L = _L()
    leg_off = 3 if anim_frame in (1, 3) else -2
    if dr in (0, 3):
        _box(L, 16, 33 + leg_off, 19, 37 + leg_off, Pk)
        _box(L, 28, 33 - leg_off, 31, 37 - leg_off, Pk)
    else:
        _box(L, 14 + leg_off, 34, 18 + leg_off, 38, Pk)
        _box(L, 27 - leg_off, 34, 31 - leg_off, 38, _dn(Pk))
    layers.append(L)

    # Cuerpo / lomo arqueado
    L = _L()
    if dr == 0:
        _ball(L, 17, 20 + b, 30, 33 + b, Fur)
        L.line([(19, 21 + b), (28, 21 + b)], Fur[HI], 1)
    elif dr == 3:
        _ball(L, 17, 19 + b, 30, 34 + b, Fur)
    else:
        _ball(L, 17, 18 + b, 34, 33 + b, Fur)
        L.line([(19, 19 + b), (28, 19 + b)], Fur[HI], 2)
        L.poly([(20, 24 + b), (29, 24 + b), (26, 31 + b)], _dn(Fur)[MD])
    layers.append(L)

    # Cabeza, orejas, bigotes y fauces
    L = _L()
    if dr == 0:
        # Orejas
        _ball(L, 15, 14 + b, 19, 18 + b, Pk)
        _ball(L, 28, 14 + b, 32, 18 + b, Pk)
        # Morro
        _ball(L, 18, 17 + b, 29, 27 + b, Fur)
        # Ojos rabiosos rojos
        L.px(20, 20 + b, (255, 30, 30, 255)); L.px(20, 19 + b, (255, 210, 210, 255))
        L.px(27, 20 + b, (255, 30, 30, 255)); L.px(27, 19 + b, (255, 210, 210, 255))
        # Nariz e incisivos
        L.px(23, 26 + b, Pk[HI]); L.px(24, 26 + b, Pk[HI])
        if is_attack:
            L.rect(23, 27 + b, 24, 29 + b, (255, 255, 240, 255))
    elif dr == 3:
        _ball(L, 15, 13 + b, 19, 17 + b, _dn(Pk))
        _ball(L, 28, 13 + b, 32, 17 + b, _dn(Pk))
        _ball(L, 19, 15 + b, 28, 23 + b, _dn(Fur))
    else:
        # Oreja
        _ball(L, 19, 14 + b, 24, 19 + b, Pk)
        # Cabeza cónica hacia la izquierda
        L.poly([(23, 17 + b), (11, 23 + b), (14, 29 + b), (25, 28 + b)], Fur[MD])
        L.line([(23, 17 + b), (11, 23 + b)], Fur[LT], 1)
        # Ojo rojo
        L.px(16, 21 + b, (255, 30, 30, 255))
        L.px(16, 20 + b, (255, 220, 220, 255))
        # Dientes largos
        L.px(10, 24 + b, Pk[LT])
        if is_attack:
            L.line([(9, 25 + b), (6, 27 + b)], (255, 255, 240, 255), 2)
            L.line([(10, 28 + b), (7, 30 + b)], (255, 255, 240, 255), 2)
    layers.append(L)

    img = create_canvas(48, 48)
    _draw_shadow(ImageDraw.Draw(img), 24, 38, 12, 4)
    for lay in layers:
        img.alpha_composite(lay.im if lay.noline else _outline(lay.im))
    if direction == 2:
        img = ImageOps.mirror(img)
    return img

# ------------------------------------------------------------------------------
# 2.5 HOMBRE LOBO (enemy_werewolf.png - 56x56)
# Bestia bípeda fornida, melena abundante, garras desgarradoras y colmillos.
# ------------------------------------------------------------------------------
def draw_werewolf_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    p = _pose(is_attack, anim_frame)
    if is_attack:
        p['s'] = 4 if anim_frame == 1 else 1

    layers = []
    Wf, Mn, Cl = P_WOLF_FUR, P_WOLF_MANE, P_BONE

    # Piernas digitígradas (músculo bestial)
    L = _L(w=56, h=56)
    if dr in (0, 3):
        for x0, lift in ((20, p['ll']), (31, p['lr'])):
            _box(L, x0, 36 + lift, x0 + 5, 45 + lift, Wf)
            _box(L, x0 - 1, 46 + lift, x0 + 6, 49 + lift, _dn(Wf))
            for c in range(3):
                L.px(x0 + c * 2, 49 + lift, Cl[HI])
    else:
        s = p['s']
        for off, pal in ((-s, _dn(Wf)), (s, Wf)):
            _box(L, 25 + off, 36, 31 + off, 45, pal)
            _box(L, 23 + off, 45, 31 + off, 49, _dn(pal))
            for c in range(3):
                L.px(24 + off + c * 2, 49, Cl[HI])
    layers.append(L)

    # Torso masivo y joroba
    L = _L(w=56, h=56)
    if dr == 0:
        _ball(L, 19, 21 + b, 37, 36 + b, Wf)
        # Mechones de pecho claro
        L.poly([(23, 25 + b), (28, 33 + b), (33, 25 + b)], Wf[HI])
        # Harapos de cinturón
        L.rect(20, 35 + b, 36, 37 + b, P_WOOD[DK])
    elif dr == 3:
        _ball(L, 19, 20 + b, 37, 36 + b, Mn)
        L.line([(28, 23 + b), (28, 34 + b)], Mn[LT], 1)
    else:
        _ball(L, 21, 21 + b, 38, 36 + b, Wf)
        L.line([(24, 23 + b), (24, 34 + b)], Wf[HI], 2)
    layers.append(L)

    # Cabeza lupina, hocico y orejas puntiagudas
    L = _L(w=56, h=56)
    if dr == 0:
        # Orejas
        L.poly([(20, 15 + b), (22, 7 + b), (25, 14 + b)], Mn[DK])
        L.poly([(31, 14 + b), (34, 7 + b), (36, 15 + b)], Mn[DK])
        # Cabeza
        _ball(L, 20, 13 + b, 36, 26 + b, Mn)
        # Hocico
        _box(L, 24, 21 + b, 32, 27 + b, Wf)
        L.px(28, 22 + b, (18, 14, 18, 255))
        # Ojos amarillos depredadores
        L.px(23, 17 + b, (255, 210, 30, 255)); L.px(24, 17 + b, (255, 255, 180, 255))
        L.px(32, 17 + b, (255, 210, 30, 255)); L.px(31, 17 + b, (255, 255, 180, 255))
        # Colmillos
        L.px(25, 27 + b, Cl[HI]); L.px(31, 27 + b, Cl[HI])
    elif dr == 3:
        L.poly([(20, 14 + b), (22, 6 + b), (25, 13 + b)], Mn[DK])
        L.poly([(31, 13 + b), (34, 6 + b), (36, 14 + b)], Mn[DK])
        _ball(L, 20, 12 + b, 36, 25 + b, Mn)
    else:
        L.poly([(28, 13 + b), (32, 6 + b), (35, 13 + b)], Mn[DK])
        _ball(L, 22, 13 + b, 36, 25 + b, Mn)
        # Hocico alargado lateral
        L.poly([(24, 18 + b), (14, 23 + b), (17, 27 + b), (26, 26 + b)], Wf[MD])
        L.px(14, 23 + b, (18, 14, 18, 255))
        L.px(22, 17 + b, (255, 210, 30, 255))
        L.line([(17, 26 + b), (19, 29 + b)], Cl[HI], 2)
    layers.append(L)

    # Brazos con garras titánicas
    L = _L(w=56, h=56)
    if not is_attack:
        if dr in (0, 3):
            _box(L, 14, 24 + b, 19, 36 + b, Wf)
            _box(L, 37, 24 + b, 42, 36 + b, Wf)
            for i in range(3):
                L.px(15 + i, 37 + b, Cl[HI])
                L.px(38 + i, 37 + b, Cl[HI])
        else:
            _box(L, 26, 25 + b, 32, 37 + b, Wf)
            for i in range(3):
                L.px(27 + i, 38 + b, Cl[HI])
    else:
        # Zarpazo salvaje
        atk = anim_frame
        if dr == 0:
            if atk == 0:
                _box(L, 12, 18, 18, 30, Wf); _box(L, 38, 18, 44, 30, Wf)
            else:
                _box(L, 16, 26, 26, 33, Wf); _box(L, 30, 26, 40, 33, Wf)
                for i in range(4):
                    L.line([(18 + i * 2, 33), (14 + i * 2, 40)], Cl[HI], 2)
                    L.line([(32 + i * 2, 33), (36 + i * 2, 40)], Cl[HI], 2)
        else:
            if atk == 0:
                _box(L, 32, 17, 42, 27, Wf)
                for i in range(3):
                    L.line([(42, 18 + i * 3), (48, 15 + i * 3)], Cl[HI], 2)
            else:
                _box(L, 18, 23, 30, 31, Wf)
                for i in range(4):
                    L.line([(18, 24 + i * 2), (8, 30 + i * 2)], Cl[HI], 2)
    layers.append(L)

    # Efecto de zarpazo (slash lines)
    if is_attack and anim_frame == 1:
        fx = _L(noline=True, w=56, h=56)
        if dr == 1:
            for y_off in (-5, 0, 5):
                fx.line([(18, 20 + y_off), (2, 34 + y_off)], (255, 60, 60, 200), 2)
                fx.line([(19, 19 + y_off), (5, 33 + y_off)], (255, 240, 220, 240), 1)
        elif dr == 0:
            for x_off in (-6, 0, 6):
                fx.line([(28 + x_off, 26), (24 + x_off, 44)], (255, 60, 60, 200), 2)
        layers.append(fx)

    img = create_canvas(56, 56)
    _draw_shadow(ImageDraw.Draw(img), 28, 49, 14, 5)
    for lay in layers:
        img.alpha_composite(lay.im if lay.noline else _outline(lay.im))
    if direction == 2:
        img = ImageOps.mirror(img)
    return img

# ------------------------------------------------------------------------------
# 2.6 DEMONIO DEL ABISMO (enemy_demon.png - 56x56)
# Alas de murciélago membranosas, cuernos de obsidiana, torso escarlata y fuego.
# ------------------------------------------------------------------------------
def draw_demon_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    layers = []
    Dk, Red, Horn = P_DEMON_DK, P_DEMON_SK, P_DEMON_DK

    # Alas membranosas (abiertas en la espalda)
    L = _L(w=56, h=56)
    wing_flap = 2 if anim_frame in (1, 2) else -2
    if dr in (0, 3):
        # Ala izquierda y derecha
        L.poly([(22, 22 + b), (4, 11 + wing_flap), (10, 29), (18, 27 + b)], Dk[MD])
        L.line([(22, 22 + b), (4, 11 + wing_flap)], Dk[HI], 2)
        L.poly([(34, 22 + b), (52, 11 + wing_flap), (46, 29), (38, 27 + b)], Dk[MD])
        L.line([(34, 22 + b), (52, 11 + wing_flap)], Dk[HI], 2)
    else:
        L.poly([(32, 21 + b), (49, 10 + wing_flap), (44, 30), (33, 28 + b)], Dk[MD])
        L.line([(32, 21 + b), (49, 10 + wing_flap)], Dk[HI], 2)
    layers.append(L)

    # Cola acabada en punta de flecha
    L = _L(w=56, h=56)
    tail_ang = 4 if anim_frame % 2 == 0 else -3
    if dr != 3:
        L.line([(28, 36 + b), (38 + tail_ang, 38), (44 + tail_ang, 33)], Red[DK], 2)
        L.poly([(44 + tail_ang, 30), (50 + tail_ang, 33), (44 + tail_ang, 37)], Red[HI])
    layers.append(L)

    # Piernas con pezuñas hendidas
    L = _L(w=56, h=56)
    p = _pose(is_attack, anim_frame)
    if dr in (0, 3):
        for x0, lift in ((21, p['ll']), (30, p['lr'])):
            _box(L, x0, 36 + lift, x0 + 4, 45 + lift, Red)
            _box(L, x0 - 1, 46 + lift, x0 + 5, 49 + lift, Dk)
    else:
        s = p['s']
        for off, pal in ((-s, _dn(Red)), (s, Red)):
            _box(L, 25 + off, 36, 30 + off, 45, pal)
            _box(L, 24 + off, 46, 31 + off, 49, Dk)
    layers.append(L)

    # Torso hercúleo rojo fuego
    L = _L(w=56, h=56)
    if dr == 0:
        _ball(L, 20, 20 + b, 36, 36 + b, Red)
        # Marcas abdominales de magma
        L.line([(24, 25 + b), (32, 25 + b)], Red[HI], 1)
        L.line([(25, 29 + b), (31, 29 + b)], Red[HI], 1)
    elif dr == 3:
        _ball(L, 20, 20 + b, 36, 36 + b, _dn(Red))
    else:
        _ball(L, 22, 20 + b, 35, 36 + b, Red)
    layers.append(L)

    # Cabeza demoníaca y cuernos curvados de obsidiana
    L = _L(w=56, h=56)
    if dr == 0:
        # Cuernos curvados hacia fuera
        L.line([(22, 14 + b), (14, 8 + b), (12, 13 + b)], Horn[MD], 3)
        L.px(12, 13 + b, Horn[HI])
        L.line([(34, 14 + b), (42, 8 + b), (44, 13 + b)], Horn[MD], 3)
        L.px(44, 13 + b, Horn[HI])
        # Cara
        _ball(L, 21, 12 + b, 35, 24 + b, Red)
        # Ojos de fuego abrasador
        L.px(24, 17 + b, (255, 240, 50, 255)); L.px(24, 16 + b, (255, 100, 30, 255))
        L.px(31, 17 + b, (255, 240, 50, 255)); L.px(31, 16 + b, (255, 100, 30, 255))
    elif dr == 3:
        L.line([(22, 14 + b), (14, 8 + b), (12, 13 + b)], Horn[MD], 3)
        L.line([(34, 14 + b), (42, 8 + b), (44, 13 + b)], Horn[MD], 3)
        _ball(L, 21, 12 + b, 35, 24 + b, _dn(Red))
    else:
        L.line([(28, 14 + b), (36, 7 + b), (40, 12 + b)], Horn[MD], 3)
        _ball(L, 21, 12 + b, 34, 24 + b, Red)
        L.px(24, 17 + b, (255, 240, 50, 255))
    layers.append(L)

    # Brazos y orbe de fuego abisal
    L = _L(w=56, h=56)
    if not is_attack:
        if dr in (0, 3):
            _box(L, 16, 23 + b, 20, 34 + b, Red)
            _box(L, 36, 23 + b, 40, 34 + b, Red)
        else:
            _box(L, 25, 24 + b, 30, 34 + b, Red)
    else:
        # Poses de ataque: conjuración de fuego infernal
        atk = anim_frame
        if dr == 0:
            _box(L, 15, 20, 20, 30, Red); _box(L, 36, 20, 41, 30, Red)
            _ball(L, 23, 27, 33, 37, P_ORB)
        else:
            _box(L, 18, 22, 28, 28, Red)
            _ball(L, 9, 21, 19, 31, P_ORB)
    layers.append(L)

    # Resplandor ígneo
    if is_attack:
        fx = _L(noline=True, w=56, h=56)
        fx_x, fx_y = (28, 32) if dr == 0 else (14, 26)
        rad = 8 if anim_frame == 1 else 5
        fx.ell(fx_x - rad, fx_y - rad, fx_x + rad, fx_y + rad, (255, 90, 20, 140))
        fx.ell(fx_x - rad + 2, fx_y - rad + 2, fx_x + rad - 2, fx_y + rad - 2, (255, 230, 80, 220))
        layers.append(fx)

    img = create_canvas(56, 56)
    _draw_shadow(ImageDraw.Draw(img), 28, 49, 13, 5)
    for lay in layers:
        img.alpha_composite(lay.im if lay.noline else _outline(lay.im))
    if direction == 2:
        img = ImageOps.mirror(img)
    return img

# ------------------------------------------------------------------------------
# 2.7 JEFE: ABRACADABRA (boss_abracadabra.png - 72x72)
# Masa cadavérica grotesca, pústulas palpitantes de ácido y vómito corrosivo.
# ------------------------------------------------------------------------------
def draw_abracadabra_frame(state, frame_idx):
    layers = []
    Pt, Pust, Tox = P_PUTRID, P_PUSTULE, P_TOXIC
    cx, cy = 36, 38

    # Variaciones de hinchazón según estado
    swell = 0
    if state == 'swell':
        swell = frame_idx * 3
    elif state == 'vomit':
        swell = 2
    elif state == 'charge':
        cx += (frame_idx % 2) * 2 - 1

    # Piernas rechonchas y deformes
    L = _L(w=72, h=72)
    leg_bob = 2 if frame_idx in (1, 3) else 0
    _box(L, cx - 18, cy + 18 - leg_bob, cx - 6, cy + 29 - leg_bob, Pt)
    _box(L, cx + 6, cy + 18 + leg_bob, cx + 18, cy + 29 + leg_bob, _dn(Pt))
    layers.append(L)

    # Vientre mórbido gigante con pústulas
    L = _L(w=72, h=72)
    _ball(L, cx - 24 - swell, cy - 10 - swell // 2, cx + 24 + swell, cy + 24 + swell // 2, Pt)
    # Harapos sucios atados a la cintura
    L.rect(cx - 20 - swell, cy + 12, cx + 20 + swell, cy + 18, P_WOOD[DK])
    # Pústulas neon de gas tóxico
    _ball(L, cx - 18, cy - 4, cx - 8, cy + 6, Pust)
    _ball(L, cx + 10, cy - 8, cx + 22, cy + 4, Pust)
    _ball(L, cx - 4, cy + 4, cx + 4, cy + 12, Pust)
    _ball(L, cx + 12, cy + 6, cx + 18, cy + 12, Pust)
    layers.append(L)

    # Cabeza jorobada con ojos asimétricos y boca cavernosa
    L = _L(w=72, h=72)
    head_y = cy - 25 - (swell // 2)
    _ball(L, cx - 14, head_y, cx + 14, head_y + 20, Pt)
    # Ojos amarillentos desorbitados
    L.ell(cx - 9, head_y + 4, cx - 3, head_y + 10, (255, 240, 100, 255))
    L.px(cx - 6, head_y + 7, (20, 15, 20, 255))
    L.ell(cx + 4, head_y + 3, cx + 11, head_y + 10, (255, 240, 100, 255))
    L.px(cx + 7, head_y + 6, (20, 15, 20, 255))

    # Boca / Vómito
    if state != 'vomit':
        # Fauces cerradas con dientes podridos
        L.rect(cx - 8, head_y + 12, cx + 8, head_y + 17, (30, 20, 25, 255))
        for t in range(4):
            L.px(cx - 6 + t * 4, head_y + 13, (240, 230, 170, 255))
            L.px(cx - 4 + t * 4, head_y + 16, (240, 230, 170, 255))
    else:
        # Fauces abiertas vomitando torrente de bilis ácida
        L.ell(cx - 11, head_y + 10, cx + 11, head_y + 22, (20, 10, 15, 255))
        # Cascada de ácido
        L.poly([(cx - 7, head_y + 16), (cx + 7, head_y + 16), (cx + 18, cy + 28), (cx - 18, cy + 28)], Tox[MD])
        L.line([(cx - 4, head_y + 16), (cx - 10, cy + 28)], Tox[HI], 2)
        L.line([(cx + 4, head_y + 16), (cx + 10, cy + 28)], Tox[HI], 2)
    layers.append(L)

    # Brazos con garras tumorales
    L = _L(w=72, h=72)
    arm_sw = 3 if frame_idx in (1, 2) else -2
    _box(L, cx - 29 - swell, cy - 4 + arm_sw, cx - 22 - swell, cy + 16 + arm_sw, Pt)
    _box(L, cx + 22 + swell, cy - 4 - arm_sw, cx + 29 + swell, cy + 16 - arm_sw, Pt)
    for c in range(3):
        L.px(cx - 28 - swell + c * 2, cy + 17 + arm_sw, P_BONE[HI])
        L.px(cx + 23 + swell + c * 2, cy + 17 - arm_sw, P_BONE[HI])
    layers.append(L)

    # Efecto de salpicadura de ácido / gas tóxico
    if state in ('vomit', 'swell'):
        fx = _L(noline=True, w=72, h=72)
        for _a in range(0, 360, 45):
            rad = 18 + frame_idx * 4
            fx.px(int(cx + math.cos(math.radians(_a)) * rad),
                  int(cy + math.sin(math.radians(_a)) * (rad // 2)),
                  (180, 255, 60, 200))
        layers.append(fx)

    img = create_canvas(72, 72)
    _draw_shadow(ImageDraw.Draw(img), cx, cy + 28, 24, 7)
    for lay in layers:
        img.alpha_composite(lay.im if lay.noline else _outline(lay.im))
    return img

# ------------------------------------------------------------------------------
# 2.8 JEFE TITÁN: HONG (boss_hong.png - 96x96)
# Titán acorazado colosal, placas de quitina roja, fauces torácicas al vacío y espada.
# ------------------------------------------------------------------------------
def draw_hong_frame(frame_idx, is_cleave=False):
    layers = []
    Ch, Dk, Vd, Gld = P_TITAN_CH, P_TITAN_DK, P_VOID, P_GOLD
    cx, cy = 48, 48
    bob = 2 if frame_idx in (1, 3) else 0

    # Capa y hombreras gigantes (detrás)
    L = _L(w=96, h=96)
    L.poly([(cx - 32, cy - 24 + bob), (cx - 46, cy + 24), (cx + 46, cy + 24), (cx + 32, cy - 24 + bob)], Dk[MD])
    L.line([(cx - 32, cy - 24 + bob), (cx - 46, cy + 24)], Dk[LT], 2)
    L.line([(cx + 32, cy - 24 + bob), (cx + 46, cy + 24)], Dk[DK], 2)
    layers.append(L)

    # Piernas acorazadas (grebas de placas)
    L = _L(w=96, h=96)
    for x0 in (cx - 24, cx + 8):
        _box(L, x0, cy + 18 + bob, x0 + 16, cy + 39 + bob, Ch)
        L.line([(x0 + 4, cy + 20 + bob), (x0 + 4, cy + 36 + bob)], Gld[MD], 2)
        _box(L, x0 - 2, cy + 39 + bob, x0 + 18, cy + 43 + bob, Dk)
    layers.append(L)

    # Torso titánico con fauces torácicas (Chest Maw)
    L = _L(w=96, h=96)
    _box(L, cx - 28, cy - 18 + bob, cx + 28, cy + 18 + bob, Ch)
    # Vórtice abisal en el pecho
    mouth_pulse = 2 if frame_idx % 2 == 1 else 0
    L.ell(cx - 18, cy - 6 + bob - mouth_pulse, cx + 18, cy + 12 + bob + mouth_pulse, Vd[DK])
    L.ell(cx - 12, cy - 2 + bob, cx + 12, cy + 8 + bob, Vd[HI])
    # Dientes en las costillas que enmarcan el vacío
    for t in range(5):
        L.line([(cx - 16 + t * 4, cy - 6 + bob), (cx - 14 + t * 4, cy - 2 + bob)], P_BONE[HI], 2)
        L.line([(cx - 16 + t * 4, cy + 12 + bob), (cx - 14 + t * 4, cy + 8 + bob)], P_BONE[HI], 2)
    layers.append(L)

    # Cabeza con corona cornuda
    L = _L(w=96, h=96)
    _ball(L, cx - 16, cy - 38 + bob, cx + 16, cy - 16 + bob, Ch)
    # Corona de cuernos obsidianos
    L.poly([(cx - 16, cy - 34 + bob), (cx - 30, cy - 46 + bob), (cx - 18, cy - 26 + bob)], Dk[MD])
    L.poly([(cx + 16, cy - 34 + bob), (cx + 30, cy - 46 + bob), (cx + 18, cy - 26 + bob)], Dk[MD])
    # Ojos llameantes de energía espectral
    L.ell(cx - 10, cy - 28 + bob, cx - 4, cy - 23 + bob, (255, 200, 30, 255))
    L.ell(cx + 4, cy - 28 + bob, cx + 10, cy - 23 + bob, (255, 200, 30, 255))
    layers.append(L)

    # Brazos colosales y Gran Espada / Cleave
    L = _L(w=96, h=96)
    if not is_cleave:
        # Modo Guardia: sosteniendo mandoble titánico
        _ball(L, cx - 38, cy - 18 + bob, cx - 24, cy - 4 + bob, Ch)
        _ball(L, cx + 24, cy - 18 + bob, cx + 38, cy - 4 + bob, Ch)
        _box(L, cx - 36, cy - 6 + bob, cx - 26, cy + 16 + bob, Ch)
        _box(L, cx + 26, cy - 6 + bob, cx + 36, cy + 16 + bob, Ch)
        # Espada de filo abisal reposando vertical
        _blade(L, (cx + 32, cy + 12 + bob), (cx + 32, cy - 36 + bob), P_STEEL)
    else:
        # Modo Hendidura (Cleave slam overhead)
        if frame_idx in (0, 1):
            # Alzando la espada sobre la cabeza
            _box(L, cx - 20, cy - 42, cx - 10, cy - 20, Ch)
            _box(L, cx + 10, cy - 42, cx + 20, cy - 20, Ch)
            _blade(L, (cx, cy - 42), (cx, cy - 6), P_STEEL)
        else:
            # Impacto frontal devastador
            _box(L, cx - 24, cy - 10, cx - 12, cy + 16, Ch)
            _box(L, cx + 12, cy - 10, cx + 24, cy + 16, Ch)
            _blade(L, (cx, cy + 12), (cx, cy + 46), P_STEEL)
    layers.append(L)

    # Onda de choque y partículas del Cleave
    if is_cleave and frame_idx in (2, 3):
        fx = _L(noline=True, w=96, h=96)
        fx.arc((cx - 38, cy + 18, cx + 38, cy + 48), 0, 180, (220, 80, 255, 220), 4)
        fx.arc((cx - 44, cy + 12, cx + 44, cy + 52), 0, 180, (255, 230, 255, 255), 2)
        for p in (-30, -15, 0, 15, 30):
            fx.px(cx + p, cy + 42, (255, 255, 255, 255))
        layers.append(fx)

    img = create_canvas(96, 96)
    _draw_shadow(ImageDraw.Draw(img), cx, cy + 42, 32, 8)
    for lay in layers:
        img.alpha_composite(lay.im if lay.noline else _outline(lay.im))
    return img

# ==============================================================================
# 3. TILES, PROPS E ICONOS
# ==============================================================================

def _shade(c, f):
    a = c[3] if len(c) > 3 else 255
    return (max(0, min(255, int(c[0] * f))),
            max(0, min(255, int(c[1] * f))),
            max(0, min(255, int(c[2] * f))), a)

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

FLOOR_LAYOUTS = [
    [(0, 16, [16]), (16, 32, [9])],
    [(0, 10, [21]), (10, 21, [8, 24]), (21, 32, [15])],
    [(0, 16, [7, 23]), (16, 32, [17])],
    [(0, 22, [12]), (22, 32, [22])],
]

def _floor_tile(S, variant, rng):
    mid = S['floor']
    img = Image.new('RGBA', (32, 32), _shade(mid, 0.80))
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
    for _ in range(22):
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
        if which == 'a1':
            d.ellipse([6, 10, 26, 24], fill=(30, 40, 54, 255), outline=(22, 28, 38, 255))
            d.ellipse([8, 12, 22, 20], fill=(40, 56, 74, 255))
            d.line([(10, 14), (15, 14)], fill=(92, 120, 146, 255))
            d.point((19, 17), fill=(92, 120, 146, 255))
        else:
            for _ in range(7):
                x, y = rng.randint(2, 26), rng.randint(2, 28)
                d.rectangle([x, y, x + rng.randint(2, 4), y + 1], fill=(58, 86, 52, 255))
                d.point((x + 1, y), fill=(92, 128, 70, 255))
    elif kind == 'demon':
        if which == 'a1':
            pts = _crack_points(rng)
            d.line(pts, fill=(150, 24, 20, 255), width=3)
            d.line(pts, fill=(255, 120, 30, 255), width=2)
            d.line(pts, fill=(255, 220, 90, 255), width=1)
        else:
            for _ in range(10):
                x, y = rng.randrange(32), rng.randrange(32)
                d.point((x, y), fill=(255, 140, 40, 255) if rng.random() < 0.4 else (40, 26, 30, 255))
    elif kind == 'acid':
        if which == 'a1':
            d.ellipse([5, 9, 27, 24], fill=(40, 96, 34, 255), outline=(22, 52, 20, 255))
            d.ellipse([8, 12, 23, 21], fill=(84, 200, 52, 255))
            d.point((12, 15), fill=(190, 255, 90, 255))
            d.point((18, 17), fill=(190, 255, 90, 255))
        else:
            for _ in range(5):
                x, y = rng.randint(3, 25), rng.randint(3, 26)
                d.ellipse([x, y, x + 4, y + 3], fill=(70, 150, 46, 255))
                d.point((x + 1, y), fill=(170, 240, 90, 255))
    else:
        if which == 'a1':
            d.ellipse([7, 7, 25, 25], outline=(110, 180, 255, 255))
            d.line([(16, 10), (16, 22)], fill=(110, 180, 255, 255))
            d.line([(10, 16), (22, 16)], fill=(110, 180, 255, 255))
            d.point((16, 16), fill=(220, 240, 255, 255))
        else:
            for _ in range(9):
                x, y = rng.randrange(32), rng.randrange(32)
                d.point((x, y), fill=(160, 200, 255, 255) if rng.random() < 0.5 else (90, 80, 140, 255))
    return img

def _wall_front(S, kind, accent, rng):
    brick = S['brick']
    img = Image.new('RGBA', (32, 32), _shade(brick, 0.55))
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
    for _ in range(5):
        x, y = rng.randrange(32), rng.randint(5, 26)
        img.putpixel((x, y), _shade(brick, 0.5))
    for y in range(28, 32):
        f = 0.78 - (y - 28) * 0.10
        for x in range(32):
            img.putpixel((x, y), _shade(img.getpixel((x, y)), f))
    if accent:
        d = ImageDraw.Draw(img)
        if kind == 'crypt':
            pts = [(16, 5), (13, 11), (18, 17), (14, 24)]
            d.line(pts, fill=S['crack'], width=1)
            for x in range(4, 28, 3):
                d.rectangle([x, 26, x + 2, 28], fill=(54, 80, 48, 255))
        elif kind == 'demon':
            pts = [(16, 5), (12, 12), (19, 19), (14, 27)]
            d.line(pts, fill=(150, 24, 20, 255), width=3)
            d.line(pts, fill=(255, 120, 30, 255), width=2)
            d.line(pts, fill=(255, 220, 90, 255), width=1)
        elif kind == 'acid':
            for x in (7, 17, 24):
                d.line([(x, 4), (x, rng.randint(14, 24))], fill=(84, 200, 52, 255), width=2)
                d.point((x, 26), fill=(190, 255, 90, 255))
        else:
            d.line([(8, 17), (15, 12), (24, 20)], fill=(110, 180, 255, 255))
            for p in [(8, 17), (15, 12), (24, 20)]:
                d.point(p, fill=(220, 240, 255, 255))
    return img

def _wall_top(S, variant, rng):
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

def generate_icons():
    """Genera la hoja de iconos 240x24 (10 iconos de 24x24) con pixel art 16-bit detallado."""
    icons = create_canvas(240, 24)
    d = ImageDraw.Draw(icons)

    # --------------------------------------------------------------------------
    # ICONO 0: ESPADA DE ACERO (sword_short, sword_broad, sword_paladin)
    # --------------------------------------------------------------------------
    ox = 0
    # Pomo dorado
    d.ellipse([ox + 2, 19, ox + 5, 22], fill=(245, 205, 65, 255), outline=OUTLINE)
    d.point((ox + 3, 20), fill=(255, 245, 170, 255))
    # Empuñadura forrada en cuero
    d.line([(ox + 4, 18), (ox + 7, 15)], fill=(110, 65, 40, 255), width=2)
    d.point((ox + 5, 17), fill=(160, 105, 65, 255))
    # Guarda dorada cruzada
    d.polygon([(ox + 4, 14), (ox + 6, 13), (ox + 10, 17), (ox + 9, 19), (ox + 7, 17)],
              fill=(225, 180, 50, 255), outline=OUTLINE)
    d.line([(ox + 5, 14), (ox + 9, 18)], fill=(255, 235, 130, 255))
    # Hoja de acero (filo inferior en sombra, cuerpo medio y filo de luz superior)
    d.line([(ox + 9, 15), (ox + 19, 5)], fill=(85, 95, 125, 255), width=3)
    d.line([(ox + 8, 14), (ox + 18, 4)], fill=(180, 195, 225, 255), width=2)
    d.line([(ox + 7, 13), (ox + 18, 2)], fill=(250, 255, 255, 255), width=1)
    # Punta afilada
    d.polygon([(ox + 17, 3), (ox + 21, 2), (ox + 19, 6)], fill=(240, 248, 255, 255), outline=OUTLINE)
    # Destello de brillo estelar (Glint)
    d.point((ox + 16, 5), fill=(255, 255, 255, 255))
    d.point((ox + 16, 4), fill=(255, 255, 255, 200))
    d.point((ox + 16, 6), fill=(255, 255, 255, 200))
    d.point((ox + 15, 5), fill=(255, 255, 255, 200))
    d.point((ox + 17, 5), fill=(255, 255, 255, 200))

    # --------------------------------------------------------------------------
    # ICONO 1: HOJA DEMONÍACA / SEGADORA DE ALMAS (blade_demonic)
    # --------------------------------------------------------------------------
    ox = 24
    # Pomo de orbe carmesí
    d.ellipse([ox + 2, 19, ox + 6, 23], fill=(80, 10, 25, 255), outline=OUTLINE)
    d.point((ox + 3, 20), fill=(255, 80, 80, 255))
    # Empuñadura de obsidiana
    d.line([(ox + 5, 17), (ox + 8, 14)], fill=(35, 25, 35, 255), width=2)
    # Guarda de cuernos retorcidos
    d.polygon([(ox + 3, 16), (ox + 7, 12), (ox + 12, 17), (ox + 9, 20)], fill=(50, 20, 30, 255), outline=OUTLINE)
    d.line([(ox + 5, 15), (ox + 10, 18)], fill=(160, 40, 50, 255))
    # Hoja dentada candente
    d.line([(ox + 9, 13), (ox + 19, 3)], fill=(120, 20, 30, 255), width=4)
    d.line([(ox + 8, 12), (ox + 18, 2)], fill=(255, 160, 40, 255), width=2)
    d.line([(ox + 7, 11), (ox + 17, 1)], fill=(255, 230, 120, 255), width=1)
    d.point((ox + 13, 10), fill=(255, 80, 40, 255))
    d.point((ox + 17, 6), fill=(255, 80, 40, 255))
    d.polygon([(ox + 18, 2), (ox + 22, 1), (ox + 20, 5)], fill=(255, 200, 100, 255), outline=OUTLINE)

    # --------------------------------------------------------------------------
    # ICONO 2: ARCO DE CAZADOR RECURVADO CON FLECHA (bow_hunter, bow_elven)
    # --------------------------------------------------------------------------
    ox = 48
    # Mástil curvado de madera noble
    d.arc([ox + 3, 2, ox + 14, 21], 90, 270, fill=OUTLINE, width=4)
    d.arc([ox + 4, 3, ox + 13, 20], 90, 270, fill=(130, 80, 45, 255), width=2)
    d.arc([ox + 5, 4, ox + 12, 19], 90, 270, fill=(185, 130, 75, 255), width=1)
    # Remates de plata en los extremos
    d.point((ox + 8, 3), fill=(230, 235, 245, 255))
    d.point((ox + 8, 20), fill=(230, 235, 245, 255))
    # Cuerda tensada blanca
    d.line([(ox + 8, 3), (ox + 8, 20)], fill=(245, 245, 255, 255), width=1)
    # Flecha nockeada
    d.line([(ox + 6, 12), (ox + 19, 12)], fill=(160, 110, 65, 255), width=1)
    d.line([(ox + 6, 10), (ox + 8, 12), (ox + 6, 14)], fill=(220, 40, 40, 255), width=1)
    d.polygon([(ox + 18, 10), (ox + 22, 12), (ox + 18, 14)], fill=(210, 225, 240, 255), outline=OUTLINE)

    # --------------------------------------------------------------------------
    # ICONO 3: BASTÓN ARCANO CON ORBE MÍSTICO (staff_inferno, staff_arcane)
    # --------------------------------------------------------------------------
    ox = 72
    # Vara de madera con relieves
    d.line([(ox + 4, 21), (ox + 15, 9)], fill=(45, 28, 20, 255), width=4)
    d.line([(ox + 4, 21), (ox + 15, 9)], fill=(125, 80, 50, 255), width=2)
    d.line([(ox + 5, 20), (ox + 14, 9)], fill=(175, 120, 75, 255), width=1)
    # Engarce de oro
    d.polygon([(ox + 13, 10), (ox + 18, 6), (ox + 14, 5)], fill=(225, 180, 50, 255), outline=OUTLINE)
    # Orbe incandescente con núcleo brillante
    d.ellipse([ox + 13, 3, ox + 21, 11], fill=(200, 35, 25, 255), outline=OUTLINE)
    d.ellipse([ox + 14, 4, ox + 20, 10], fill=(255, 130, 30, 255))
    d.ellipse([ox + 15, 5, ox + 19, 9], fill=(255, 225, 80, 255))
    d.point((ox + 16, 6), fill=(255, 255, 240, 255))
    d.point((ox + 12, 3), fill=(255, 220, 90, 200))
    d.point((ox + 21, 12), fill=(255, 220, 90, 200))

    # --------------------------------------------------------------------------
    # ICONO 4: CORAZA DE PLACAS DE CABALLERO (armor_plate, armor_titan)
    # --------------------------------------------------------------------------
    ox = 96
    # Hombreras (pauldrons)
    d.ellipse([ox + 2, 5, ox + 8, 11], fill=(120, 135, 160, 255), outline=OUTLINE)
    d.ellipse([ox + 15, 5, ox + 21, 11], fill=(120, 135, 160, 255), outline=OUTLINE)
    # Cuello / Gorjal
    d.polygon([(ox + 8, 4), (ox + 15, 4), (ox + 13, 8), (ox + 10, 8)], fill=(45, 50, 65, 255), outline=OUTLINE)
    # Pectoral con relieve anatómico
    d.polygon([(ox + 6, 8), (ox + 17, 8), (ox + 18, 16), (ox + 12, 21), (ox + 5, 16)],
              fill=(160, 175, 205, 255), outline=OUTLINE)
    d.polygon([(ox + 12, 8), (ox + 17, 8), (ox + 18, 16), (ox + 12, 20)], fill=(105, 120, 150, 255))
    d.line([(ox + 11, 8), (ox + 11, 19)], fill=(240, 250, 255, 255), width=1)
    d.line([(ox + 6, 17), (ox + 12, 21), (ox + 17, 17)], fill=(230, 190, 60, 255), width=1)
    d.point((ox + 8, 10), fill=(240, 250, 255, 255))

    # --------------------------------------------------------------------------
    # ICONO 5: JUBÓN DE CUERO Y TÚNICA (armor_leather, armor_robe)
    # --------------------------------------------------------------------------
    ox = 120
    # Pecho de cuero acolchado
    d.polygon([(ox + 4, 6), (ox + 19, 6), (ox + 18, 18), (ox + 5, 18)], fill=(125, 80, 50, 255), outline=OUTLINE)
    d.polygon([(ox + 9, 6), (ox + 14, 6), (ox + 11, 11)], fill=(190, 140, 105, 255))
    d.line([(ox + 5, 7), (ox + 18, 7)], fill=(170, 115, 70, 255))
    # Correa cruzada con hebilla
    d.line([(ox + 6, 9), (ox + 16, 15)], fill=(75, 45, 28, 255), width=2)
    d.point((ox + 11, 12), fill=(245, 205, 65, 255))
    # Cinturón con hebilla dorada
    d.rectangle([(ox + 5, 16), (ox + 18, 18)], fill=(50, 30, 20, 255))
    d.rectangle([(ox + 10, 15), (ox + 13, 19)], fill=(225, 180, 50, 255), outline=OUTLINE)
    # Faldón
    d.polygon([(ox + 5, 19), (ox + 18, 19), (ox + 20, 22), (ox + 3, 22)], fill=(100, 62, 38, 255), outline=OUTLINE)

    # --------------------------------------------------------------------------
    # ICONO 6: POCIÓN DE SALUD (potion_health, potion_elixir)
    # --------------------------------------------------------------------------
    ox = 144
    # Tapón de corcho
    d.rectangle([(ox + 10, 2), (ox + 13, 4)], fill=(185, 140, 95, 255), outline=OUTLINE)
    d.rectangle([(ox + 9, 5), (ox + 14, 7)], fill=(180, 205, 230, 255), outline=OUTLINE)
    # Frasco esférico con líquido rubí
    d.ellipse([ox + 4, 7, ox + 19, 22], fill=(60, 15, 25, 255), outline=OUTLINE)
    d.ellipse([ox + 5, 9, ox + 18, 21], fill=(215, 30, 50, 255))
    d.ellipse([ox + 6, 12, ox + 17, 20], fill=(245, 60, 75, 255))
    # Reflejo curvo del vidrio
    d.arc([ox + 6, 9, ox + 17, 19], 150, 240, fill=(255, 230, 235, 255), width=2)
    d.point((ox + 10, 16), fill=(255, 160, 170, 255))
    d.point((ox + 13, 14), fill=(255, 160, 170, 255))

    # --------------------------------------------------------------------------
    # ICONO 7: POCIÓN DE MANÁ (potion_mana)
    # --------------------------------------------------------------------------
    ox = 168
    # Tapón de corcho
    d.rectangle([(ox + 10, 2), (ox + 13, 4)], fill=(185, 140, 95, 255), outline=OUTLINE)
    d.rectangle([(ox + 9, 5), (ox + 14, 7)], fill=(180, 205, 230, 255), outline=OUTLINE)
    # Frasco esférico con líquido zafiro
    d.ellipse([ox + 4, 7, ox + 19, 22], fill=(15, 25, 65, 255), outline=OUTLINE)
    d.ellipse([ox + 5, 9, ox + 18, 21], fill=(25, 110, 235, 255))
    d.ellipse([ox + 6, 12, ox + 17, 20], fill=(60, 175, 255, 255))
    # Reflejo curvo del vidrio
    d.arc([ox + 6, 9, ox + 17, 19], 150, 240, fill=(210, 240, 255, 255), width=2)
    d.point((ox + 10, 16), fill=(180, 230, 255, 255))
    d.point((ox + 13, 14), fill=(180, 230, 255, 255))

    # --------------------------------------------------------------------------
    # ICONO 8: MATERIAL DE MONSTRUO / CRÁNEO Y CUERNOS (mat_bone, mat_horn)
    # --------------------------------------------------------------------------
    ox = 192
    # Cuernos demoníacos curvados
    d.line([(ox + 5, 10), (ox + 2, 4), (ox + 6, 3)], fill=(55, 35, 50, 255), width=2)
    d.line([(ox + 18, 10), (ox + 21, 4), (ox + 17, 3)], fill=(55, 35, 50, 255), width=2)
    # Cráneo de marfil
    d.ellipse([ox + 5, 6, ox + 18, 17], fill=(235, 225, 205, 255), outline=OUTLINE)
    d.polygon([(ox + 8, 16), (ox + 15, 16), (ox + 14, 21), (ox + 9, 21)], fill=(205, 195, 175, 255), outline=OUTLINE)
    # Cuencas y nariz
    d.ellipse([ox + 7, 10, ox + 10, 13], fill=(25, 18, 28, 255))
    d.ellipse([ox + 13, 10, ox + 16, 13], fill=(25, 18, 28, 255))
    d.point((ox + 11, 14), fill=(30, 20, 30, 255))
    d.point((ox + 12, 14), fill=(30, 20, 30, 255))
    d.point((ox + 10, 19), fill=(255, 250, 240, 255))
    d.point((ox + 13, 19), fill=(255, 250, 240, 255))

    # --------------------------------------------------------------------------
    # ICONO 9: MONEDAS DE ORO (Gold Piles / Coins)
    # --------------------------------------------------------------------------
    ox = 216
    # Monedas base
    d.ellipse([ox + 3, 13, ox + 13, 21], fill=(160, 110, 25, 255), outline=OUTLINE)
    d.ellipse([ox + 4, 14, ox + 12, 20], fill=(245, 195, 45, 255))
    d.ellipse([ox + 5, 15, ox + 11, 19], fill=(255, 225, 90, 255))
    d.ellipse([ox + 11, 12, ox + 21, 20], fill=(160, 110, 25, 255), outline=OUTLINE)
    d.ellipse([ox + 12, 13, ox + 20, 19], fill=(245, 195, 45, 255))
    d.ellipse([ox + 13, 14, ox + 19, 18], fill=(255, 225, 90, 255))
    # Moneda frontal
    d.ellipse([ox + 7, 5, ox + 17, 14], fill=(180, 125, 30, 255), outline=OUTLINE)
    d.ellipse([ox + 8, 6, ox + 16, 13], fill=(255, 215, 60, 255))
    d.ellipse([ox + 9, 7, ox + 15, 12], fill=(255, 245, 140, 255))
    # Destello de brillo
    d.line([(ox + 18, 3), (ox + 18, 7)], fill=(255, 255, 230, 255), width=1)
    d.line([(ox + 16, 5), (ox + 20, 5)], fill=(255, 255, 230, 255), width=1)
    d.point((ox + 18, 5), fill=(255, 255, 255, 255))

    icons.save(os.path.join(ASSETS_DIR, 'icons.png'))
    print("Creado: icons.png (Pixel art 16-bit mejorado)")



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