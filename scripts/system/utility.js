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

    static tokensInDrawing(drawing) {
      let scene = drawing.parent

      return SoulboundUtility.containedTokenIds(drawing).map(t => scene.tokens.get(t))
    }

    static withinDrawings(token) {
      let scene = token.parent
      let drawings = scene.drawings.contents

      return drawings.filter(d => SoulboundUtility.containedTokenIds(d).includes(token.id))
    }

    static tokenIsInDrawing(token, drawing)
    {
      return SoulboundUtility.tokensInDrawing(drawing).find(t => t.id == token.id)
    }

    static pointInDrawing({x, y}, drawing)
    {
      let points = []

      // Polygon
      if (drawing.type == "p")
      {
        points = drawing.points.map(i => {return {x: i[0] + drawing.x , y: i[1] + drawing.y}})
      }

      // Rectangle
      else if (drawing.type == "r")
      {
        points = [
          {x : drawing.x, y: drawing.y}, 
          {x : drawing.x + drawing.width, y : drawing.y}, 
          {x : drawing.x + drawing.width, y: drawing.y + drawing.height}, 
          {x : drawing.x, y: drawing.y + drawing.height}
        ]
      }
        
      let poly

      // Ellipse
      if (drawing.type == "e")
        poly = new PIXI.Ellipse(drawing.x + drawing.width /2 , drawing.y + drawing.height / 2, drawing.width/2, drawing.height/2 )
      else
        poly  = new PIXI.Polygon(points);

      return poly.contains(x, y);
    }

    static containedTokenIds(drawing) {

      let ids = [];
      for (let token of canvas.tokens.placeables)
      {
        if(SoulboundUtility.pointInDrawing(token.center, drawing))
          ids.push(token.document.id)
      }
      return ids
    }

}