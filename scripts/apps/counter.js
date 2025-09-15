export default class SoulboundCounter extends HandlebarsApplicationMixin(ApplicationV2) {
  

  static DEFAULT_OPTIONS = {
    id: "counter",
    classes : ["warhammer", "soulbound"],
    actions: {
      stepValue : this._onStepValue
    }
  };

  static PARTS = {
    counter: {
        template: "systems/age-of-sigmar-soulbound/templates/apps/counter.hbs"
      },
  };


  /* -------------------------------------------- */
  /**
   * Provide data to the HTML template for rendering
   * @type {Object}
   */
  async _prepareContext(options) 
  {
    const context = await super._prepareContext(options);
    if(this.party)
      {
        context.party = this.party
        context.soulfire = this.party.soulfire.value
        context.doom = this.party.doom.value
      }
      else
      {
        context.soulfire = game.settings.get('age-of-sigmar-soulbound', 'soulfire');
        context.doom = game.settings.get('age-of-sigmar-soulbound', 'doom');
      }
      context.canEdit = game.user.isGM || game.settings.get('age-of-sigmar-soulbound', 'playerCounterEdit');
  
      return context;
  }

  get hasFrame() {
    return false;
  }

  render(options={})
  {
    let userPosition = game.settings.get("age-of-sigmar-soulbound", "counterPosition")
    options.position = userPosition

    if (options.position.hide)
    {
      return
    }
    else 
    {
      delete options.position.hide;
      super.render(options);
    }

  }


  setPosition(...args) {
    super.setPosition(...args);
    game.settings.set("age-of-sigmar-soulbound", "counterPosition", this.position)
  }


  close(options)
  {
    if (options.fromControls)
    {
      super.close(options);
    }
  }

  async _onRender(options)
  {
    await super._onRender(options);
    new foundry.applications.ux.Draggable.implementation(this, this.element, this.element.querySelector(".handle"), false)


    let inputs = this.element.querySelectorAll("input")
    inputs.forEach(input => {
      input.addEventListener("change", ev => {
        let counter = ev.target.dataset.counter;
        this.constructor.setCounter(ev.target.value, counter);
      });

      input.addEventListener("mousedown", ev => {
        ev.target.classList.add("clicked");
      })

      input.addEventListener("mouseup", ev => {
        ev.target.classList.remove("clicked");
      })

      input.addEventListener("focusin", ev => {
        ev.target.select();
      })
    })
  }

  static async  _onStepValue(ev, target)
  {
    let input = target.parentElement.querySelector("input");
    let counter = input.dataset.counter;
    let multiplier = target.dataset.type == "incr" ? 1 : -1;
    target.classList.toggle("clicked");
    let newValue = await this.constructor.changeCounter(1 * multiplier, counter);
    input.value = newValue;
  }

  // ************************* STATIC FUNCTIONS ***************************

  /**
   * Set the counter of (type) to (value)
   * @param value Value to set counter to
   * @param type  Type of counter, "soulfire" or "doom"
   */
  static async setCounter(value, type) {
    value = Math.round(value);

    if (!game.user.isGM) {
      await SocketHandlers.call("setCounter", {value, type}, "GM")
    }
    else
    {
      await game.settings.set('age-of-sigmar-soulbound', type, value);
    }

    SocketHandlers.call("updateCounter", null, "ALL")


    return value
  }

  /**
   * Change the counter of (type) by (value)
   * @param diff How much to change the counter
   * @param type  Type of counter, "soulfire" or "doom"
   */
  static async changeCounter(diff, type) {
    let value = game.settings.get('age-of-sigmar-soulbound', type);
    return await this.setCounter(value + diff, type)
  }


  static getValue(type)
  {
      return game.settings.get('age-of-sigmar-soulbound', type);
  }

  get soulfire()
  {
    return this.constructor.getValue("soulfire")
  }

  get doom()
  {
    return this.constructor.getValue("doom")
  }

}


Hooks.on("ready", (app, html, options) => {
  let button = document.createElement("li")
  button.innerHTML = `<button class='control ui-control layer icon fa-solid fa-input-numeric' data-tooltip="${game.i18n.localize("CONTROLS.WNGCounterToggle")}"></button>`
  button.addEventListener("click", ev => {
    // Retain show/hide on refresh by storing in settings
    let position = game.settings.get("age-of-sigmar-soulbound", "counterPosition")
    position.hide = game.counter.rendered;
    game.settings.set("age-of-sigmar-soulbound", "counterPosition", position);
    
    game.counter.rendered ? game.counter.close({fromControls : true}) : game.counter.render({force : true});
  })
  document.querySelector("#scene-controls-layers").append(button)
})
