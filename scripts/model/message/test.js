export class SoulboundTestMessageModel extends WarhammerTestMessageModel {

  static get actions() {
    return foundry.utils.mergeObject(super.actions, {
      applyDamage: this.applyDamage,
      applyRend : this.applyRend,
      applyCleave : this.applyCleave,
      toggleDie: this._onToggleDie,
      rollTest: this._onRollTest,
      spellFail : this._onSpellFailClick,
      allocateOvercast: this._onAllocateOvercast,
      resetOvercast: this._onResetOvercast,
    });
  }

  get test() {
    return game.aos.config.rollClasses[this.context.rollClass].recreate(this.toObject());
  }

  async getHeaderToken() {
    if (this.test.actor) {
      let token = this.test.actor.getActiveTokens()[0]?.document || this.test.actor.prototypeToken;

      let path = token.hidden ? "modules/soulbound-core/assets/tokens/unknown1.webp" : token.texture.src;

      if (foundry.helpers.media.VideoHelper.hasVideoExtension(path)) {
        path = await game.video.createThumbnail(path, { width: 50, height: 50 }).then(img => chatOptions.flags.img = img)
      }

      return path;
    }
    else return false
  }

  async onRender(html) {

    let token = await this.getHeaderToken();
    if (token) {
      let header = html.querySelector(".message-header");
      let div = document.createElement("div")
      div.classList.add("message-token");
      let image = document.createElement("img");
      image.src = token
      image.style.zIndex = 1;

      div.appendChild(image);
      header.insertBefore(div, header.firstChild);

      warhammer.utility.replacePopoutTokens(html);
    }


    if (!this.parent.isAuthor && !this.parent.isOwner) {
      html.querySelectorAll("h3").forEach(e => e.dataset.tooltip = "");
    }
  }

    
  static _onToggleDie(ev, target)
  {
      let message = this.parent;
      if (message.isAuthor || message.isOwner)
        target.classList.toggle("selected")
  }

  static async _onRollTest(ev)
  {
      let test = this.test;
      let itemTest = test.itemTest
      if (ev.currentTarget.dataset.source == "secondary")
          itemTest = test.secondaryItemTest

      let [difficulty, complexity] = itemTest.dn.split(":").map(i=> parseInt(i))
      let chatTest
      if (canvas.tokens.controlled.length)
      {
          for (let t of canvas.tokens.controlled)
          {
              chatTest = await t.actor.setupCommonTest(itemTest, {fields : {difficulty, complexity}, resist : test.item?.type, appendTitle : test.item ? ` - ${test.item.name}` : ""});
              await chatTest.roll();
          }
      }
      else if (game.user.character)
      {
          chatTest = await t.actor.setupCommonTest(itemTest, {fields : {difficulty, complexity}, resist : test.item?.type, appendTitle : test.item ? ` - ${test.item.name}` : ""})            
          await chatTest.roll()
      }
      else
          return ui.notifications.warn("WARN.NoActorsToTest", {localize : true})

 
  }


  /**
     * @param {HTMLElement} messsage    The chat entry which contains the roll data
     * @return {Promise}
     */
  static async applyDamage(ev, target) {

    let test = this.test;
    let item = test.item;
    let result = test.result;

    if (target.closest(".primary"))
    {
      result = test.result.primary;
    }
    if (target.closest(".secondary"))
    {
      result = test.result.secondary;
      item = test.secondaryWeapon;
    }

    let damage = result.damage.total;

    // damage = Math.ceil(damage * multiplier);

    let options = {};
    options.penetrating = item?.traitList?.penetrating ? 1 : 0
    options.ineffective = item?.traitList?.ineffective
    options.restraining = item?.traitList?.restraining
    options.test = test;
    options.item = item;

    // apply to any selected actors
    let targets = game.user.targets.size ? game.user.targets.map(i => i.actor) : test.targets
    return Promise.all(targets.filter(a => a).map(a => a.applyDamage(damage, options)));
  }

  /**
* @param {HTMLElement} messsage    The chat entry which contains the roll data
* @return {Promise}
*/
  static async applyHealing() {

    let healing = this.test.result.healing;

    // apply to any selected actors
    return Promise.all(canvas.tokens.controlled.map(t => {
      const a = t.actor;
      return a.applyHealing(healing);
    }));
  }

  /**
   * @param {HTMLElement} messsage    The chat entry which contains the roll data
   * @return {Promise}
   */
  static async applyCleave(ev, target) {
    let test = this.test;
    let result = test.result;

    if (target.closest(".primary"))
    {
      result = test.result.primary;
    }
    if (target.closest(".secondary"))
    {
      result = test.result.secondary;
    }
    
    let damage = result.triggers
    // apply to any targeted actors
    let targets = game.user.targets.size ? game.user.targets.map(i => i.actor) : test.targets
    return Promise.all(targets.filter(a => a).map(a => a.applyDamage(damage)));
  }

  /**
   * @param {HTMLElement} messsage    The chat entry which contains the roll data
   * @return {Promise}
   */
  static async applyRend(ev, target) {
    let test = this.test
    let result = test.result
    let item = test.item

    if (target.closest(".primary"))
    {
      result = test.result.primary;
    }
    if (target.closest(".secondary"))
    {
      result = test.result.secondary;
      item = test.secondaryItem
    }

    let damage = result.triggers
    // apply to any selected actors
    return Promise.all(canvas.tokens.controlled.map(t => {
      const a = t.actor;
      return a.applyRend(damage, { magicWeapon: item?.traitList?.magical });
    }));
  }



  
  static async _onSpellFailClick(ev)
  {
      let test = this.test;
      let diceNum = test.testData.dn.complexity - test.result.successes;
      let formula  = `${diceNum}d6`
      let tableRoll = new Roll(formula)
      let table = game.tables.getName("The Price of Failure")
      if (table)
      {
          let {roll, results} =  await table.roll({roll : tableRoll})
          ChatMessage.create({content : `<b>${roll.total}</b>: ${results[0].text}`, flavor : `The Price of Failure (${formula})`, speaker : test.context.speaker, roll, type : CONST.CHAT_MESSAGE_TYPES.ROLL})
      }
      else
          ui.notifications.error("No Table Found")
  }

  static _onAllocateOvercast(ev, target)
  {
      let test = this.test;
      let index = Number(target.parentElement.dataset.index);
      test.allocateOvercast(index)
  }

  static _onResetOvercast(ev)
  {
      this.test.resetOvercasts();
  }


}