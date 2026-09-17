Item.create({
    "name": "Gulping Bite",
    "type": "weapon",
    "system": {
        "equipped": true,
        "quantity": 1,
        "description": "",
        "category": "melee",
        "damage": "1 + S",
        "traits": [
            {
                "name": "magical"
            },
            {
                "name": "penetrating"
            },
            {
                "name": "piercing"
            }
        ],
        "attribute": "body"
    },
    "img": "modules/soulbound-core/assets/icons/weapons/creature-melee.webp",
}, {parent: this.actor, fromEffect: this.effect.id})