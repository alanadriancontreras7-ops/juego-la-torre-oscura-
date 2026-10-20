"""
Modelos de Datos y ORM para 'La Torre Oscura'
Soporta SQLite y fácil migración a PostgreSQL mediante DATABASE_URL.
"""

from datetime import datetime
import json
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class PlayerSave(db.Model):
    __tablename__ = 'player_saves'
    
    id = db.Column(db.Integer, primary_key=True)
    slot = db.Column(db.Integer, unique=True, nullable=False, index=True)
    player_name = db.Column(db.String(64), nullable=False, default="Aventurero")
    character_class = db.Column(db.String(32), nullable=False, default="warrior")
    level = db.Column(db.Integer, default=1)
    exp = db.Column(db.Integer, default=0)
    next_exp = db.Column(db.Integer, default=100)
    hp = db.Column(db.Integer, default=120)
    max_hp = db.Column(db.Integer, default=120)
    mp = db.Column(db.Integer, default=40)
    max_mp = db.Column(db.Integer, default=40)
    strength = db.Column(db.Integer, default=12)
    dexterity = db.Column(db.Integer, default=8)
    magic = db.Column(db.Integer, default=6)
    constitution = db.Column(db.Integer, default=14)
    attribute_points = db.Column(db.Integer, default=0)
    floor_reached = db.Column(db.Integer, default=1)
    gold = db.Column(db.Integer, default=50)
    inventory_json = db.Column(db.Text, default="[]")
    equipment_json = db.Column(db.Text, default="{}")
    lore_unlocked_json = db.Column(db.Text, default="[]")
    enemies_killed = db.Column(db.Integer, default=0)
    playtime_seconds = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "slot": self.slot,
            "player_name": self.player_name,
            "character_class": self.character_class,
            "level": self.level,
            "exp": self.exp,
            "next_exp": self.next_exp,
            "hp": self.hp,
            "max_hp": self.max_hp,
            "mp": self.mp,
            "max_mp": self.max_mp,
            "strength": self.strength,
            "dexterity": self.dexterity,
            "magic": self.magic,
            "constitution": self.constitution,
            "attribute_points": self.attribute_points,
            "floor_reached": self.floor_reached,
            "gold": self.gold,
            "inventory": json.loads(self.inventory_json) if self.inventory_json else [],
            "equipment": json.loads(self.equipment_json) if self.equipment_json else {},
            "lore_unlocked": json.loads(self.lore_unlocked_json) if self.lore_unlocked_json else [],
            "enemies_killed": self.enemies_killed,
            "playtime_seconds": self.playtime_seconds,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class HallOfFame(db.Model):
    __tablename__ = 'hall_of_fame'
    
    id = db.Column(db.Integer, primary_key=True)
    player_name = db.Column(db.String(64), nullable=False)
    character_class = db.Column(db.String(32), nullable=False)
    floor_reached = db.Column(db.Integer, default=1)
    level = db.Column(db.Integer, default=1)
    enemies_killed = db.Column(db.Integer, default=0)
    gold = db.Column(db.Integer, default=0)
    playtime_seconds = db.Column(db.Integer, default=0)
    outcome = db.Column(db.String(16), default="DEFEAT") # 'VICTORY' o 'DEFEAT'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "player_name": self.player_name,
            "character_class": self.character_class,
            "floor_reached": self.floor_reached,
            "level": self.level,
            "enemies_killed": self.enemies_killed,
            "gold": self.gold,
            "playtime_seconds": self.playtime_seconds,
            "outcome": self.outcome,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at else ""
        }

class LoreNote(db.Model):
    __tablename__ = 'lore_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    floor = db.Column(db.Integer, unique=True, nullable=False, index=True)
    title = db.Column(db.String(128), nullable=False)
    author = db.Column(db.String(64), default="Anónimo")
    content = db.Column(db.Text, nullable=False)
    combat_tip = db.Column(db.Text, nullable=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "floor": self.floor,
            "title": self.title,
            "author": self.author,
            "content": self.content,
            "combat_tip": self.combat_tip
        }
