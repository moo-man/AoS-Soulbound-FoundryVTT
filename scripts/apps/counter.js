export default class SoulboundCounter extends Application {

    constructor(...args)
    {
      super(...args)
    }

    static get defaultOptions() {
      const options = super.defaultOptions;
      options.id = 'counter';
      options.template = 'systems/age-of-sigmar-soulbound/template/apps/counter.html';
      options.popOut = true;
      return options;
    }
    /* -------------------------------------------- */
    /**
     * Provide data to the HTML template for rendering
     * @type {Object}
     */
    getData() {
      const data = super.getData();
      if(this.party)
      {
        data.party = this.party
        data.soulfire = this.party.soulfire.value
        data.doom = this.party.doom.value
      }
      else
      {
        data.soulfire = game.settings.get('age-of-sigmar-soulbound', 'soulfire');
        data.doom = game.settings.get('age-of-sigmar-soulbound', 'doom');
      }
      data.canEdit =
        game.user.isGM || game.settings.get('age-of-sigmar-soulbound', 'playerCounterEdit');
  
      return data;
    }


    render(force=false, options={})
    {
      let position = game.settings.get("age-of-sigmar-soulbound", "counterPosition")
      options.top = position.top || window.innerHeight - 200;
      options.left = position.left || 250;
      return super.render(force, options);
    }

    close() {
      return
    }

    setCounterDrag()
    {
      new Draggable(this, this._element, this._element.find(".handle")[0], false)
    }

    setPosition(...args)
    {
      super.setPosition(...args)
      game.settings.set("age-of-sigmar-soulbound", "counterPosition", this.position)
    }
  
    activateListeners(html) {
      super.activateListeners(html);
      

      new Draggable(this, html, html.find(".handle")[0], false)
  
      html.find('input').focusin(ev => {
        ev.target.select()
      })
      // Call setCounter when input is used
      this.input = html.find('input').change(async ev => {
        const type = $(ev.currentTarget).attr('data-type');
        SoulboundCounter.setCounter(ev.target.value, type);
      });
  
      // Call changeCounter when +/- is used
      html.find('.incr,.decr').mousedown(async ev => {
        let input = $(ev.target.parentElement).find("input")
        const type = input.attr('data-type');
        const multiplier = $(ev.currentTarget).hasClass('incr') ? 1 : -1;
        $(ev.currentTarget).toggleClass("clicked")
        let newValue = await SoulboundCounter.changeCounter(1 * multiplier, type);
        input[0].value = newValue
      });
  
      html.find('.incr,.decr').mouseup(ev => {
        $(ev.currentTarget).removeClass("clicked")
      });
      

      html.find(".party a").mousedown(async ev => {
        if (ev.button == 0)
          this.party.sheet.render(true)
        else 
        {
          await game.settings.set('age-of-sigmar-soulbound', 'counterParty', "")
          game.counter.render(true)
        }
      })

      // html.mousedown(ev => {
      //   this.position = duplicate(this.app.position);
      //   this._initial = {x: event.clientX, y: event.clientY};

      //       // Add temporary handlers
      //     window.addEventListener(...this.handlers.dragMove);
      //     window.addEventListener(...this.handlers.dragUp);
      // })
    }
  
    // ************************* STATIC FUNCTIONS ***************************
  
    /**
     * Set the counter of (type) to (value)
     * @param value Value to set counter to
     * @param type  Type of counter, "momentum" or "doom"
     */
    static async setCounter(value, type) {
      value = Math.round(value);

      if (!game.user.isGM) {
        game.socket.emit('system.age-of-sigmar-soulbound', {
          type: 'setCounter',
          payload: {value, type},
        });
      }
      else if (this.party)
      {
        if (type == "soulfire")
          await this.party.update({"data.soulfire.value" : parseInt(value)})
        else
          await this.party.update({"data.doom.value" : parseInt(value)})
      }
      else
        await game.settings.set('age-of-sigmar-soulbound', type, value);
      
      // Emit socket event for users to rerender their counters
      game.socket.emit('system.age-of-sigmar-soulbound', {type: 'updateCounter'});
  
      return value
    }
  
    /**
     * Change the counter of (type) by (value)
     * @param diff How much to change the counter
     * @param type  Type of counter, "momentum" or "doom"
     */
    static async changeCounter(diff, type) {
      let value = this.getValue(type)
      return await SoulboundCounter.setCounter(value + diff, type)
    }

    static getValue(type)
    {
      if (this.party)
          return parseInt(this.party[type].value)
      else 
        return game.settings.get('age-of-sigmar-soulbound', type);
    }

    static get party() {
      return game.actors.get(game.settings.get('age-of-sigmar-soulbound', 'counterParty'));
    }

    get party() {
      return SoulboundCounter.party
    }
  
  }
