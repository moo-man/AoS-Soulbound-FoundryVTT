Item.create({
    "name": "Big Green Choppa",
    "type": "weapon",
    "img": "modules/soulbound-core/assets/icons/weapons/creature-melee.webp",
    "system": {
        "equipped": true,
        "quantity": 1,
        "description": "",
        "category": "melee",
        "damage": "4 + S",
        "availability": "",
        "cost": "—",
        "traits": [
            {
                "name": "cleave"
            },
            {
                "name": "slashing"
            },
            {
                "name": "twohanded"
            },
            {
                "name": "magical"
            }
        ],
        "attribute": "body"
    }
}, {parent: this.actor, fromEffect: this.effect.id})