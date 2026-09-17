let name = await ValueDialog.create({ text: "Enter name of Trophy", title: this.effect.name });

if (name) {
  await Item.create({
    "folder": "TCovxfnXO0v98WoK",
    "name": `Trophy — ${name}`,
    "type": "equipment",
    "img": this.item.img,
    "system": {
      "quantity": 1,
    },
    "effects": [
      {
        "name": "Use Trophy",
        "img": this.item.img,
        "system": {
          "transferData": {
            "documentType": "Item"
          },
          "scriptData": [
            {
              "script": "let choice = await foundry.applications.api.Dialog.wait({window: {title: this.effect.name}, content: \"Choose Effect\", buttons: [\n  {\n    action: \"frightened\",\n    label: \"Remove Frightened\"\n  },\n  {\n    action: \"mettle\",\n    label: \"Regain Mettle\"\n  }\n]})\n\nif (choice == \"frightened\")\n{\n  this.actor.removeCondition(\"frightened\");\n}\nelse if (choice == \"mettle\")\n{\n  this.actor.update({\"system.combat.mettle.value\" : this.actor.system.combat.mettle.value + 1})\n}\nif (choice)\n{\n  this.script.message(`Used ${this.item.name} (${choice == \"mettle\" ? \"Regain Mettle\" : \"Remove Frightened\"})`);\n  this.item.delete();\n}",
              "label": "Spend",
              "trigger": "manual",
            }
          ],
        },

      }]
  }, { parent: this.actor })
  this.script.message(`Took ${name}`);
}