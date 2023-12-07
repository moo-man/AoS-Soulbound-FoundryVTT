 export default function() {

  // Convert functions that move data between world and compendium to retain ID
  Actors.prototype.fromCompendium = keepID(Actors.prototype.fromCompendium);
  Items.prototype.fromCompendium = keepID(Items.prototype.fromCompendium);
  Journal.prototype.fromCompendium = keepID(Journal.prototype.fromCompendium);
  Scenes.prototype.fromCompendium = keepID(Scenes.prototype.fromCompendium);
  RollTables.prototype.fromCompendium = keepID(RollTables.prototype.fromCompendium);

  Actor.implementation.prototype.toCompendium = keepID(Actor.implementation.prototype.toCompendium);
  Item.implementation.prototype.toCompendium = keepID(Item.implementation.prototype.toCompendium);
  JournalEntry.implementation.prototype.toCompendium = keepID(JournalEntry.implementation.prototype.toCompendium);
  Scene.implementation.prototype.toCompendium = keepID(Scene.implementation.prototype.toCompendium);
  RollTable.implementation.prototype.toCompendium = keepID(RollTable.implementation.prototype.toCompendium);



  function keepID(orig)
  {
    return function(...args)
    {
      try {
        args[1].keepId = true;
      }
      catch(e)
      {
        console.error("Error setting keepId: " + e);
      }
      return orig.bind(this)(...args);
    }
  }


    // I don't think this is needed anymore? 

    // // Since IDs are maintained in Soulbound, we have to clean actor imports from their IDs
    // function SoulboundImportFromJson(json) {
    //     const data = JSON.parse(json);
    //     delete data._id
    //     if (data.prototypeToken)
    //       delete data.prototypeToken.actorId
    //     this.updateSource(data, {recursive: false});
    //     return this.update(this.toJSON(), {diff: false, recursive: false});
    //   }
    
    //    // keep old functions
    //    CONFIG.Scene.documentClass.prototype.importFromJSON = SoulboundImportFromJson;
    //    CONFIG.JournalEntry.documentClass.prototype.importFromJSON = SoulboundImportFromJson;
    //    CONFIG.Actor.documentClass.prototype.importFromJSON = SoulboundImportFromJson;
    //    CONFIG.Item.documentClass.prototype.importFromJSON = SoulboundImportFromJson;

 }
