Item.create({
  "name": "Noxious Vomit",
  "type": "weapon",
  "system": {
      "equipped": true,
      "test": {
          "attribute": "body",
          "skill": "fortitude",
          "dn": "4:3",
      },
      "quantity": 1,
      "description": "<p>A creature damaged by this attack must make a <strong>DN 4:3 Body (Fortitude)</strong> Test or be @UUID[Compendium.soulbound-core.journals.JournalEntry.iUQ14OOc9XlVIeLG.JournalEntryPage.hNuI4uvL9qfEzaJp#poisoned]{Poisoned} until the end of their next turn.</p>",
      "category": "ranged",
      "damage": "+ S",
      "availability": "",
      "cost": "",
      "traits": [
          {
              "name": "close"
          },
          {
              "name": "range",
              "value": "Short"
          },
          {
              "name": "rend"
          }
      ],
      "attribute": "body"
  },
  "img": "modules/soulbound-core/assets/icons/weapons/creature-ranged.webp",
  "effects": [
      {
          "statuses": [
              "poisoned"
          ],
          "name": "Poisoned",
          "img": "systems/age-of-sigmar-soulbound/assets/icons/poisoned.svg",
          "system": {
              "scriptData": [
                  {
                      "label": "Penalty to all Tests",
                      "script": "args.fields.bonusDice -= 1",
                      "trigger": "dialog",
                      "options": {
                          "activateScript": "return true;",
                      },
                      "async": false
                  }
              ],
              "transferData": {
                  "type": "damage",
                  "avoidTest": {
                      "value": "item",
                      "prevention": true,
                  },
           }
        }
    }
  ],
}, {parent: this.actor, fromEffect: this.effect.id})