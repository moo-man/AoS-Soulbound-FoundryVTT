Item.create({
    "name": "Fire Breath",
    "type": "weapon",
    "system": {
        "equipped": true,
        "quantity": 1,
        "description": "",
        "category": "ranged",
        "damage": "1 + S",
        "availability": "",
        "cost": "",
        "traits": [
            {
                "name": "magical"
            },
            {
                "name": "range",
                "value": "Medium"
            },
            {
                "name": "spread"
            }
        ],
        "attribute": "body"
    },
    "img": "modules/soulbound-core/assets/icons/weapons/creature-ranged.webp",
}, {parent: this.actor, fromEffect: this.effect.id})