"""
Generador de Sprites Pixel Art 16-Bit para 'La Torre Oscura'
Héroes con variantes de armas/armaduras y monstruos/jefes con sombreado de alta calidad.
"""

import os
import math
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

def _shade(c, f):
    a = c[3] if len(c) > 3 else 255
    return (max(0, min(255, int(c[0] * f))),
            max(0, min(255, int(c[1] * f))),
            max(0, min(255, int(c[2] * f))), a)

# ==============================================================================
# PALETAS DE COLOR (5 TONOS POR RAMPA)
# ==============================================================================
HI, LT, MD, DK, DP = range(5)

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

# Paletas de Armas y Armaduras
P_OBSID        = [(150, 138, 176), (104, 92, 132), (66, 56, 92), (42, 34, 64), (26, 20, 42)]
P_LAVA         = [(255, 240, 170), (255, 190, 80), (255, 110, 40), (214, 52, 36), (140, 28, 40)]
P_CRIMSON      = [(255, 150, 130), (230, 70, 70), (176, 36, 52), (118, 24, 44), (76, 16, 36)]
P_BLOODCAPE    = [(160, 70, 100), (116, 40, 78), (82, 26, 60), (54, 18, 44), (34, 12, 30)]
P_PALADIN      = [(255, 255, 255), (252, 246, 218), (240, 216, 152), (206, 166, 94), (152, 110, 72)]
P_CELESTE      = [(255, 255, 255), (232, 242, 255), (194, 216, 248), (146, 176, 228), (100, 126, 186)]
P_HOLY         = [(255, 255, 255), (240, 249, 255), (208, 230, 252), (162, 194, 238), (114, 142, 202)]
P_AQUA         = [(232, 255, 255), (152, 238, 255), (84, 198, 242), (42, 142, 202), (26, 92, 152)]
P_NIGHT        = [(116, 94, 148), (80, 62, 112), (54, 42, 80), (36, 28, 56), (22, 16, 36)]
P_BLACKLEATHER = [(124, 108, 122), (92, 78, 98), (64, 52, 74), (44, 36, 56), (28, 22, 40)]
P_ELVEN        = [(255, 255, 248), (244, 248, 228), (214, 230, 198), (168, 194, 164), (120, 148, 128)]
P_GOLDLEATHER  = [(255, 242, 206), (238, 210, 146), (206, 168, 100), (158, 118, 76), (108, 76, 56)]
P_CREAM        = [(255, 255, 232), (236, 226, 196), (206, 192, 160), (166, 150, 128), (116, 102, 98)]
P_NIGHTROBE    = [(130, 92, 160), (92, 62, 124), (62, 40, 90), (42, 28, 64), (26, 16, 42)]
P_VOID         = [(255, 216, 255), (228, 132, 255), (174, 72, 216), (114, 42, 158), (66, 22, 102)]
P_HOLYORB      = [(255, 255, 255), (224, 250, 255), (164, 228, 255), (98, 172, 238), (58, 112, 192)]
P_BONE2        = [(255, 252, 238), (234, 228, 208), (198, 190, 172), (144, 136, 130), (94, 88, 100)]

EYE_RED = (255, 70, 60, 255)
EYE_BLUE = (40, 90, 160, 255)
EYE_N = (28, 22, 40, 255)

# Paletas de Monstruos
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

WARRIOR_ARMOR = [
    dict(S=P_STEEL,   G=P_GOLD,    C=P_BLUE,       R=P_RED,    eye=EYE_N),
    dict(S=P_OBSID,   G=P_CRIMSON, C=P_BLOODCAPE,  R=P_PURPLE, eye=EYE_RED),
    dict(S=P_PALADIN, G=P_GOLD,    C=P_CELESTE,    R=P_GOLD,   eye=EYE_BLUE),
]
ARCHER_ARMOR = [
    dict(G=P_GREEN, T=P_LEATHER,      PANTS=P_PANTS,        eye=EYE_N,    trim=P_GOLD),
    dict(G=P_NIGHT, T=P_BLACKLEATHER, PANTS=P_BLACKLEATHER, eye=EYE_RED,  trim=P_CRIMSON),
    dict(G=P_ELVEN, T=P_GOLDLEATHER,  PANTS=P_CREAM,        eye=EYE_BLUE, trim=P_GOLD),
]
MAGE_ARMOR = [
    dict(M=P_PURPLE,    G=P_GOLD,    eye=EYE_N),
    dict(M=P_NIGHTROBE, G=P_CRIMSON, eye=EYE_RED),
    dict(M=P_CELESTE,   G=P_GOLD,    eye=EYE_BLUE),
]

def _dn(R):
    return [R[1], R[2], R[3], R[4], R[4]]

class _L:
    def __init__(s, noline=False, w=48, h=48, size=None):
        if size is not None:
            w, h = size, size
        s.w, s.h = w, h
        s.size = w
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

def _mir(pts):
    return [(47 - x, y) for x, y in pts]

def _dagger(L, hand, tip, R=P_STEEL):
    hx, hy = hand
    tx, ty = tip
    L.line([(hx, hy), (tx, ty)], R[MD], 2)
    L.line([(hx, hy - 1), (tx, ty - 1)], R[HI], 1)
    L.px(hx, hy + 1, P_WOOD[DK])
    L.px(tx, ty, R[HI])

def _draw_shadow(canvas_draw, cx, cy, rx, ry):
    canvas_draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(10, 10, 18, 110))
    canvas_draw.ellipse([cx - rx + 2, cy - ry + 1, cx + rx - 2, cy + ry - 1], fill=(10, 10, 18, 70))

# ==============================================================================
# SISTEMA DE ARMAS Y ARMADURAS DINÁMICAS
# ==============================================================================

def _blade(L, hand, tip, R=P_STEEL, look=0):
    hx, hy = hand
    tx, ty = tip
    ln = math.hypot(tx - hx, ty - hy) or 1
    ux, uy = (tx - hx) / ln, (ty - hy) / ln
    nx, ny = -uy, ux
    gx, gy = hx + ux * 2, hy + uy * 2
    sx, sy = hx + ux * 3, hy + uy * 3
    pmx, pmy = int(hx - ux * 3), int(hy - uy * 3)

    if look == 1: # Demoniaca
        O, F = P_OBSID, P_LAVA
        L.line([(hx - ux * 2, hy - uy * 2), (hx, hy)], O[DK], 2)
        L.ell(pmx - 1, pmy - 1, pmx + 1, pmy + 1, F[MD])
        for sg in (-1, 1):
            L.line([(gx, gy), (gx + nx * sg * 4 - ux * 2, gy + ny * sg * 4 - uy * 2)], O[MD], 2)
            L.px(int(gx + nx * sg * 5 - ux * 3), int(gy + ny * sg * 5 - uy * 3), F[HI])
        L.line([(sx, sy), (tx, ty)], O[MD], 3)
        L.line([(sx - nx, sy - ny), (tx - nx, ty - ny)], O[LT], 1)
        L.line([(sx + nx, sy + ny), (tx + nx, ty + ny)], O[DK], 1)
        L.line([(sx + ux * 2, sy + uy * 2), (tx - ux, ty - uy)], F[MD], 1)
        for i in range(3, int(ln) - 2, 3):
            L.px(int(round(hx + ux * i + nx * 2)), int(round(hy + uy * i + ny * 2)), O[DK])
        L.px(int(tx), int(ty), F[HI])
        return

    if look == 2: # Legendaria
        H, Gd = P_HOLY, P_GOLD
        L.line([(hx - ux * 2, hy - uy * 2), (hx, hy)], Gd[DK], 2)
        L.ell(pmx - 1, pmy - 1, pmx + 1, pmy + 1, Gd[HI])
        for sg in (-1, 1):
            L.poly([(gx, gy), (gx + nx * sg * 6 - ux, gy + ny * sg * 6 - uy),
                    (gx + nx * sg * 4 + ux * 2, gy + ny * sg * 4 + uy * 2)], Gd[MD])
            L.px(int(gx + nx * sg * 5), int(gy + ny * sg * 5), Gd[HI])
        L.line([(sx, sy), (tx, ty)], H[LT], 4)
        L.line([(sx, sy), (tx, ty)], H[HI], 2)
        L.line([(sx - nx * 2, sy - ny * 2), (tx - nx * 2, ty - ny * 2)], H[MD], 1)
        L.line([(sx + nx * 2, sy + ny * 2), (tx + nx * 2, ty + ny * 2)], H[DK], 1)
        L.px(int(gx), int(gy), P_AQUA[MD])
        return

    # Comun
    L.line([(hx - ux * 2, hy - uy * 2), (hx, hy)], P_WOOD[DK], 2)
    L.px(pmx, pmy, P_GOLD[MD])
    L.line([(gx - nx * 3, gy - ny * 3), (gx + nx * 3, gy + ny * 3)], P_GOLD[MD], 2)
    L.px(int(gx - nx * 3), int(gy - ny * 3), P_GOLD[HI])
    L.line([(sx, sy), (tx, ty)], R[MD], 3)
    L.line([(sx - nx, sy - ny), (tx - nx, ty - ny)], R[HI], 1)
    L.line([(sx + nx, sy + ny), (tx + nx, ty + ny)], R[DK], 1)
    L.px(int(tx), int(ty), R[HI])

def _blade_fx(hand, tip, look, size=48):
    fx = _L(noline=True, size=size)
    if look == 0:
        return fx
    col, hi = ((255, 100, 50), (255, 210, 120)) if look == 1 else ((140, 220, 255), (255, 252, 210))
    fx.line([hand, tip], col + (34,), 9)
    fx.line([hand, tip], col + (60,), 6)
    for i, off in ((1, 3), (2, -3), (3, 3)):
        t = i / 4.0
        x = int(hand[0] + (tip[0] - hand[0]) * t)
        y = int(hand[1] + (tip[1] - hand[1]) * t)
        fx.px(x + off, y - 1, hi + (230,))
    return fx

def _bow(L, dr, ai, look=0, fx=None):
    W = [P_WOOD, P_OBSID, P_GOLD][look]
    string = [(236, 230, 204, 255), (255, 96, 120, 255), (190, 246, 255, 255)][look]
    tipc = [None, P_LAVA[HI], P_WHITE[HI]][look]
    glow = [None, (255, 70, 110), (140, 225, 255)][look]
    a_shaft = [P_WOOD[LT], P_OBSID[LT], P_GOLD[LT]][look]
    a_head = [P_STEEL[HI], P_LAVA[MD], P_AQUA[HI]][look]
    a_fl = [P_RED[MD], P_PURPLE[DK], P_WHITE[HI]][look]

    def tips(pts):
        if tipc:
            for (x, y) in pts:
                L.px(x, y, tipc)

    def deco(x, y0, y1):
        if look == 2:
            L.poly([(x - 3, y0 + 3), (x - 8, y0), (x - 6, y0 + 5)], P_WHITE[LT])
            L.poly([(x - 3, y1 - 3), (x - 8, y1), (x - 6, y1 - 5)], P_WHITE[LT])
        elif look == 1:
            L.line([(x, y0), (x - 2, y0 - 2)], P_OBSID[LT])
            L.line([(x, y1), (x - 2, y1 + 2)], P_OBSID[LT])

    def glow_arc(box, a0, a1):
        if fx is not None and glow:
            fx.arc(box, a0, a1, glow + (50,), 6)

    if dr in (0, 3):
        sg = 1 if dr == 0 else -1
        if ai is None:
            box = (10, 14, 20, 40)
            L.arc(box, 90, 270, W[MD], 2)
            glow_arc(box, 90, 270)
            L.line([(15, 14), (15, 40)], string, 1)
            tips([(15, 14), (15, 40)])
            deco(15, 14, 40)
            return
        box = (12, 19, 36, 33)
        a0, a1 = (0, 180) if dr == 0 else (180, 360)
        L.arc(box, a0, a1, W[MD], 2)
        glow_arc(box, a0, a1)
        pull = {0: 2, 1: 6, 2: 0}[ai] * (-sg)
        L.line([(12, 26), (24, 26 + pull)], string, 1)
        L.line([(24, 26 + pull), (36, 26)], string, 1)
        tips([(12, 26), (36, 26)])
        if ai in (0, 1):
            y0 = 26 + pull
            y1 = y0 + sg * 17
            L.line([(24, y0), (24, y1)], a_shaft, 1)
            L.px(24, y1, a_head)
            L.px(24, y1 + sg, a_head)
            L.px(23, y0 + sg, a_fl)
            L.px(25, y0 + sg, a_fl)
            if fx is not None and glow:
                fx.px(24, y1 + sg * 2, glow + (200,))
        return

    if ai is None:
        box = (8, 14, 18, 40)
        L.arc(box, 90, 270, W[MD], 2)
        glow_arc(box, 90, 270)
        L.line([(13, 14), (13, 40)], string, 1)
        tips([(13, 14), (13, 40)])
        deco(13, 14, 40)
        return
    box = (7, 14, 17, 40)
    L.arc(box, 90, 270, W[MD], 2)
    glow_arc(box, 90, 270)
    pull = {0: 3, 1: 8, 2: 0}[ai]
    L.line([(12, 14), (12 + pull, 27)], string, 1)
    L.line([(12 + pull, 27), (12, 40)], string, 1)
    tips([(12, 14), (12, 40)])
    deco(12, 14, 40)
    if ai in (0, 1):
        x1 = 12 + pull
        L.line([(2, 27), (x1 + 2, 27)], a_shaft, 1)
        L.px(1, 27, a_head)
        L.px(2, 27, a_head)
        L.px(x1 + 1, 26, a_fl)
        L.px(x1 + 1, 28, a_fl)
        if fx is not None and glow:
            fx.px(0, 27, glow + (220,))

def _warrior_extra(dr, b, ak):
    if ak == 0:
        return None, None
    behind, front = _L(), _L()
    if ak == 2:
        wl_ = [(17, 13 + b), (10, 9 + b), (8, 12 + b), (11, 13 + b), (9, 16 + b), (13, 16 + b), (17, 17 + b)]
        ws_ = [(26, 13 + b), (33, 9 + b), (35, 12 + b), (32, 13 + b), (34, 16 + b), (30, 16 + b), (26, 17 + b)]
        for w in ([ws_] if dr == 1 else [wl_, _mir(wl_)]):
            behind.poly(w, P_WHITE[LT])
            behind.line([w[0], w[2]], P_WHITE[MD])
            behind.line([w[0], w[4]], P_WHITE[DK])
            behind.px(w[2][0], w[2][1], P_GOLD[MD])
        if dr == 0:
            front.rect(23, 24 + b, 24, 25 + b, P_AQUA[MD])
            front.px(23, 24 + b, P_AQUA[HI])
    else:
        hl = [(18, 11 + b), (14, 9 + b), (13, 3 + b), (16, 7 + b), (19, 9 + b)]
        hs = [(25, 10 + b), (25, 3 + b), (29, 7 + b), (28, 10 + b)]
        sl = [(15, 21 + b), (13, 16 + b), (18, 20 + b)]
        ss = [(24, 20 + b), (22, 15 + b), (27, 20 + b)]
        for h in ([hs] if dr == 1 else [hl, _mir(hl)]):
            front.poly(h, P_OBSID[LT])
            front.px(h[1][0], h[1][1], P_LAVA[MD])
        for sp in ([ss] if dr == 1 else [sl, _mir(sl)]):
            front.poly(sp, P_OBSID[LT])
            front.px(sp[1][0], sp[1][1], P_LAVA[MD])
        if dr == 0:
            front.px(23, 24 + b, P_LAVA[MD]); front.px(24, 25 + b, P_LAVA[MD]); front.px(23, 26 + b, P_LAVA[LT])
    return behind, front

def _archer_extra(dr, b, ak):
    if ak == 0:
        return None
    L = _L()
    if ak == 1:
        sl = [(17, 21 + b), (14, 17 + b), (19, 20 + b)]
        ss = [(23, 21 + b), (21, 17 + b), (26, 21 + b)]
        for sp in ([ss] if dr == 1 else [sl, _mir(sl)]):
            L.poly(sp, P_NIGHT[LT])
            L.px(sp[1][0], sp[1][1], P_CRIMSON[MD])
    else:
        pts = [(30, 5 + b), (36, 2 + b), (37, 6 + b), (32, 8 + b)] if dr == 1 else [(28, 4 + b), (34, 1 + b), (36, 5 + b), (31, 6 + b)]
        L.poly(pts, P_WHITE[LT])
        L.line([pts[0], pts[2]], P_GOLD[MD])
    return L

def _mage_extra(dr, b, ak):
    if ak == 0:
        return None
    L = _L()
    if ak == 1:
        hl = [(15, 11 + b), (12, 5 + b), (18, 9 + b)]
        hs = [(29, 11 + b), (32, 5 + b), (26, 9 + b)]
        for h in ([hs] if dr == 1 else [hl, _mir(hl)]):
            L.poly(h, P_BONE2[LT])
            L.px(h[1][0], h[1][1], P_CRIMSON[MD])
    else:
        if dr != 3:
            for dx, dy in ((0, -1), (-1, 0), (0, 0), (1, 0), (0, 1)):
                L.px(24 + dx, 8 + b + dy, P_GOLD[HI])
        if dr == 0:
            for x, y in ((20, 33), (27, 34), (24, 36)):
                L.px(x, y, P_GOLD[HI])
    return L

SWORD = {
    0: {'idle': ((32, 29), (32, 13)), 0: ((33, 24), (40, 8)),  1: ((31, 30), (31, 46)), 2: ((30, 31), (22, 45))},
    1: {'idle': ((16, 29), (14, 13)), 0: ((24, 22), (30, 7)),  1: ((15, 27), (0, 27)),  2: ((14, 30), (4, 42))},
    3: {'idle': ((32, 29), (32, 13)), 0: ((31, 26), (37, 12)), 1: ((28, 22), (26, 2)),  2: ((26, 22), (19, 5))},
}

STAFF = {
    0: {'idle': ((33, 32), (33, 9)), 0: ((33, 28), (35, 3)), 1: ((32, 27), (30, 36)), 2: ((33, 28), (34, 12))},
    1: {'idle': ((17, 31), (16, 9)), 0: ((16, 26), (14, 3)), 1: ((14, 27), (7, 23)),  2: ((15, 28), (10, 10))},
    3: {'idle': ((33, 32), (33, 9)), 0: ((32, 27), (33, 3)), 1: ((30, 24), (27, 2)),  2: ((32, 28), (33, 7))},
}

def _warrior_layers(dr, p, ai, wl=0, ak=0):
    b = p['b']
    AW = WARRIOR_ARMOR[ak]
    S, G, C, R, K = AW['S'], AW['G'], AW['C'], AW['R'], P_SKIN
    eye = AW['eye']
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
        out.append(_blade_fx(sw[0], sw[1], wl))
        L = _L()
        _blade(L, sw[0], sw[1], look=wl)
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

    ex_behind, ex_front = _warrior_extra(dr, b, ak)
    if ex_behind:
        out.append(ex_behind)

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
        L.rect(21, 16 + b, 21, 17 + b, eye)
        L.rect(26, 16 + b, 26, 17 + b, eye)
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
        L.rect(19, 16 + b, 19, 17 + b, eye)
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

    if ex_front:
        out.append(ex_front)

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
        out.append(_blade_fx(sw[0], sw[1], wl))
        L = _L()
        _blade(L, sw[0], sw[1], look=wl)
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

def _archer_layers(dr, p, ai, wl=0, ak=0):
    b = p['b']
    AA = ARCHER_ARMOR[ak]
    G, T, K, H = AA['G'], AA['T'], P_SKIN, P_HAIR
    eye = AA['eye']
    trim = AA['trim']
    bfx = _L(noline=True)
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

    out.append(_legs(dr, p, AA['PANTS'], T))

    L = _L()
    if dr == 0:
        _box(L, 19, 21 + b, 28, 30 + b, T)
        L.line([(20, 22 + b), (27, 29 + b)], T[DK])
        L.rect(19, 28 + b, 28, 29 + b, T[DP])
        L.rect(23, 28 + b, 24, 29 + b, trim[MD])
        L.px(23, 28 + b, trim[HI])
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
        L.px(20, 28 + b, trim[MD])
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
        L.rect(21, 16 + b, 21, 17 + b, eye)
        L.rect(26, 16 + b, 26, 17 + b, eye)
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
        L.rect(19, 16 + b, 19, 17 + b, eye)
        L.line([(23, 13 + b), (23, 19 + b)], G[DK])
    out.append(L)

    ex = _archer_extra(dr, b, ak)
    if ex:
        out.append(ex)

    L = _L()
    al, ar = p['al'], p['ar']
    if dr == 0:
        _box(L, 29, 24 + b + ar, 31, 28 + b + ar, _dn(T))
        _hand(L, 30, 29 + b + ar)
        if ai is None:
            _bow(L, dr, None, wl, bfx)
            _box(L, 15, 24 + b + al, 17, 28 + b + al, _dn(T))
            _hand(L, 15, 29 + b + al)
        else:
            _bow(L, dr, ai, wl, bfx)
            _hand(L, 12, 26); _hand(L, 36, 26)
            _box(L, 13, 23 + b, 15, 26 + b, _dn(T))
    elif dr == 3:
        _box(L, 29, 24 + b + ar, 31, 28 + b + ar, _dn(T))
        _hand(L, 30, 29 + b + ar)
        if ai is None:
            _box(L, 15, 24 + b + al, 17, 28 + b + al, _dn(T))
            _hand(L, 16, 29 + b + al)
            _bow(L, dr, None, wl, bfx)
        else:
            _bow(L, dr, ai, wl, bfx)
            _hand(L, 12, 26); _hand(L, 36, 26)
    else:
        s = p['s']
        if ai is None:
            L.line([(23, 24 + b), (16 - s // 3, 27 + b)], T[MD], 3)
            _hand(L, 15 - s // 3, 28 + b)
            _bow(L, dr, None, wl, bfx)
        else:
            L.line([(23, 24 + b), (12, 27)], T[MD], 3)
            _hand(L, 12, 27)
            _bow(L, dr, ai, wl, bfx)
            pull = {0: 3, 1: 8, 2: 0}[ai]
            _hand(L, 12 + pull + 1, 27)
    out.append(L)
    out.append(bfx)
    return out

def _mage_layers(dr, p, ai, anim, wl=0, ak=0):
    b = p['b']
    AM = MAGE_ARMOR[ak]
    M, G, K, Wh, Wd = AM['M'], AM['G'], P_SKIN, P_WHITE, P_WOOD
    eye = AM['eye']
    gc = [((255, 190, 90), (255, 225, 130), (255, 245, 190)),
          ((190, 80, 255), (232, 160, 255), (246, 200, 255)),
          ((130, 225, 255), (226, 250, 255), (255, 255, 255))][wl]
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
        if wl == 0:
            L2.line([(hx, hy), (tx, ty)], Wd[MD], 2)
            L2.line([(hx - 1, hy), (tx - 1, ty)], Wd[LT], 1)
            L2.px(tx + 1, ty + 2, P_GOLD[MD]); L2.px(tx - 1, ty + 3, P_GOLD[MD])
            _ball(L2, tx - 3, ty - 4, tx + 3, ty + 2, P_ORB)
        elif wl == 1:
            O = P_OBSID
            L2.line([(hx, hy), (tx, ty)], O[MD], 2)
            L2.line([(hx - 1, hy), (tx - 1, ty)], O[LT], 1)
            n = max(1, int(math.hypot(tx - hx, ty - hy)))
            for i in range(4, n - 3, 5):
                t = i / float(n)
                L2.px(int(hx + (tx - hx) * t) + 1, int(hy + (ty - hy) * t), P_CRIMSON[MD])
            for sg in (-1, 1):
                L2.line([(tx, ty + 3), (tx + sg * 4, ty), (tx + sg * 3, ty - 5)], O[MD], 1)
            _ball(L2, tx - 3, ty - 4, tx + 3, ty + 2, P_VOID)
        else:
            Gd = P_GOLD
            L2.line([(hx, hy), (tx, ty)], Gd[MD], 2)
            L2.line([(hx - 1, hy), (tx - 1, ty)], Gd[LT], 1)
            for sg in (-1, 1):
                L2.poly([(tx, ty + 2), (tx + sg * 7, ty - 1), (tx + sg * 6, ty - 5), (tx + sg * 3, ty - 3)], P_WHITE[LT])
                L2.line([(tx + sg * 2, ty), (tx + sg * 6, ty - 4)], P_WHITE[DK])
            _ball(L2, tx - 3, ty - 4, tx + 3, ty + 2, P_HOLYORB)

    if dr == 1:
        L = _L()
        staff(L)
        out.append(L)

    L = _L()
    if dr == 0:
        _ball(L, 18, 11 + b, 29, 22 + b, K)
        L.rect(21, 16 + b, 21, 17 + b, eye)
        L.rect(26, 16 + b, 26, 17 + b, eye)
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
        L.rect(19, 16 + b, 19, 17 + b, eye)
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

    ex = _mage_extra(dr, b, ak)
    if ex:
        out.append(ex)

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

    fx = _L(noline=True)
    (tx, ty) = stf[1]
    if ai is None:
        rad = 5 + (anim % 2)
        al_ = 70
    else:
        rad = {0: 6, 1: 9, 2: 7}[ai]
        al_ = {0: 90, 1: 150, 2: 100}[ai]
    fx.ell(tx - rad, ty - 1 - rad, tx + rad, ty - 1 + rad, gc[0] + (al_ // 2,))
    fx.ell(tx - rad + 2, ty - 1 - rad + 2, tx + rad - 2, ty - 1 + rad - 2, gc[1] + (al_,))
    if ai == 1:
        for ang in range(0, 360, 60):
            ax = tx + int(math.cos(math.radians(ang)) * (rad + 3))
            ay = ty - 1 + int(math.sin(math.radians(ang)) * (rad + 3))
            fx.px(ax, ay, gc[2] + (230,))
    out.append(fx)
    return out

def _render_hero(cls, direction, anim, is_attack, wl=0, ak=0):
    dr = 1 if direction == 2 else direction
    p = _pose(is_attack, anim)
    ai = anim if is_attack else None
    if is_attack and cls == 'warrior':
        p['s'] = 0
    if cls == 'warrior':
        layers = _warrior_layers(dr, p, ai, wl, ak)
    elif cls == 'archer':
        layers = _archer_layers(dr, p, ai, wl, ak)
    else:
        layers = _mage_layers(dr, p, ai, anim, wl, ak)

    img = create_canvas(48, 48)
    sh = ImageDraw.Draw(img)
    sh.ellipse([13, 38, 35, 44], fill=(10, 10, 18, 105))
    sh.ellipse([16, 39, 32, 43], fill=(10, 10, 18, 70))
    for L in layers:
        img.alpha_composite(L.im if L.noline else _outline(L.im))
    if direction == 2:
        img = ImageOps.mirror(img)
    return img

def draw_warrior_frame(direction, anim_frame, is_attack=False, wl=0, ak=0):
    return _render_hero('warrior', direction, anim_frame, is_attack, wl, ak)

def draw_archer_frame(direction, anim_frame, is_attack=False, wl=0, ak=0):
    return _render_hero('archer', direction, anim_frame, is_attack, wl, ak)

def draw_mage_frame(direction, anim_frame, is_attack=False, wl=0, ak=0):
    return _render_hero('mage', direction, anim_frame, is_attack, wl, ak)

# ==============================================================================
# ENEMIGOS 16-BIT SHADED ART
# ==============================================================================

# 1. BANDIDO (enemy_bandit.png - 48x48)
def draw_bandit_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    p = _pose(is_attack, anim_frame)
    if is_attack:
        p['s'] = 4 if anim_frame == 1 else 1

    layers = []
    C, Lth, Msk, Sk = P_BANDIT_CL, P_BANDIT, P_RED, P_SKIN

    L = _L()
    if dr == 3:
        L.poly([(17, 21 + b), (31, 21 + b), (32, 35), (16, 35)], C[DK])
        L.line([(17, 21 + b), (16, 35)], C[LT])
        L.line([(31, 21 + b), (32, 35)], C[DP])
    elif dr == 1:
        L.poly([(26, 21 + b), (32, 23 + b), (33, 34), (27, 33)], C[DK])
    layers.append(L)

    layers.append(_legs(dr, p, C, P_LEATHER))

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

    L = _L()
    if dr == 0:
        _ball(L, 17, 8 + b, 30, 20 + b, C)
        L.poly([(17, 9 + b), (24, 6 + b), (30, 9 + b), (28, 14 + b), (19, 14 + b)], C[LT])
        L.rect(20, 14 + b, 27, 16 + b, Sk[MD])
        L.px(21, 15 + b, (22, 18, 30, 255))
        L.px(26, 15 + b, (22, 18, 30, 255))
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

# 2. ESQUELETO (enemy_skeleton.png - 48x48)
def draw_skeleton_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    p = _pose(is_attack, anim_frame)
    if is_attack:
        p['s'] = 3 if anim_frame == 1 else 0

    layers = []
    B, Rst = P_BONE, P_RUST

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

    L = _L()
    if dr == 0:
        L.rect(23, 20 + b, 24, 28 + b, B[DK])
        for y in range(21 + b, 28 + b, 2):
            L.line([(19, y), (28, y)], B[LT], 1)
            L.px(19, y, B[MD]); L.px(28, y, B[MD])
        L.poly([(20, 28 + b), (27, 28 + b), (25, 31 + b), (22, 31 + b)], B[MD])
        L.px(21, 29 + b, B[DK]); L.px(26, 29 + b, B[DK])
    elif dr == 3:
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

    L = _L()
    if dr == 0:
        _ball(L, 17, 7 + b, 30, 18 + b, B)
        _box(L, 20, 17 + b, 27, 21 + b, B)
        L.rect(20, 12 + b, 22, 14 + b, (18, 12, 16, 255))
        L.rect(25, 12 + b, 27, 14 + b, (18, 12, 16, 255))
        L.px(21, 13 + b, (255, 60, 60, 255))
        L.px(26, 13 + b, (255, 60, 60, 255))
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

    L = _L()
    if not is_attack:
        if dr == 0:
            _ball(L, 11, 21 + b, 18, 28 + b, P_WOOD)
            L.px(14, 24 + b, P_STEEL[MD])
            _blade(L, (29, 27 + b), (36, 17 + b), Rst)
        elif dr == 3:
            _blade(L, (30, 27 + b), (37, 17 + b), Rst)
        else:
            _ball(L, 19, 21 + b, 25, 27 + b, P_WOOD)
            _blade(L, (18, 27 + b), (10, 36 + b), Rst)
    else:
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

# 3. ARAÑA GIGANTE (enemy_spider.png - 48x48)
def draw_spider_frame(direction, anim_frame):
    dr = 1 if direction == 2 else direction
    cy_shift = 1 if anim_frame in (1, 3) else 0
    layers = []
    Ar, Tox = P_ARACHNID, P_TOXIC

    L = _L()
    leg_phase = anim_frame % 2
    if dr == 0:
        p0 = -3 if leg_phase else 3
        L.line([(16, 22), (6, 16 + p0), (2, 28)], Ar[DK], 2)
        L.line([(31, 22), (41, 16 - p0), (45, 28)], Ar[DK], 2)
        L.line([(15, 26), (5, 25 - p0), (1, 35)], Ar[DK], 2)
        L.line([(32, 26), (42, 25 + p0), (46, 35)], Ar[DK], 2)
    elif dr == 3:
        p0 = 3 if leg_phase else -3
        L.line([(16, 26), (6, 18 + p0), (2, 10)], Ar[DK], 2)
        L.line([(31, 26), (41, 18 - p0), (45, 10)], Ar[DK], 2)
    else:
        p0 = -2 if leg_phase else 2
        L.line([(26, 24), (36, 18 + p0), (42, 26)], Ar[DP], 2)
        L.line([(28, 25), (40, 24 - p0), (44, 34)], Ar[DP], 2)
    layers.append(L)

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

    L = _L()
    if dr == 0:
        _ball(L, 18, 24 + cy_shift, 29, 33 + cy_shift, _dn(Ar))
        for ox in (-3, -1, 1, 3):
            L.px(23 + ox, 27 + cy_shift, (255, 30, 40, 255))
            L.px(23 + ox, 29 + cy_shift, (180, 20, 30, 255))
        L.px(22, 27 + cy_shift, (255, 230, 140, 255))
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

# 4. RATA GIGANTE (enemy_rat.png - 48x48)
def draw_rat_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    layers = []
    Fur, Pk = P_RAT_FUR, P_RAT_PINK

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

    L = _L()
    leg_off = 3 if anim_frame in (1, 3) else -2
    if dr in (0, 3):
        _box(L, 16, 33 + leg_off, 19, 37 + leg_off, Pk)
        _box(L, 28, 33 - leg_off, 31, 37 - leg_off, Pk)
    else:
        _box(L, 14 + leg_off, 34, 18 + leg_off, 38, Pk)
        _box(L, 27 - leg_off, 34, 31 - leg_off, 38, _dn(Pk))
    layers.append(L)

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

    L = _L()
    if dr == 0:
        _ball(L, 15, 14 + b, 19, 18 + b, Pk)
        _ball(L, 28, 14 + b, 32, 18 + b, Pk)
        _ball(L, 18, 17 + b, 29, 27 + b, Fur)
        L.px(20, 20 + b, (255, 30, 30, 255)); L.px(20, 19 + b, (255, 210, 210, 255))
        L.px(27, 20 + b, (255, 30, 30, 255)); L.px(27, 19 + b, (255, 210, 210, 255))
        L.px(23, 26 + b, Pk[HI]); L.px(24, 26 + b, Pk[HI])
        if is_attack:
            L.rect(23, 27 + b, 24, 29 + b, (255, 255, 240, 255))
    elif dr == 3:
        _ball(L, 15, 13 + b, 19, 17 + b, _dn(Pk))
        _ball(L, 28, 13 + b, 32, 17 + b, _dn(Pk))
        _ball(L, 19, 15 + b, 28, 23 + b, _dn(Fur))
    else:
        _ball(L, 19, 14 + b, 24, 19 + b, Pk)
        L.poly([(23, 17 + b), (11, 23 + b), (14, 29 + b), (25, 28 + b)], Fur[MD])
        L.line([(23, 17 + b), (11, 23 + b)], Fur[LT], 1)
        L.px(16, 21 + b, (255, 30, 30, 255))
        L.px(16, 20 + b, (255, 220, 220, 255))
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

# 5. HOMBRE LOBO (enemy_werewolf.png - 56x56)
def draw_werewolf_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    p = _pose(is_attack, anim_frame)
    if is_attack:
        p['s'] = 4 if anim_frame == 1 else 1

    layers = []
    Wf, Mn, Cl = P_WOLF_FUR, P_WOLF_MANE, P_BONE

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

    L = _L(w=56, h=56)
    if dr == 0:
        _ball(L, 19, 21 + b, 37, 36 + b, Wf)
        L.poly([(23, 25 + b), (28, 33 + b), (33, 25 + b)], Wf[HI])
        L.rect(20, 35 + b, 36, 37 + b, P_WOOD[DK])
    elif dr == 3:
        _ball(L, 19, 20 + b, 37, 36 + b, Mn)
        L.line([(28, 23 + b), (28, 34 + b)], Mn[LT], 1)
    else:
        _ball(L, 21, 21 + b, 38, 36 + b, Wf)
        L.line([(24, 23 + b), (24, 34 + b)], Wf[HI], 2)
    layers.append(L)

    L = _L(w=56, h=56)
    if dr == 0:
        L.poly([(20, 15 + b), (22, 7 + b), (25, 14 + b)], Mn[DK])
        L.poly([(31, 14 + b), (34, 7 + b), (36, 15 + b)], Mn[DK])
        _ball(L, 20, 13 + b, 36, 26 + b, Mn)
        _box(L, 24, 21 + b, 32, 27 + b, Wf)
        L.px(28, 22 + b, (18, 14, 18, 255))
        L.px(23, 17 + b, (255, 210, 30, 255)); L.px(24, 17 + b, (255, 255, 180, 255))
        L.px(32, 17 + b, (255, 210, 30, 255)); L.px(31, 17 + b, (255, 255, 180, 255))
        L.px(25, 27 + b, Cl[HI]); L.px(31, 27 + b, Cl[HI])
    elif dr == 3:
        L.poly([(20, 14 + b), (22, 6 + b), (25, 13 + b)], Mn[DK])
        L.poly([(31, 13 + b), (34, 6 + b), (36, 14 + b)], Mn[DK])
        _ball(L, 20, 12 + b, 36, 25 + b, Mn)
    else:
        L.poly([(28, 13 + b), (32, 6 + b), (35, 13 + b)], Mn[DK])
        _ball(L, 22, 13 + b, 36, 25 + b, Mn)
        L.poly([(24, 18 + b), (14, 23 + b), (17, 27 + b), (26, 26 + b)], Wf[MD])
        L.px(14, 23 + b, (18, 14, 18, 255))
        L.px(22, 17 + b, (255, 210, 30, 255))
        L.line([(17, 26 + b), (19, 29 + b)], Cl[HI], 2)
    layers.append(L)

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

# 6. DEMONIO MENOR (enemy_demon.png - 56x56)
def draw_demon_frame(direction, anim_frame, is_attack=False):
    dr = 1 if direction == 2 else direction
    b = -1 if (anim_frame in (1, 3) and not is_attack) else 0
    layers = []
    Dk, Red, Horn = P_DEMON_DK, P_DEMON_SK, P_DEMON_DK

    L = _L(w=56, h=56)
    wing_flap = 2 if anim_frame in (1, 2) else -2
    if dr in (0, 3):
        L.poly([(22, 22 + b), (4, 11 + wing_flap), (10, 29), (18, 27 + b)], Dk[MD])
        L.line([(22, 22 + b), (4, 11 + wing_flap)], Dk[HI], 2)
        L.poly([(34, 22 + b), (52, 11 + wing_flap), (46, 29), (38, 27 + b)], Dk[MD])
        L.line([(34, 22 + b), (52, 11 + wing_flap)], Dk[HI], 2)
    else:
        L.poly([(32, 21 + b), (49, 10 + wing_flap), (44, 30), (33, 28 + b)], Dk[MD])
        L.line([(32, 21 + b), (49, 10 + wing_flap)], Dk[HI], 2)
    layers.append(L)

    L = _L(w=56, h=56)
    tail_ang = 4 if anim_frame % 2 == 0 else -3
    if dr != 3:
        L.line([(28, 36 + b), (38 + tail_ang, 38), (44 + tail_ang, 33)], Red[DK], 2)
        L.poly([(44 + tail_ang, 30), (50 + tail_ang, 33), (44 + tail_ang, 37)], Red[HI])
    layers.append(L)

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

    L = _L(w=56, h=56)
    if dr == 0:
        _ball(L, 20, 20 + b, 36, 36 + b, Red)
        L.line([(24, 25 + b), (32, 25 + b)], Red[HI], 1)
        L.line([(25, 29 + b), (31, 29 + b)], Red[HI], 1)
    elif dr == 3:
        _ball(L, 20, 20 + b, 36, 36 + b, _dn(Red))
    else:
        _ball(L, 22, 20 + b, 35, 36 + b, Red)
    layers.append(L)

    L = _L(w=56, h=56)
    if dr == 0:
        L.line([(22, 14 + b), (14, 8 + b), (12, 13 + b)], Horn[MD], 3)
        L.px(12, 13 + b, Horn[HI])
        L.line([(34, 14 + b), (42, 8 + b), (44, 13 + b)], Horn[MD], 3)
        L.px(44, 13 + b, Horn[HI])
        _ball(L, 21, 12 + b, 35, 24 + b, Red)
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

    L = _L(w=56, h=56)
    if not is_attack:
        if dr in (0, 3):
            _box(L, 16, 23 + b, 20, 34 + b, Red)
            _box(L, 36, 23 + b, 40, 34 + b, Red)
        else:
            _box(L, 25, 24 + b, 30, 34 + b, Red)
    else:
        atk = anim_frame
        if dr == 0:
            _box(L, 15, 20, 20, 30, Red); _box(L, 36, 20, 41, 30, Red)
            _ball(L, 23, 27, 33, 37, P_ORB)
        else:
            _box(L, 18, 22, 28, 28, Red)
            _ball(L, 9, 21, 19, 31, P_ORB)
    layers.append(L)

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

# 7. ABRACADABRA (boss_abracadabra.png - 72x72)
def draw_abracadabra_frame(state, frame_idx):
    layers = []
    Pt, Pust, Tox = P_PUTRID, P_PUSTULE, P_TOXIC
    cx, cy = 36, 38

    swell = 0
    if state == 'swell':
        swell = frame_idx * 3
    elif state == 'vomit':
        swell = 2
    elif state == 'charge':
        cx += (frame_idx % 2) * 2 - 1

    L = _L(w=72, h=72)
    leg_bob = 2 if frame_idx in (1, 3) else 0
    _box(L, cx - 18, cy + 18 - leg_bob, cx - 6, cy + 29 - leg_bob, Pt)
    _box(L, cx + 6, cy + 18 + leg_bob, cx + 18, cy + 29 + leg_bob, _dn(Pt))
    layers.append(L)

    L = _L(w=72, h=72)
    _ball(L, cx - 24 - swell, cy - 10 - swell // 2, cx + 24 + swell, cy + 24 + swell // 2, Pt)
    L.rect(cx - 20 - swell, cy + 12, cx + 20 + swell, cy + 18, P_WOOD[DK])
    _ball(L, cx - 18, cy - 4, cx - 8, cy + 6, Pust)
    _ball(L, cx + 10, cy - 8, cx + 22, cy + 4, Pust)
    _ball(L, cx - 4, cy + 4, cx + 4, cy + 12, Pust)
    _ball(L, cx + 12, cy + 6, cx + 18, cy + 12, Pust)
    layers.append(L)

    L = _L(w=72, h=72)
    head_y = cy - 25 - (swell // 2)
    _ball(L, cx - 14, head_y, cx + 14, head_y + 20, Pt)
    L.ell(cx - 9, head_y + 4, cx - 3, head_y + 10, (255, 240, 100, 255))
    L.px(cx - 6, head_y + 7, (20, 15, 20, 255))
    L.ell(cx + 4, head_y + 3, cx + 11, head_y + 10, (255, 240, 100, 255))
    L.px(cx + 7, head_y + 6, (20, 15, 20, 255))

    if state != 'vomit':
        L.rect(cx - 8, head_y + 12, cx + 8, head_y + 17, (30, 20, 25, 255))
        for t in range(4):
            L.px(cx - 6 + t * 4, head_y + 13, (240, 230, 170, 255))
            L.px(cx - 4 + t * 4, head_y + 16, (240, 230, 170, 255))
    else:
        L.ell(cx - 11, head_y + 10, cx + 11, head_y + 22, (20, 10, 15, 255))
        L.poly([(cx - 7, head_y + 16), (cx + 7, head_y + 16), (cx + 18, cy + 28), (cx - 18, cy + 28)], Tox[MD])
        L.line([(cx - 4, head_y + 16), (cx - 10, cy + 28)], Tox[HI], 2)
        L.line([(cx + 4, head_y + 16), (cx + 10, cy + 28)], Tox[HI], 2)
    layers.append(L)

    L = _L(w=72, h=72)
    arm_sw = 3 if frame_idx in (1, 2) else -2
    _box(L, cx - 29 - swell, cy - 4 + arm_sw, cx - 22 - swell, cy + 16 + arm_sw, Pt)
    _box(L, cx + 22 + swell, cy - 4 - arm_sw, cx + 29 + swell, cy + 16 - arm_sw, Pt)
    for c in range(3):
        L.px(cx - 28 - swell + c * 2, cy + 17 + arm_sw, P_BONE[HI])
        L.px(cx + 23 + swell + c * 2, cy + 17 - arm_sw, P_BONE[HI])
    layers.append(L)

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

# 8. HONG (boss_hong.png - 96x96)
def draw_hong_frame(frame_idx, is_cleave=False):
    layers = []
    Ch, Dk, Vd, Gld = P_TITAN_CH, P_TITAN_DK, P_VOID, P_GOLD
    cx, cy = 48, 48
    bob = 2 if frame_idx in (1, 3) else 0

    L = _L(w=96, h=96)
    L.poly([(cx - 32, cy - 24 + bob), (cx - 46, cy + 24), (cx + 46, cy + 24), (cx + 32, cy - 24 + bob)], Dk[MD])
    L.line([(cx - 32, cy - 24 + bob), (cx - 46, cy + 24)], Dk[LT], 2)
    L.line([(cx + 32, cy - 24 + bob), (cx + 46, cy + 24)], Dk[DK], 2)
    layers.append(L)

    L = _L(w=96, h=96)
    for x0 in (cx - 24, cx + 8):
        _box(L, x0, cy + 18 + bob, x0 + 16, cy + 39 + bob, Ch)
        L.line([(x0 + 4, cy + 20 + bob), (x0 + 4, cy + 36 + bob)], Gld[MD], 2)
        _box(L, x0 - 2, cy + 39 + bob, x0 + 18, cy + 43 + bob, Dk)
    layers.append(L)

    L = _L(w=96, h=96)
    _box(L, cx - 28, cy - 18 + bob, cx + 28, cy + 18 + bob, Ch)
    mouth_pulse = 2 if frame_idx % 2 == 1 else 0
    L.ell(cx - 18, cy - 6 + bob - mouth_pulse, cx + 18, cy + 12 + bob + mouth_pulse, Vd[DK])
    L.ell(cx - 12, cy - 2 + bob, cx + 12, cy + 8 + bob, Vd[HI])
    for t in range(5):
        L.line([(cx - 16 + t * 4, cy - 6 + bob), (cx - 14 + t * 4, cy - 2 + bob)], P_BONE[HI], 2)
        L.line([(cx - 16 + t * 4, cy + 12 + bob), (cx - 14 + t * 4, cy + 8 + bob)], P_BONE[HI], 2)
    layers.append(L)

    L = _L(w=96, h=96)
    _ball(L, cx - 16, cy - 38 + bob, cx + 16, cy - 16 + bob, Ch)
    L.poly([(cx - 16, cy - 34 + bob), (cx - 30, cy - 46 + bob), (cx - 18, cy - 26 + bob)], Dk[MD])
    L.poly([(cx + 16, cy - 34 + bob), (cx + 30, cy - 46 + bob), (cx + 18, cy - 26 + bob)], Dk[MD])
    L.ell(cx - 10, cy - 28 + bob, cx - 4, cy - 23 + bob, (255, 200, 30, 255))
    L.ell(cx + 4, cy - 28 + bob, cx + 10, cy - 23 + bob, (255, 200, 30, 255))
    layers.append(L)

    L = _L(w=96, h=96)
    if not is_cleave:
        _ball(L, cx - 38, cy - 18 + bob, cx - 24, cy - 4 + bob, Ch)
        _ball(L, cx + 24, cy - 18 + bob, cx + 38, cy - 4 + bob, Ch)
        _box(L, cx - 36, cy - 6 + bob, cx - 26, cy + 16 + bob, Ch)
        _box(L, cx + 26, cy - 6 + bob, cx + 36, cy + 16 + bob, Ch)
        _blade(L, (cx + 32, cy + 12 + bob), (cx + 32, cy - 36 + bob), P_STEEL)
    else:
        if frame_idx in (0, 1):
            _box(L, cx - 20, cy - 42, cx - 10, cy - 20, Ch)
            _box(L, cx + 10, cy - 42, cx + 20, cy - 20, Ch)
            _blade(L, (cx, cy - 42), (cx, cy - 6), P_STEEL)
        else:
            _box(L, cx - 24, cy - 10, cx - 12, cy + 16, Ch)
            _box(L, cx + 12, cy - 10, cx + 24, cy + 16, Ch)
            _blade(L, (cx, cy + 12), (cx, cy + 46), P_STEEL)
    layers.append(L)

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
# TILESETS Y PROPS (INCLUYE COFRE ABIERTO)
# ==============================================================================

TILE_STYLES = {
    'crypt': dict(floor=(108, 99, 92), brick=(62, 54, 76), cap=(112, 100, 130), top=(36, 31, 46), void=(17, 14, 24), crack=(34, 30, 34)),
    'demon': dict(floor=(84, 58, 62), brick=(104, 38, 48), cap=(176, 82, 94), top=(50, 22, 30), void=(21, 9, 14), crack=(30, 16, 20)),
    'acid':  dict(floor=(92, 106, 86), brick=(48, 66, 46), cap=(124, 154, 112), top=(26, 36, 26), void=(11, 17, 11), crack=(30, 40, 28)),
    'apex':  dict(floor=(72, 70, 96), brick=(48, 44, 78), cap=(112, 106, 164), top=(28, 26, 48), void=(12, 11, 22), crack=(22, 20, 40)),
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

    # ==============================================================================
# SUB-JEFE: LUCIAN, EL PRIMER HOMBRE LOBO (boss_lucian.png - 72x72)
# Lobo titánico de pelaje blanco plateado, ojos cian helados y garras lunares
# ==============================================================================

P_LUCIAN_FUR  = [(255, 255, 255), (232, 238, 246), (190, 200, 218), (140, 150, 172), (90, 100, 120)]
P_LUCIAN_MANE = [(224, 230, 242), (176, 186, 206), (130, 140, 164), (88, 98, 120), (55, 62, 80)]
P_LUCIAN_EYE  = (65, 230, 255, 255) # Ojos cian espectrales

def draw_lucian_frame(state, frame_idx):
    layers = []
    Fur, Mn, Cl = P_LUCIAN_FUR, P_LUCIAN_MANE, P_BONE
    cx, cy = 36, 38
    bob = 2 if frame_idx in (1, 3) else 0

    # 1. Piernas digitígradas musculosas
    L = _L(w=72, h=72)
    leg_shift = 3 if frame_idx in (1, 3) else -2
    if state == 'pounce':
        _box(L, cx - 18, cy + 18, cx - 10, cy + 28, Fur)
        _box(L, cx + 8, cy + 18, cx + 16, cy + 28, _dn(Fur))
    else:
        _box(L, cx - 15 + leg_shift, cy + 16, cx - 8 + leg_shift, cy + 28, Fur)
        _box(L, cx + 7 - leg_shift, cy + 16, cx + 14 - leg_shift, cy + 28, _dn(Fur))
        for c in range(3):
            L.px(cx - 14 + leg_shift + c * 2, cy + 29, Cl[HI])
            L.px(cx + 8 - leg_shift + c * 2, cy + 29, Cl[HI])
    layers.append(L)

    # 2. Torso colosal y joroba de pelaje blanco
    L = _L(w=72, h=72)
    _ball(L, cx - 16, cy - 8 + bob, cx + 16, cy + 18 + bob, Fur)
    # Melena plateada densa
    L.poly([(cx - 14, cy - 4 + bob), (cx, cy + 12 + bob), (cx + 14, cy - 4 + bob)], Mn[LT])
    L.line([(cx, cy - 4 + bob), (cx, cy + 14 + bob)], Fur[HI], 2)
    layers.append(L)

    # 3. Cabeza lupina según estado (Aullido o Ataque)
    L = _L(w=72, h=72)
    if state == 'howl':
        # Cabeza hacia atrás aullando al cielo
        head_y = cy - 24 + bob
        _ball(L, cx - 12, head_y - 4, cx + 12, head_y + 14, Mn)
        L.poly([(cx - 10, head_y), (cx - 13, head_y - 12), (cx - 6, head_y - 2)], Mn[DK])
        L.poly([(cx + 6, head_y - 2), (cx + 13, head_y - 12), (cx + 10, head_y)], Mn[DK])
        # Hocico apuntando hacia arriba
        _box(L, cx - 6, head_y - 8, cx + 6, head_y + 2, Fur)
        L.rect(cx - 4, head_y - 6, cx + 4, head_y - 1, (20, 15, 25, 255))
        for t in (-3, 0, 3):
            L.px(cx + t, head_y - 6, Cl[HI])
            L.px(cx + t, head_y - 1, Cl[HI])
    else:
        # Cabeza de frente agresiva
        head_y = cy - 18 + bob
        _ball(L, cx - 14, head_y, cx + 14, head_y + 16, Mn)
        L.poly([(cx - 12, head_y + 2), (cx - 15, head_y - 10), (cx - 7, head_y)], Mn[DK])
        L.poly([(cx + 7, head_y), (cx + 15, head_y - 10), (cx + 12, head_y + 2)], Mn[DK])
        # Hocico
        _box(L, cx - 7, head_y + 8, cx + 7, head_y + 17, Fur)
        L.px(cx - 1, head_y + 9, (18, 14, 20, 255))
        L.px(cx, head_y + 9, (18, 14, 20, 255))
        # Ojos cian brillantes
        L.px(cx - 6, head_y + 5, P_LUCIAN_EYE)
        L.px(cx - 5, head_y + 5, (255, 255, 255, 255))
        L.px(cx + 5, head_y + 5, P_LUCIAN_EYE)
        L.px(cx + 6, head_y + 5, (255, 255, 255, 255))
        # Colmillos
        L.line([(cx - 5, head_y + 16), (cx - 5, head_y + 19)], Cl[HI], 2)
        L.line([(cx + 5, head_y + 16), (cx + 5, head_y + 19)], Cl[HI], 2)
    layers.append(L)

    # 4. Brazos y garras
    L = _L(w=72, h=72)
    if state == 'pounce':
        # Brazos extendidos hacia adelante en pleno salto
        _box(L, cx - 28, cy - 8, cx - 18, cy + 10, Fur)
        _box(L, cx + 18, cy - 8, cx + 28, cy + 10, Fur)
        for i in range(4):
            L.line([(cx - 26 + i * 2, cy + 10), (cx - 30 + i * 2, cy + 18)], Cl[HI], 2)
            L.line([(cx + 20 + i * 2, cy + 10), (cx + 24 + i * 2, cy + 18)], Cl[HI], 2)
    elif state == 'frenzy':
        # Doble zarpazo cruzado
        arm_sw = 6 if frame_idx in (1, 2) else -4
        _box(L, cx - 22, cy - 6 + arm_sw, cx - 12, cy + 12 + arm_sw, Fur)
        _box(L, cx + 12, cy - 6 - arm_sw, cx + 22, cy + 12 - arm_sw, Fur)
        for i in range(4):
            L.line([(cx - 20 + i * 2, cy + 12 + arm_sw), (cx - 28 + i * 2, cy + 20 + arm_sw)], Cl[HI], 2)
            L.line([(cx + 14 + i * 2, cy + 12 - arm_sw), (cx + 22 + i * 2, cy + 20 - arm_sw)], Cl[HI], 2)
    else:
        # Brazos estándar
        _box(L, cx - 24, cy - 2 + bob, cx - 16, cy + 14 + bob, Fur)
        _box(L, cx + 16, cy - 2 + bob, cx + 24, cy + 14 + bob, Fur)
        for i in range(3):
            L.px(cx - 22 + i * 2, cy + 15 + bob, Cl[HI])
            L.px(cx + 18 + i * 2, cy + 15 + bob, Cl[HI])
    layers.append(L)

    # 5. Efectos lunares / zarpazos
    if state == 'howl':
        fx = _L(noline=True, w=72, h=72)
        r = 14 + frame_idx * 5
        fx.arc((cx - r, cy - 20 - r // 2, cx + r, cy - 20 + r // 2), 0, 360, (120, 220, 255, 180), 2)
        layers.append(fx)
    elif state == 'frenzy' and frame_idx in (1, 2):
        fx = _L(noline=True, w=72, h=72)
        for y_off in (-8, 0, 8):
            fx.line([(cx - 26, cy + y_off), (cx + 26, cy + 12 + y_off)], (140, 230, 255, 220), 2)
            fx.line([(cx - 24, cy - 1 + y_off), (cx + 28, cy + 11 + y_off)], (255, 255, 255, 240), 1)
        layers.append(fx)

    img = create_canvas(72, 72)
    _draw_shadow(ImageDraw.Draw(img), cx, cy + 26, 20, 6)
    for lay in layers:
        img.alpha_composite(lay.im if lay.noline else _outline(lay.im))
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
    # 416x32 px: 13 casillas de 32x32 px
    props = create_canvas(416, 32)
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
    
    # 0: Antorcha
    ox = 0
    rect(d, ox + 13, 14, 6, 12, IRON_DARK, OUTLINE)
    d.point((ox + 15, 16), fill=IRON_LIGHT)
    rect(d, ox + 11, 10, 10, 4, IRON_DARK, OUTLINE)
    d.line([(ox + 12, 11), (ox + 19, 11)], fill=IRON_LIGHT)
    ellipse(d, ox + 9, 2, 14, 12, (255, 60, 20, 255), OUTLINE)
    ellipse(d, ox + 11, 4, 10, 9, (255, 165, 25, 255))
    ellipse(d, ox + 13, 6, 6, 6, (255, 245, 120, 255))
    d.point((ox + 15, 7), fill=(255, 255, 240, 255))
    
    # 1: Barril
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
    
    # 2: Cofre cerrado
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
    
    # 3: Pergamino de lore brillante
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
    
    # 4: Escaleras de descenso
    ox = 128
    rect(d, ox + 2, 2, 28, 28, (20, 18, 26, 255), OUTLINE)
    for st in range(5):
        sy = 5 + st * 5
        rect(d, ox + 4 + st, sy, 24 - st * 2, 4, (65 + st * 14, 70 + st * 14, 82 + st * 14, 255), OUTLINE)
        d.line([(ox + 5 + st, sy), (ox + 26 - st, sy)], fill=(110 + st * 14, 120 + st * 14, 135 + st * 14, 255))
        
    # 5: Caja de madera
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
    
    # 6: Estandarte
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
    
    # 7: Esqueleto
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
    
    # 8: Puerta
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

    # 9: Cofre abierto
    ox = 288
    ellipse(d, ox + 4, 23, 24, 7, (10, 10, 16, 120))
    rect(d, ox + 4, 13, 24, 13, WOOD_MID, OUTLINE)
    rect(d, ox + 6, 14, 20, 5, (25, 18, 14, 255))
    d.line([(ox + 5, 21), (ox + 26, 21)], fill=WOOD_LIGHT)
    rect(d, ox + 4, 13, 4, 13, IRON_DARK, OUTLINE)
    rect(d, ox + 24, 13, 4, 13, IRON_DARK, OUTLINE)
    d.line([(ox + 5, 14), (ox + 5, 24)], fill=IRON_LIGHT)
    d.line([(ox + 25, 14), (ox + 25, 24)], fill=IRON_LIGHT)
    rect(d, ox + 14, 15, 4, 5, GOLD_TRIM, OUTLINE)
    d.polygon([(ox + 4, 12), (ox + 8, 4), (ox + 24, 4), (ox + 27, 12)], fill=WOOD_MID, outline=OUTLINE)
    d.line([(ox + 9, 5), (ox + 23, 5)], fill=WOOD_LIGHT)
    rect(d, ox + 6, 6, 3, 6, IRON_DARK)
    rect(d, ox + 22, 6, 3, 6, IRON_DARK)

    # =========================================================================
    # NUEVOS PROPS DE BIBLIOTECA
    # =========================================================================

    # 10: Estante de libros (Bookshelf - ox = 320)
    ox = 320
    ellipse(d, ox + 2, 25, 28, 6, (10, 10, 16, 110))
    # Mueble de roble
    rect(d, ox + 2, 2, 28, 27, WOOD_DARK, OUTLINE)
    rect(d, ox + 4, 4, 24, 23, (40, 24, 15, 255))
    # Balda superior
    d.line([(ox + 3, 14), (ox + 28, 14)], fill=WOOD_MID, width=2)
    # Libros balda superior
    book_colors_top = [
        (185, 40, 40, 255), (60, 110, 200, 255), (45, 140, 60, 255),
        (225, 180, 50, 255), (140, 60, 160, 255), (200, 90, 40, 255)
    ]
    for i, col in enumerate(book_colors_top):
        bx = ox + 5 + i * 4
        h = 7 + (i % 3)
        rect(d, bx, 13 - h, 3, h, col, OUTLINE)
        d.point((bx + 1, 13 - h + 2), fill=GOLD_LIGHT)
    # Balda inferior
    d.line([(ox + 3, 26), (ox + 28, 26)], fill=WOOD_MID, width=2)
    # Libros balda inferior (inclinados y desordenados)
    book_colors_bot = [
        (60, 120, 180, 255), (210, 160, 40, 255), (170, 40, 40, 255),
        (120, 80, 50, 255), (80, 160, 100, 255)
    ]
    for i, col in enumerate(book_colors_bot):
        bx = ox + 5 + i * 4
        h = 8 + ((i * 2) % 3)
        rect(d, bx, 25 - h, 3, h, col, OUTLINE)
    # Libro inclinado al final
    d.line([(ox + 25, 19), (ox + 27, 25)], fill=(190, 50, 50, 255), width=2)

    # 11: Libros y hojas tiradas por el suelo (Scattered books - ox = 352)
    ox = 352
    ellipse(d, ox + 4, 18, 24, 9, (10, 10, 16, 90))
    # Hojas de papel sueltas en el piso
    rect(d, ox + 6, 16, 6, 7, (245, 235, 210, 255), OUTLINE)
    d.line([(ox + 8, 18), (ox + 10, 18)], fill=(120, 100, 80, 255))
    rect(d, ox + 19, 13, 7, 6, (235, 225, 195, 255), OUTLINE)
    # Libro abierto
    d.polygon([(ox + 10, 21), (ox + 16, 18), (ox + 22, 21), (ox + 22, 26), (ox + 16, 23), (ox + 10, 26)],
              fill=(245, 240, 220, 255), outline=OUTLINE)
    d.line([(ox + 16, 18), (ox + 16, 24)], fill=(80, 50, 30, 255), width=1) # Lomo central
    d.line([(ox + 11, 22), (ox + 15, 20)], fill=(100, 90, 80, 255))
    d.line([(ox + 17, 20), (ox + 21, 22)], fill=(100, 90, 80, 255))
    # Libro cerrado con cuero rojo tirado
    d.polygon([(ox + 3, 10), (ox + 10, 7), (ox + 14, 12), (ox + 7, 15)],
              fill=(175, 45, 45, 255), outline=OUTLINE)
    d.point((ox + 8, 11), fill=GOLD_LIGHT)
    # Libro azul cerrado
    rect(d, ox + 22, 20, 8, 4, (45, 85, 155, 255), OUTLINE)
    d.line([(ox + 22, 21), (ox + 29, 21)], fill=GOLD_LIGHT)

    # 12: Mesa / Escritorio de roble (Study Desk - ox = 384)
    ox = 384
    # Sombras bajo las 4 patas
    ellipse(d, ox + 4, 25, 6, 3, (10, 10, 16, 120))
    ellipse(d, ox + 22, 25, 6, 3, (10, 10, 16, 120))
    # Patas de madera
    rect(d, ox + 5, 14, 4, 12, WOOD_DARK, OUTLINE)
    rect(d, ox + 23, 14, 4, 12, WOOD_DARK, OUTLINE)
    d.line([(ox + 6, 15), (ox + 6, 25)], fill=WOOD_MID)
    d.line([(ox + 24, 15), (ox + 24, 25)], fill=WOOD_MID)
    # Travesaño entre patas
    d.line([(ox + 8, 21), (ox + 23, 21)], fill=WOOD_DARK, width=2)
    # Tablero grueso con bisel de luz superior
    rect(d, ox + 2, 7, 28, 8, WOOD_MID, OUTLINE)
    d.line([(ox + 3, 8), (ox + 28, 8)], fill=WOOD_LIGHT, width=2) # Brillo del tablero
    d.line([(ox + 3, 14), (ox + 28, 14)], fill=WOOD_DARK, width=1) # Borde inferior
    # Tintero de vidrio y pluma sobre la mesa (esquina derecha)
    rect(d, ox + 24, 5, 3, 3, (25, 25, 35, 255), OUTLINE)
    d.line([(ox + 25, 5), (ox + 28, 1)], fill=(245, 245, 255, 255), width=1) # Pluma de ave
    d.point((ox + 28, 1), fill=GOLD_LIGHT)
    
    props.save(os.path.join(ASSETS_DIR, 'props.png'))
    print("Creado: props.png con Estanterias (320), Libros (352) y Mesa (384)")
# ==============================================================================
# HOJA DE ICONOS (24 ICONOS)
# ==============================================================================

def _icon_sword(look):
    L = _L(size=24)
    _blade(L, (6, 18), (20, 4), P_STEEL, look)
    return [_blade_fx((6, 18), (20, 4), look, 24), L]

def _icon_bow(look):
    L = _L(size=24)
    fx = _L(noline=True, size=24)
    W = [P_WOOD, P_OBSID, P_GOLD][look]
    string = [(236, 230, 204, 255), (255, 96, 120, 255), (190, 246, 255, 255)][look]
    glow = [None, (255, 70, 110), (140, 225, 255)][look]
    a_shaft = [P_WOOD[LT], P_OBSID[LT], P_GOLD[LT]][look]
    a_head = [P_STEEL[HI], P_LAVA[MD], P_AQUA[HI]][look]
    a_fl = [P_RED[MD], P_PURPLE[DK], P_WHITE[HI]][look]
    box = (7, 2, 19, 22)
    L.arc(box, 90, 270, W[MD], 2)
    L.arc((8, 2, 20, 22), 90, 270, W[LT], 1)
    L.line([(13, 2), (17, 12), (13, 22)], string, 1)
    L.line([(4, 12), (17, 12)], a_shaft, 1)
    L.poly([(1, 12), (5, 10), (5, 14)], a_head)
    L.px(15, 11, a_fl); L.px(16, 11, a_fl); L.px(15, 13, a_fl); L.px(16, 13, a_fl)
    if look == 1:
        L.line([(13, 2), (11, 0)], P_OBSID[LT]); L.line([(13, 22), (11, 23)], P_OBSID[LT])
        L.px(13, 2, P_LAVA[HI]); L.px(13, 22, P_LAVA[HI])
    if look == 2:
        L.poly([(9, 5), (4, 2), (5, 7)], P_WHITE[LT])
        L.poly([(9, 19), (4, 22), (5, 17)], P_WHITE[LT])
        L.px(13, 2, P_WHITE[HI]); L.px(13, 22, P_WHITE[HI])
    if glow:
        fx.arc(box, 90, 270, glow + (60,), 6)
    return [fx, L]

def _icon_staff(look):
    L = _L(size=24)
    fx = _L(noline=True, size=24)
    tx, ty = 17, 8
    if look == 0:
        L.line([(4, 21), (tx, ty)], P_WOOD[MD], 2)
        L.line([(3, 21), (tx - 1, ty)], P_WOOD[LT], 1)
        L.px(tx + 1, ty + 2, P_GOLD[MD]); L.px(tx - 1, ty + 3, P_GOLD[MD])
        _ball(L, tx - 3, ty - 4, tx + 3, ty + 2, P_ORB)
        gcol = (255, 190, 90)
    elif look == 1:
        L.line([(4, 21), (tx, ty)], P_OBSID[MD], 2)
        L.line([(3, 21), (tx - 1, ty)], P_OBSID[LT], 1)
        for i in (6, 11, 16):
            L.px(4 + int((tx - 4) * i / 17.0) + 1, 21 - int(13 * i / 17.0), P_CRIMSON[MD])
        for sg in (-1, 1):
            L.line([(tx, ty + 3), (tx + sg * 4, ty), (tx + sg * 3, ty - 5)], P_OBSID[MD], 1)
        _ball(L, tx - 3, ty - 4, tx + 3, ty + 2, P_VOID)
        gcol = (190, 80, 255)
    else:
        L.line([(4, 21), (tx, ty)], P_GOLD[MD], 2)
        L.line([(3, 21), (tx - 1, ty)], P_GOLD[LT], 1)
        for sg in (-1, 1):
            L.poly([(tx, ty + 2), (tx + sg * 6, ty - 1), (tx + sg * 5, ty - 4), (tx + sg * 3, ty - 2)], P_WHITE[LT])
        _ball(L, tx - 3, ty - 4, tx + 3, ty + 2, P_HOLYORB)
        gcol = (130, 225, 255)
    fx.ell(tx - 7, ty - 8, tx + 7, ty + 6, gcol + (46,))
    return [fx, L]

def _icon_plate(look):
    S = [P_STEEL, P_OBSID, P_PALADIN][look]
    G = [P_GOLD, P_CRIMSON, P_GOLD][look]
    L = _L(size=24)
    L.poly([(7, 5), (17, 5), (19, 10), (17, 21), (7, 21), (5, 10)], S[MD])
    L.line([(7, 5), (5, 10)], S[LT]); L.line([(8, 6), (8, 19)], S[LT])
    L.line([(17, 5), (19, 10), (17, 21)], S[DK])
    L.line([(12, 6), (12, 15)], S[HI]); L.line([(13, 6), (13, 15)], S[DK])
    L.rect(7, 16, 17, 18, G[MD]); L.line([(7, 16), (17, 16)], G[LT]); L.rect(11, 16, 13, 18, G[HI])
    L.rect(9, 3, 15, 5, S[DK])
    _ball(L, 1, 3, 8, 9, S); _ball(L, 16, 3, 23, 9, S)
    if look == 1:
        for pts in ([(2, 4), (1, 0), (6, 3)], [(21, 4), (22, 0), (17, 3)]):
            L.poly(pts, P_OBSID[LT]); L.px(pts[1][0], pts[1][1], P_LAVA[MD])
        L.px(12, 9, P_LAVA[MD]); L.px(13, 10, P_LAVA[MD]); L.px(12, 11, P_LAVA[LT])
    if look == 2:
        L.rect(11, 8, 13, 10, P_AQUA[MD]); L.px(11, 8, P_AQUA[HI])
        L.poly([(5, 2), (0, 0), (2, 4)], P_WHITE[LT]); L.poly([(19, 2), (23, 0), (21, 4)], P_WHITE[LT])
    return [L]

def _icon_leather(look):
    T = [P_LEATHER, P_BLACKLEATHER, P_GOLDLEATHER][look]
    G = [P_GREEN, P_NIGHT, P_ELVEN][look]
    tr = [P_GOLD, P_CRIMSON, P_GOLD][look]
    L = _L(size=24)
    L.poly([(7, 8), (17, 8), (18, 21), (6, 21)], T[MD])
    L.line([(7, 8), (6, 21)], T[LT]); L.line([(17, 8), (18, 21)], T[DK])
    L.line([(9, 10), (15, 19)], T[DP]); L.line([(15, 10), (9, 19)], T[DK])
    L.rect(6, 16, 18, 17, T[DP]); L.rect(11, 16, 13, 17, tr[MD]); L.px(11, 16, tr[HI])
    L.poly([(4, 4), (20, 4), (21, 10), (12, 14), (3, 10)], G[MD])
    L.line([(4, 4), (20, 4)], G[LT]); L.line([(3, 10), (12, 14), (21, 10)], G[DK])
    if look == 1:
        for pts in ([(5, 5), (2, 0), (8, 4)], [(19, 5), (22, 0), (16, 4)]):
            L.poly(pts, P_NIGHT[LT]); L.px(pts[1][0], pts[1][1], P_CRIMSON[MD])
    if look == 2:
        L.poly([(16, 4), (22, 0), (23, 4), (19, 6)], P_WHITE[LT]); L.line([(16, 4), (23, 4)], P_GOLD[MD])
    return [L]

def _icon_robe(look):
    M = [P_PURPLE, P_NIGHTROBE, P_CELESTE][look]
    G = [P_GOLD, P_CRIMSON, P_GOLD][look]
    L = _L(size=24)
    L.poly([(9, 4), (15, 4), (21, 21), (3, 21)], M[MD])
    L.line([(9, 4), (3, 21)], M[LT]); L.line([(15, 4), (21, 21)], M[DK])
    L.poly([(9, 7), (3, 9), (1, 16), (6, 15)], M[MD]); L.poly([(15, 7), (21, 9), (23, 16), (18, 15)], M[MD])
    L.line([(1, 16), (6, 15)], G[MD]); L.line([(23, 16), (18, 15)], G[MD])
    L.rect(3, 19, 21, 21, G[MD]); L.line([(3, 19), (21, 19)], G[LT])
    L.rect(8, 12, 16, 13, G[MD]); L.px(12, 12, G[HI])
    _ball(L, 8, 1, 16, 8, M)
    if look == 1:
        for pts in ([(8, 3), (5, 0), (10, 2)], [(16, 3), (19, 0), (14, 2)]):
            L.poly(pts, P_BONE2[LT]); L.px(pts[1][0], pts[1][1], P_CRIMSON[MD])
    if look == 2:
        for x, y in ((8, 16), (16, 17), (12, 18), (12, 5)):
            L.px(x, y, P_GOLD[HI])
    return [L]

ICON_BUILDERS = [
    lambda: _icon_sword(0), lambda: _icon_sword(1), lambda: _icon_bow(0), lambda: _icon_staff(0),
    lambda: _icon_plate(0), lambda: _icon_robe(0), None, None, None, None,
    lambda: _icon_sword(2), lambda: _icon_bow(1), lambda: _icon_bow(2), lambda: _icon_staff(1),
    lambda: _icon_staff(2), lambda: _icon_plate(1), lambda: _icon_plate(2), lambda: _icon_leather(0),
    lambda: _icon_leather(1), lambda: _icon_leather(2), lambda: _icon_robe(1), lambda: _icon_robe(2),
]

def generate_icons():
    n = len(ICON_BUILDERS)
    icons = create_canvas(24 * n, 24)
    d = ImageDraw.Draw(icons)
    for i, builder in enumerate(ICON_BUILDERS):
        if builder is None:
            continue
        cell = Image.new('RGBA', (24, 24), (0, 0, 0, 0))
        for L in builder():
            cell.alpha_composite(L.im if L.noline else _outline(L.im))
        icons.alpha_composite(cell, (i * 24, 0))

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
    print(f"Creado: icons.png ({n} iconos 24x24)")

# ==============================================================================
# BUCLE PRINCIPAL DE CONSTRUCCIÓN
# ==============================================================================

def build_all_spritesheets():
    print("Generando spritesheets...")
    
    # 1. Jugadores: 9 combinaciones por clase (3 armas x 3 armaduras)
    classes = [
        ('warrior', draw_warrior_frame),
        ('archer', draw_archer_frame),
        ('mage', draw_mage_frame),
    ]
    for cls, drawer in classes:
        for wl in range(3):
            for ak in range(3):
                sheet = create_canvas(48 * 7, 48 * 4)
                for direction in range(4):
                    for frame in range(4):
                        f_img = drawer(direction, frame, is_attack=False, wl=wl, ak=ak)
                        sheet.paste(f_img, (frame * 48, direction * 48))
                    for atk in range(3):
                        f_img = drawer(direction, atk, is_attack=True, wl=wl, ak=ak)
                        sheet.paste(f_img, ((4 + atk) * 48, direction * 48))
                sheet.save(os.path.join(ASSETS_DIR, f'player_{cls}_w{wl}_a{ak}.png'))
                if wl == 0 and ak == 0:
                    sheet.save(os.path.join(ASSETS_DIR, f'player_{cls}.png'))
        print(f"Creado: player_{cls}_w*_a*.png (9 combinaciones)")

    # 2. Enemigos 48x48
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
        
    # 3. Araña 48x48
    spider_sheet = create_canvas(48 * 4, 48 * 4)
    for direction in range(4):
        for frame in range(4):
            f_img = draw_spider_frame(direction, frame)
            spider_sheet.paste(f_img, (frame * 48, direction * 48))
    spider_sheet.save(os.path.join(ASSETS_DIR, 'enemy_spider.png'))
    print("Creado: enemy_spider.png")
    
    # 4. Enemigos Grandes 56x56
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
        
    # 5. Sub-Jefe Abracadabra 72x72
    abra_sheet = create_canvas(72 * 4, 72 * 4)
    states = ['walk', 'swell', 'vomit', 'charge']
    for row, state in enumerate(states):
        for frame in range(4):
            f_img = draw_abracadabra_frame(state, frame)
            abra_sheet.paste(f_img, (frame * 72, row * 72))
    abra_sheet.save(os.path.join(ASSETS_DIR, 'boss_abracadabra.png'))
    print("Creado: boss_abracadabra.png")
    
    # 6. Jefe Final Hong 96x96
    hong_sheet = create_canvas(96 * 4, 96 * 2)
    for frame in range(4):
        f_img = draw_hong_frame(frame, is_cleave=False)
        hong_sheet.paste(f_img, (frame * 96, 0))
        f_atk = draw_hong_frame(frame, is_cleave=True)
        hong_sheet.paste(f_atk, (frame * 96, 96))
    hong_sheet.save(os.path.join(ASSETS_DIR, 'boss_hong.png'))
    print("Creado: boss_hong.png")

    # Sub-Jefe Lucian 72x72
    lucian_sheet = create_canvas(72 * 4, 72 * 4)
    lucian_states = ['stalk', 'howl', 'pounce', 'frenzy']
    for row, state in enumerate(lucian_states):
        for frame in range(4):
            f_img = draw_lucian_frame(state, frame)
            lucian_sheet.paste(f_img, (frame * 72, row * 72))
    lucian_sheet.save(os.path.join(ASSETS_DIR, 'boss_lucian.png'))
    print("Creado: boss_lucian.png")
    
    # 7. Tilesets, Utilería e Iconos
    generate_tiles()
    generate_props()
    generate_icons()
    print("Generación completada con éxito.")

if __name__ == '__main__':
    build_all_spritesheets()