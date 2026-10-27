"""
Servidor Flask para 'La Torre Oscura' (The Dark Tower)
Maneja la API REST para persistencia en SQLite/PostgreSQL, lore y salón de la fama.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from models import db, PlayerSave, HallOfFame, LoreNote

app = Flask(__name__)

# Configuración de Base de Datos
db_path = os.path.join(os.path.dirname(__file__), 'dark_tower.db')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

LORE_DATA = [
    {
        "floor": 1,
        "title": "Diario del Centinela Caído - Entrada I",
        "author": "Capitán Roderick",
        "content": "Hemos cruzado el umbral de La Torre Oscura. La atmósfera pesa como plomo y las criptas inferiores huelen a muerte antigua. Bandidos armados con dagas melladas han tomado las antecámaras. No son hombres cuerdos; sus ojos vacíos miran al abismo.",
        "combat_tip": "Consejo: Los bandidos son rápidos pero carecen de armadura pesada. Bloquea o retrocede tras sus golpes para contraatacar con seguridad."
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
        "content": "En las profundidades de las Fauces de Azufre no habita una manada ordinaria, sino su patriarca: Lucian, el primer hombre lobo engendrado por la Torre Oscura. Su pelaje no es cenizo sino de un blanco espectral, y su tamaño empequeñece a cualquier bestia conocida. Sus aullidos resuenan por la roca viva con una furia gélida.",
        "combat_tip": "¡ALERTA DE SUB-JEFE!: Lucian es mucho más rápido y agresivo que cualquier enemigo normal. Cuando eche su cabeza hacia atrás para aullar, prepárate: desatará una onda de choque y luego una embestida con garras salvajes. Atácalo tras esquivar su salto mortal."
    },

    {
        "floor": 6,
        "title": "Piel Marcada con Garras - Entrada VI",
        "author": "Cazador Brand",
        "content": "Hombres lobo... Bestias musculosas cubiertas de pelaje cenizo y ojos amarillos hambrientos. No temen al dolor ni a las espadas comunes. Atacan con una furia desquiciada.",
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
        "title": "Fragmento del Abismo - Entrada IX",
        "author": "Último Paladín",
        "content": "El aire es gélido y el cielo se rasga en una tormenta eterna. La Cúspide de la Torre flota sobre el vacío cósmico. Las estrellas parecen apagarse ante la mirada del Gran Ojo ardiente. Hong reina más arriba.",
        "combat_tip": "Consejo: Las runas astrales del suelo aumentan tu velocidad si las pisas. Aprovéchalas para sortear a los demonios guardianes."
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
        # Insertar o actualizar notas de lore
        for lore in LORE_DATA:
            existing = LoreNote.query.filter_by(floor=lore['floor']).first()
            if existing:
                # Sobreescribir con el texto actualizado
                existing.title = lore['title']
                existing.author = lore['author']
                existing.content = lore['content']
                existing.combat_tip = lore['combat_tip']
            else:
                # Crear nuevo registro si no existía
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
    # GET
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
