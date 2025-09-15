export default {
    updateCounter : () => {
        game.counter.render({force: true})
    },

    setCounter: async (data) => {
        if (game.user.isGM)
        {
            if (game.counter.party)
            {
                game.counter.party.update({[`system.${data.type}.value`] : parseInt(data.value)})
            }
            else
            {
                await game.settings.set("age-of-sigmar-soulbound", data.type, data.value)
            }
        }
        game.counter.render({force: true})
    }
}