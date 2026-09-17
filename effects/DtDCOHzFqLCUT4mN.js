let preApplyScript = "if (await this.item.spend(\"system.quantity\"))\n{\n    return true;  \n}\nelse\n{\n    this.script.notification(\"No more left!\", \"error\")\n}";

let item = {
    "name": "",
    "type": "equipment",
    "img": "modules/soulbound-destruction/assets/icons/equipment/fungus-brew.webp",
    "system": {
        "equipped": false,
        "quantity": 1,
        "description": "",
    },
    "effects": [
    
    ]
}

let roll = await this.script.roll("1d6");
let id = "";
let description = "";
if (roll >= 5)
{
    id = "zLzJVqiZsQLNS4YY";
    description = "<p>As an Action, you can throw a jar of this thick black sludge at a Zone within . Creatures in the Zone suffer 3 Damage as their flesh begins to melt beneath the sticky black goo.</p>";
}
else if (roll >= 3)
{
    id = "cI6Z0ToaK9b8JtF9";
    description = "<p>As an Action, a creature can apply this noxious green venom to a  or  weapon. The weapon deals +1 Damage and the severity of  inflicted by the weapon increases one step. This effect lasts for 1 hour.</p>";
}
else 
{
    id = "GI2F4ZMUxaxiUUKg";
    description = "<p>A creature that drinks this foul-smelling potion regains 2d6 Toughness.</p>";
}

let effect = this.item.effects.get(id)?.toObject();

if (effect)
{
    effect.system.transferData.preApplyScript = preApplyScript;
    item.name = effect.name;
    item.img = effect.img;
    item.system.description = description;
    item.effects.push(effect);
    Item.create(item, {parent: this.actor});
    this.script.message(`Obtained <strong>${effect.name}</strong>`);
}