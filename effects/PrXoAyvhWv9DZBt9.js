let effects = await this.effect.system.itemTargets[0]?.createEmbeddedDocuments("ActiveEffect", [  {
  "name": "Ignore Armour",
  "img": "modules/soulbound-death/assets/icons/spells/underworld.webp",
  "system": {
      "transferData": {
          "documentType": "Item",
      },
      "scriptData": [
          {
              "script": "args.ignoreArmour = true;",
              "label": "Ignore Armour",
              "trigger": "preApplyDamage",
          }
      ],
  },
}])

this.effect.updateSource({[`flags.${game.system.id}.id`] : effects[0].id});