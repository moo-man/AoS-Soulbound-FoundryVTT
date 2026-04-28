let scythe = {
  "name": "Greatscythe",
  "img": "modules/soulbound-death/assets/icons/spells/underworld.webp",
  "system": {
      "category": "melee",
      "damage": "1 + S",
      "traits": [
          {
              "name": "cleave"
          },
          {
              "name": "magical"
          },
          {
              "name": "slashing"
          },
          {
              "name": "twohanded"
          }
      ],
  },
}

scythe.name = scythe.name + ` (${args.item.name})`;

let item = this.effect.system.itemTargets[0];

foundry.utils.mergeObject(args.item, scythe);