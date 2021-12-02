export default class AOSUtility {
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

    static findKey(value, obj, options = {}) {
        if (!value || !obj)
          return undefined;
    
        if (options.caseInsensitive) {
          for (let key in obj) {
            if (obj[key].toLowerCase() == value.toLowerCase())
              return key;
          }
        }
        else {
          for (let key in obj) {
            if (obj[key] == value)
              return key;
          }
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
}