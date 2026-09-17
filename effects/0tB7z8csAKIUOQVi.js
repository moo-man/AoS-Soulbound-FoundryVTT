let roll = await this.script.roll("1d6", {flavor: "Duration"})
this.effect.updateSource({duration: {value: roll, units: "rounds"}})