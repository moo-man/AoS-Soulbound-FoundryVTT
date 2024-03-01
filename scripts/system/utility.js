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

    static _keepID(id, document) {
      try {
        let compendium = !!document.pack
        let world = !compendium
        let collection

        if (compendium) {
          let pack = game.packs.get(document.pack)
          collection = pack.index
        }
        else if (world)
          collection = document.collection

        if (collection.has(id)) {
          ui.notifications.notify(`${game.i18n.format("ERROR.ID", {name: document.name})}`)
          return false
        }
        else return true
      }
      catch (e) {
        console.error(e)
        return false
      }
    }

    static findItem(id, type) {
      if (id.includes("."))
        return fromUuid(id);
  
      if (game.items.has(id))
        return game.items.get(id)
  
      let packs = game.aos.tags.getPacksWithTag(type)
      for (let pack of packs) {
        if (pack.index.has(id)) {
          return pack.getDocument(id)
        }
      }
    }
  

    static findJournal(id) {
      if (game.journal.has(id))
        return game.journal.get(id)

      let packs = game.packs.filter(i => i.metadata.type == "JournalEntry")
      for (let pack of packs) {
        if (pack.index.has(id)) {
          return pack.getDocument(id)
        }
      }
    }

    static log(message, force=false, args) {
      if (CONFIG.debug.soulbound || force)
        console.log(`%cSoulbound` + `%c | ${message}`, "color: gold", "color: unset", args || "");
    }
  

}