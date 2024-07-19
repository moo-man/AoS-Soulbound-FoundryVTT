export default {
    updateCounter : () => {
        game.counter.render(true)
    },

    setCounter: async (data) => {
        if (game.user.isGM)
        {
            if (game.counter.party)
            {
                game.counter.party.update({[`data.${data.type}.value`] : parseInt(data.value)})
            }
            else
            {
                await game.settings.set("age-of-sigmar-soulbound", data.type, data.value)
            }
        }
        game.counter.render(true)
    }
}