let allMiracles = await warhammer.utility.findAllItems("miracle", "Loading Miracles");
let god = "Nagash";

let godMiracles = allMiracles.filter(i => i.system.god == god);
if (godMiracles.length)
{
    ItemDialog.create(godMiracles, 1, {title : this.effect.name, text : "Choose Miracle"}).then(miracles => 
    {
        this.actor.createEmbeddedDocuments("Item", miracles, {fromEffect: this.effect.id});
    });
}