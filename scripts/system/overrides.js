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
 }
