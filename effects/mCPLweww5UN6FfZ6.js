Item.create({
    "name": "Icy Breath",
    "type": "weapon",
    "system": {
        "equipped": true,
        "test": {
            "attribute": "body",
            "skill": "fortitude",
            "dn": "6:1",
        },
        "quantity": 1,
        "description": "",
        "category": "ranged",
        "damage": "1 + S",
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
    "effects": [
        {
            "statuses": [
                "restrained"
            ],
            "name": "Restrained",
            "img": "systems/age-of-sigmar-soulbound/assets/icons/restrained.svg",
            "system": {
                "changes": [
                    {
                        "key": "system.combat.melee.bonus",
                        "type": "add",
                        "value": -1,
                        "phase": "initial",
                        "priority": null
                    },
                    {
                        "key": "system.combat.accuracy.bonus",
                        "type": "add",
                        "value": -1,
                        "phase": "initial",
                        "priority": null
                    },
                    {
                        "key": "system.combat.defence.bonus",
                        "type": "add",
                        "value": -1,
                        "phase": "initial",
                        "priority": null
                    }
                ],
                "transferData": {
                    "type": "damage",
                    "avoidTest": {
                        "value": "item",
                        "prevention": true,
                    },
                }
            },
            "type": "base",
        }
    ],
}, {parent: this.actor, fromEffect: this.effect.id})