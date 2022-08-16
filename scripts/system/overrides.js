 export default function() {

 /**
   * Apply data transformations when importing a Document from a Compendium pack
   * @param {Document|object} document    The source Document, or a plain data object
   * @return {Object}                     The processed data ready for world Document creation
   * @override - Retain ID
   */
  function fromCompendiumRetainID(document) {
    let data = document;
    if ( document instanceof foundry.abstract.Document ) {
      data = document.toObject();
      if ( !data.flags.core?.sourceId ) foundry.utils.setProperty(data, "flags.core.sourceId", document.uuid);
    }

    // Eliminate some fields that should never be preserved
    const deleteKeys = ["folder"];
    for ( let k of deleteKeys ) {
      delete data[k];
    }

    // Reset some fields to default values
    if ( "sort" in data ) data.sort = 0;
    if ( "permissions" in data ) data.permissions = {[game.user.id]: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER};
    return data;
  }


  // Replace collection functions with new function to retain IDs
  Actors.prototype.fromCompendium = fromCompendiumRetainID;
  Items.prototype.fromCompendium = fromCompendiumRetainID;
  Journal.prototype.fromCompendium = fromCompendiumRetainID;
  Scenes.prototype.fromCompendium = fromCompendiumRetainID;
  RollTables.prototype.fromCompendium = fromCompendiumRetainID;

  // Replace collection functions for journal and scene document classes because WFRP does not extend these
  // keep old functions
  let sceneToCompendium = CONFIG.Scene.documentClass.prototype.toCompendium
  let journalToCompendium = CONFIG.JournalEntry.documentClass.prototype.toCompendium
  let tableToCompendium = CONFIG.RollTable.documentClass.prototype.toCompendium

  // Call old functions, but tack on ID again after they finish
  CONFIG.JournalEntry.documentClass.prototype.toCompendium = function(pack)
  {
    let data = journalToCompendium.bind(this)(pack)
    data._id = this.id
    return data
  }
  
  CONFIG.Scene.documentClass.prototype.toCompendium = function(pack)
  {
    let data = sceneToCompendium.bind(this)(pack)
    data._id = this.id
    return data
  }

    
  CONFIG.RollTable.documentClass.prototype.toCompendium = function(pack)
  {
    let data = tableToCompendium.bind(this)(pack)
    data._id = this.id
    return data
  }

    // Since IDs are maintained in Soulbound, we have to clean actor imports from their IDs
    function SoulboundImportFromJson(json) {
        const data = JSON.parse(json);
        delete data._id
        if (prototypeToken)
          delete prototypeToken.actorId
        this.updateSource(data, {recursive: false});
        return this.update(this.toJSON(), {diff: false, recursive: false});
      }
    
       // keep old functions
       CONFIG.Scene.documentClass.prototype.importFromJSON = SoulboundImportFromJson;
       CONFIG.JournalEntry.documentClass.prototype.importFromJSON = SoulboundImportFromJson;
       CONFIG.Actor.documentClass.prototype.importFromJSON = SoulboundImportFromJson;
       CONFIG.Item.documentClass.prototype.importFromJSON = SoulboundImportFromJson;

 }
