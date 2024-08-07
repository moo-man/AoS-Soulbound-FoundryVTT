this.actor.setupCommonTest({skill : "determination"}, {fields : {difficulty : 4, complexity : 2}, appendTitle : ` - ${this.effect.name}`}).then(test => {
    if (test.failed)
    {
        this.actor.addCondition("stunned");
    }
})