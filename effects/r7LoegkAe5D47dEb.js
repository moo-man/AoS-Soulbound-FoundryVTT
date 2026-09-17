Item.create({
    "name": "Bite",
    "type": "weapon",
    "system": {
        "equipped": true,
        "quantity": 1,
        "category": "melee",
        "damage": "+ S",
        "traits": [
            {
                "name": "piercing"
            }
        ],
        "attribute": "body"
    },
    "img": "modules/soulbound-core/assets/icons/weapons/creature-melee.webp",
}, {parent: this.actor, fromEffect: this.effect.id})