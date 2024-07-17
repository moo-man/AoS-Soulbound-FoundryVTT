export default class SoulboundUtility {
    static getSpeaker(speaker) {
        try {
            if (speaker.actor)
                return game.actors.get(speaker.actor)
            else if (speaker.token && speaker.scene)
                return game.scenes.get(speaker.scene).tokens.get(speaker.token).actor
            else
                throw "Could not find speaker"
        }
        catch (e) {
            throw new Error(e)
        }

    }

    static DNToObject(dn) {
      try {
        dn = dn.split("").map(i => i.trim()).filter(i => i).join("")
        return {difficulty : parseInt(dn.split(":")[0]), complexity : parseInt(dn.split(":")[1])}
      }
      catch (e)
      {
        return {difficulty: null, complexity: null}
      }

    }


    static log(message, force=false, args) {
      if (CONFIG.debug.soulbound || force)
        console.log(`%cSoulbound` + `%c | ${message}`, "color: gold", "color: unset", args || "");
    }
  

}