Item.create({
    "name": "World Spirit Attack",
    "type": "weapon",
    "folder": "TCovxfnXO0v98WoK",
    "img": "modules/soulbound-core/assets/icons/weapons/creature-melee.webp",
    "system": {
        "equipped": true,
        "quantity": 1,
        "category": "melee",
        "damage": "2 + S",
        "availability": "",
        "cost": "—",
        "traits": [
            {
                "name": "magical"
            },
            {
                "name": "slashing"
            }
        ],
        "attribute": "body"
    },
    "effects": [
        {
            "name": "Attack",
            "img": "modules/soulbound-core/assets/icons/weapons/creature-melee.webp",
            "_id": "EJ6fZkmOZY7K6Bkx",
            "type": "base",
            "system": {
                "transferData": {
                    "documentType": "Item",
                },
                "scriptData": [
                    {
                        "script": "args.fields.bonusDice = 12 - args.numberOfDice();\nargs.fields.attack = 6;",
                        "label": "12d6 (Extraordinary)",
                        "trigger": "dialog",
                        "options": {
                            "activateScript": "return true;",
                        },
                    }
                ],
            }
        }
    ],
}, {parent: this.actor, fromEffect: this.effect.id})