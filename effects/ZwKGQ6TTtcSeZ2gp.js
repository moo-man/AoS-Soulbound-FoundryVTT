Item.create({
    "name": "Thrown Git",
    "type": "weapon",
    "system": {
        "equipped": true,
        "quantity": 1,
        "description": "<p>This attack deals additional Damage equal to the thrown ally’s Body.</p>",
        "category": "ranged",
        "damage": "+ S",
        "availability": "",
        "cost": "",
        "traits": [
            {
                "name": "crushing"
            },
            {
                "name": "loud"
            },
            {
                "name": "thrown",
                "value": "Medium"
            }
        ],
        "attribute": "body"
    },
    "img": "modules/soulbound-core/assets/icons/weapons/creature-ranged.webp",
    "effects": [
        {
            "name": "Set Git",
            "img": "modules/soulbound-core/assets/icons/weapons/creature-ranged.webp",
            "type": "base",
            "system": {
                "transferData": {
                    "documentType": "Item",
                },
                "scriptData": [
                    {
                        "script": "let target = Array.from(game.user.targets)[0];\n\nif (!target || target.actor.uuid == this.actor.uuid)\n{\n  this.script.notification(\"Target a Token to set Damage based on Body!\", \"error\");\n}\n\nif (target.actor)\n{\n  if (target.actor.system.bio.size >= this.actor.system.bio.size)\n  {\n    return this.script.notification(\"Git must be of a smaller Size!\", \"error\");\n  }\n  this.item.update({name: this.item.setSpecifier(target.actor.name), \"system.damage\" : `${target.actor.system.attributes.body.value} + S`})\n}\nelse \n{\n  this.script.notification(\"Target not associated with an Actor!\", \"error\");\n}",
                        "label": "Set Git",
                        "trigger": "manual",
                        "options": {
                            "hideScript": "return this.item.specifier;",
                        },
                    },
                    {
                        "script": "this.item.update({name: this.item.baseName, \"system.damage\" : \"+ S\"})",
                        "label": "Reset",
                        "trigger": "manual",
                        "options": {
                            "hideScript": "return !this.item.specifier;",
                        },
                    }
                ],
            },
        },
        {
            "statuses": [
                "prone"
            ],
            "name": "Prone",
            "img": "systems/age-of-sigmar-soulbound/assets/icons/prone.svg",
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
                    }
                ],
                "transferData": {
                    "type": "target",
                    "avoidTest": {
                        "value": "custom",
                        "prevention": true,
                        "dn": "5:1",
                        "attribute": "body",
                        "skill": "reflexes"
                    },
                },
            },
            "type": "base",
        }
    ],
}, {parent: this.actor, fromEffect: this.effect.id})