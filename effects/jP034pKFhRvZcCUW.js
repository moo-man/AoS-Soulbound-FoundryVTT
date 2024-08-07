let value = await ValueDialog.create({title : this.effect.name, text : "Lower Defence and increase Melee by:"}, 0);

if (Number.isNumeric(value))
{
    value = Math.floor(Math.abs(value)).toString();
    this.effect.update({changes : [
    {
        "key": "system.combat.defence.bonus",
        "value": "-" + value,
        "mode": 2,
    },
    {
        "key": "system.combat.melee.bonus",
        "value": value,
        "mode": 2,
    }
]})
}