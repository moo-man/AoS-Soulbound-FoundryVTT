let type = await Dialog.wait({
    title : this.effect.name, 
    content : "<p>+1 to Training or Focus?</p>",
    buttons : {
        training : {
            label : "Training"
        },
        focus : {
            label : "Focus"
        }
    }
})

if (type)
{
    let skill = await ValueDialog.create({text : "Choose Skill", title : this.effect.name}, "", game.aos.config.skills)
    this.effect.setFlag(game.system.id, "memories", {skill, type});
}