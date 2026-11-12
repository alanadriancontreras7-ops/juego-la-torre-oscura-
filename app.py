"""
Servidor Flask para 'La Torre Oscura' (The Dark Tower)
Maneja la API REST para persistencia en SQLite, cuentas de usuario,
progreso victorioso por clase, lore y salón de la fama.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, PlayerSave, HallOfFame, LoreNote

app = Flask(__name__)

# Configuración de Sesiones y Base de Datos
app.secret_key = os.getenv('SECRET_KEY', 'torre_oscura_secret_key_super_segura_2026')
db_path = os.path.join(os.path.dirname(__file__), 'dark_tower.db')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# ==============================================================================
# MODELO DE USUARIO (INICIO DE SESIÓN Y HÉROES VENCEDORES)
# ==============================================================================
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    # Guarda un JSON con el inventario/stats de cada clase que derrotó a Hong:
    # {"warrior": {...}, "archer": null, "mage": null}
    cleared_heroes = db.Column(db.Text, default='{}')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# ==============================================================================
# TEXTOS Y PERGAMINOS DE LORE
# ==============================================================================
LORE_DATA = [
    {
        "floor": 1,
        "title": "EL NACE DE LAS LLAMAS SOMBRÍAS",
        "author": "Antiguos Escritos del Guardián",
        "content": (
            "Antes de que la Torre fuera erigida, existía un ente engendrado en el corazón "
            "de las llamas sombras: el Señor Oscuro. No es un simple demonio, sino una fuerza "
            "primordial de fuego negro y penumbra absoluta. Tan inmenso es su poder que incluso "
            "los Dioses del Panteón libraron guerras contra él y fracasaron en destruirlo, "
            "logrando únicamente sellar su esencia en las profundidades de este abismo."
        ),
        "combat_tip": "Aprovecha los primeros pisos para subir de nivel y familiarizarte con los ataques básicos."
    },
    {
        "floor": 2,
        "title": "Inscripciones en el Osario - Entrada II",
        "author": "Hermano Anselmo",
        "content": "Los huesos de quienes perecieron en la conquista no descansan. Un resplandor carmesí brota de las cuencas de los cráneos. La torre anima a los muertos con una fuerza telúrica insidiosa.",
        "combat_tip": "Consejo: Los esqueletos son resistentes a las estocadas cortas. Utiliza ataques pesados o magia ignea para pulverizar sus vértebras."
    },
    {
        "floor": 3,
        "title": "Nota Pegajosa en una Telaraña - Entrada III",
        "author": "Explorador Varek",
        "content": "El silencio aquí solo se rompe por el chasquido de mandíbulas en el techo. Las arañas son del tamaño de sabuesos de guerra, con abdómenes henchidos de icor ponzoñoso.",
        "combat_tip": "Consejo: Las arañas atacan en ráfagas rápidas y escupen toxina. Evita pisar los charcos de veneno y mantente en constante movimiento."
    },
    {
        "floor": 4,
        "title": "Despacho de Guerra - Entrada IV",
        "author": "Mercenario Gareth",
        "content": "Las criptas terminan aquí. Más arriba la piedra se calienta y brotan vapores sulfurosos. Los bandidos supervivientes han sucumbido a la locura total y blanden armas empapadas en veneno.",
        "combat_tip": "Consejo: En este piso los enemigos patrullan en parejas. Atrae a uno a la vez hacia los pasillos estrechos."
    },
    {
        "floor": 5,
        "title": "Códice de la Bestia Ancestral: Lucian",
        "author": "Cazador Imperial Brand",
        "content": "En las profundidades de las Fauces de Azufre no habita un lobo ordinario, sino su patriarca: Lucian, el primer hombre lobo creado por el señor oscuro. Su pelaje no es cenizo sino de un blanco espectral, y su tamaño empequeñece a cualquier bestia conocida. Sus aullidos resuenan por la roca viva con una furia gélida.",
        "combat_tip": "¡ALERTA DE SUB-JEFE!: Lucian es mucho más rápido y agresivo que cualquier enemigo normal. Cuando eche su cabeza hacia atrás para aullar, prepárate: desatará una onda de choque y luego una embestida con garras salvajes. Atácalo tras esquivar su salto mortal."
    },
    {
        "floor": 6,
        "title": "Piel Marcada con Garras - Entrada VI",
        "author": "Cazador Brand",
        "content": "Hombres lobo... Bestias musculosas cubiertas de pelaje cenizo y ojos amarillos hambrientos. No temen al dolor ni a las espadas comunes solo a su progenitor lucian. Atacan con una furia desquiciada.",
        "combat_tip": "Consejo: Cuando el Hombre Lobo flexione sus patas traseras para abalanzarse, rueda hacia un lado. Sus zarpazos dejan una breve ventana de vulnerabilidad."
    },
    {
        "floor": 7,
        "title": "LOS CELOS DE HONG - PARTE I",
        "author": "Crónicas de las Fauces",
        "content": (
            "Hong era una joven muchacha consumida por un amor no correspondido. "
            "Amaba profundamente a un chico de su aldea, pero él ya estaba entregado a otra: "
            "su propia prima. Los celos carcomieron el corazón de Hong día y noche hasta "
            "que la envidia se transformó en odio puro. Desesperada por eliminar a su rival, "
            "Hong buscó las artes prohibidas y pactó con el Señor Oscuro. A cambio de su alma, "
            "recibió un poder demoníaco aberrante que la deformó por completo, convirtiéndola "
            "en una bestia voraz lista para reclamar lo que creía suyo."
        ),
        "combat_tip": "Prepárate para enfrentar enemigos de gran movilidad antes de ascender a los pisos de los jefes."
    },
    {
        "floor": 8,
        "title": "EL TRÁGICO DESTINO DE SAMIRIA",
        "author": "Crónicas de la Rotonda Virulenta",
        "content": (
            "Antes de convertirse en la abominación conocida como Abracadabra, "
            "fue una joven llamada Samiria. Inocente y confiada, fue engañada y "
            "utilizada por un muchacho solo para saciar sus placeres carnales. Una vez "
            "que él satisfizo sus deseos, la desechó cruelmente sin piedad ni remordimiento. "
            "El dolor, la vergüenza y el despecho corrompieron el espíritu de Samiria, "
            "llevándola a buscar refugio en la magia negra de la Torre Oscura, donde su amargura "
            "y veneno interno la mutaron en este ser purulento y vengativo."
        ),
        "combat_tip": "Mantén la distancia contra Abracadabra cuando empiece a hincharse y evita sus charcos de ácido a toda costa."
    },
    {
        "floor": 9,
        "title": "EL ARTE DEL ENGAÑO",
        "author": "Pergamino de las Almas Perdidas",
        "content": (
            "Imposibilitado para destruir el mundo con su propia fuerza mientras permanece "
            "sellado, el Señor Oscuro perfeccionó el arte de la manipulación. Conoce las "
            "debilidades, los celos y los vacíos del corazón humano. Busca a aquellos con "
            "espíritus quebrantados o ambiciosos que le sean de utilidad, ofreciéndoles falso "
            "poder y consuelo a cambio de sus almas, convirtiéndolos en peones para alimentar su liberación."
        ),
        "combat_tip": "Atento a los enemigos a distancia; elimina primero a los tiradores antes de enfrentarte al cuerpo a cuerpo."
    },
    {
        "floor": 10,
        "title": "LA MALDICIÓN DE HONG - PARTE II",
        "author": "Registros de la Cúspide",
        "content": (
            "Empoderada por el pacto demoníaco, Hong atacó a su prima para arrebatarle la vida. "
            "Sin embargo, el joven al que amaba intervino valientemente y se interpuso en el ataque, "
            "logrando detener el golpe fatal. Enfurecida por el rechazo y fuera de sí, Hong "
            "secuestró a su prima y huyó hacia lo más alto de La Torre Oscura. Ahora, recluida "
            "en la cúspide abisal, custodia su trofeo mientras aguarda a cualquiera que ose "
            "desafiar su insaciable sed de venganza."
        ),
        "combat_tip": "Atento a los barridos de gran alcance de Hong; esquiva lateralmente y ataca durante sus pausas de recuperación."
    }
]

def init_db():
    with app.app_context():
        db.create_all()
        for lore in LORE_DATA:
            existing = LoreNote.query.filter_by(floor=lore['floor']).first()
            if existing:
                existing.title = lore['title']
                existing.author = lore['author']
                existing.content = lore['content']
                existing.combat_tip = lore['combat_tip']
            else:
                new_lore = LoreNote(
                    floor=lore['floor'],
                    title=lore['title'],
                    author=lore['author'],
                    content=lore['content'],
                    combat_tip=lore['combat_tip']
                )
                db.session.add(new_lore)
        db.session.commit()

@app.route('/')
def index():
    return render_template('index.html')

# ==============================================================================
# API REST: AUTENTICACIÓN, SESIONES Y USUARIOS
# ==============================================================================

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'success': False, 'message': 'Usuario y contraseña requeridos'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Ese nombre de usuario ya existe'}), 400

    user = User(
        username=username,
        password_hash=generate_password_hash(password),
        cleared_heroes=json.dumps({})
    )
    db.session.add(user)
    db.session.commit()

    session['user_id'] = user.id
    return jsonify({'success': True, 'username': user.username, 'cleared_heroes': {}})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Usuario o contraseña incorrectos'}), 401

    session['user_id'] = user.id
    cleared = json.loads(user.cleared_heroes or '{}')
    return jsonify({'success': True, 'username': user.username, 'cleared_heroes': cleared})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True})

@app.route('/api/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'logged_in': False})

    user = User.query.get(user_id)
    if not user:
        session.pop('user_id', None)
        return jsonify({'logged_in': False})

    cleared = json.loads(user.cleared_heroes or '{}')
    return jsonify({
        'logged_in': True,
        'username': user.username,
        'cleared_heroes': cleared
    })

# ==============================================================================
# API REST: GUARDAR PROGRESO VICTORIOSO POR CLASE (POST-HONG)
# ==============================================================================

@app.route('/api/record_victory', methods=['POST'])
def record_victory():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Inicia sesión para guardar tu héroe victorioso'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404

    data = request.get_json() or {}
    hero_class = data.get('character_class')
    if not hero_class:
        return jsonify({'success': False, 'message': 'Clase no especificada'}), 400

    cleared = json.loads(user.cleared_heroes or '{}')

    # Guardar exactamente las estadísticas, nivel, equipo e inventario del héroe victorioso
    cleared[hero_class] = {
        'level': data.get('level', 1),
        'hp': data.get('hp'),
        'max_hp': data.get('max_hp'),
        'mp': data.get('mp'),
        'max_mp': data.get('max_mp'),
        'strength': data.get('strength'),
        'dexterity': data.get('dexterity'),
        'magic': data.get('magic'),
        'constitution': data.get('constitution'),
        'gold': data.get('gold', 0),
        'equipment': data.get('equipment', {}),
        'inventory': data.get('inventory', [])
    }

    user.cleared_heroes = json.dumps(cleared)
    db.session.commit()

    return jsonify({'success': True, 'cleared_heroes': cleared})

# ==============================================================================
# API REST: PARTIDAS GUARDADAS (SLOTS 1, 2, 3)
# ==============================================================================

@app.route('/api/saves', methods=['GET'])
@app.route('/api/save', methods=['GET', 'POST'])
def handle_saves():
    if request.method == 'GET':
        saves = PlayerSave.query.order_by(PlayerSave.slot).all()
        return jsonify([s.to_dict() for s in saves])
        
    data = request.json or {}
    slot = data.get('slot', 1)
    
    save = PlayerSave.query.filter_by(slot=slot).first()
    if not save:
        save = PlayerSave(slot=slot)
        db.session.add(save)
        
    save.player_name = data.get('player_name', save.player_name)
    save.character_class = data.get('character_class', save.character_class)
    save.level = data.get('level', save.level)
    save.exp = data.get('exp', save.exp)
    save.next_exp = data.get('next_exp', save.next_exp)
    save.hp = data.get('hp', save.hp)
    save.max_hp = data.get('max_hp', save.max_hp)
    save.mp = data.get('mp', save.mp)
    save.max_mp = data.get('max_mp', save.max_mp)
    save.strength = data.get('strength', save.strength)
    save.dexterity = data.get('dexterity', save.dexterity)
    save.magic = data.get('magic', save.magic)
    save.constitution = data.get('constitution', save.constitution)
    save.attribute_points = data.get('attribute_points', save.attribute_points)
    save.floor_reached = data.get('floor_reached', save.floor_reached)
    save.gold = data.get('gold', save.gold)
    save.inventory_json = json.dumps(data.get('inventory', []))
    save.equipment_json = json.dumps(data.get('equipment', {}))
    save.lore_unlocked_json = json.dumps(data.get('lore_unlocked', []))
    save.enemies_killed = data.get('enemies_killed', save.enemies_killed)
    save.playtime_seconds = data.get('playtime_seconds', save.playtime_seconds)
    save.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({"success": True, "save": save.to_dict()})

@app.route('/api/save/<int:slot>', methods=['GET', 'DELETE'])
def handle_single_save(slot):
    save = PlayerSave.query.filter_by(slot=slot).first()
    if request.method == 'DELETE':
        if save:
            db.session.delete(save)
            db.session.commit()
            return jsonify({"success": True})
        return jsonify({"error": "Partida no encontrada"}), 404

    if not save:
        return jsonify({"error": "Partida no encontrada"}), 404
    return jsonify(save.to_dict())

# ==============================================================================
# API REST: LORE Y NOTAS
# ==============================================================================

@app.route('/api/lore/<int:floor>', methods=['GET'])
def get_lore(floor):
    lore = LoreNote.query.filter_by(floor=floor).first()
    if lore:
        return jsonify(lore.to_dict())
    return jsonify({"error": "Nota no encontrada"}), 404

# ==============================================================================
# API REST: SALÓN DE LA FAMA
# ==============================================================================

@app.route('/api/hall_of_fame', methods=['GET'])
def get_hall_of_fame():
    records = HallOfFame.query.order_by(
        HallOfFame.floor_reached.desc(),
        HallOfFame.enemies_killed.desc(),
        HallOfFame.gold.desc()
    ).limit(20).all()
    return jsonify([r.to_dict() for r in records])

@app.route('/api/hall_of_fame', methods=['POST'])
def add_hall_of_fame():
    data = request.json or {}
    record = HallOfFame(
        player_name=data.get('player_name', 'Héroe Desconocido'),
        character_class=data.get('character_class', 'warrior'),
        floor_reached=data.get('floor_reached', 1),
        level=data.get('level', 1),
        enemies_killed=data.get('enemies_killed', 0),
        gold=data.get('gold', 0),
        playtime_seconds=data.get('playtime_seconds', 0),
        outcome=data.get('outcome', 'DEFEAT')
    )
    db.session.add(record)
    db.session.commit()
    return jsonify({"success": True, "record": record.to_dict()})

if __name__ == '__main__':
    init_db()
    port = int(os.getenv('PORT', 5000))
    print(f"Servidor 'La Torre Oscura' iniciando en http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)