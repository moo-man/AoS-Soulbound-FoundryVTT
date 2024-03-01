export default class TokenHelpers 
{
    static highlightToken(tokenId)
    {
        let token = canvas.scene.tokens.get(tokenId);
        token?.object?._onHoverIn({});
    }

    static unhighlightToken(tokenId)
    {
        let token = canvas.scene.tokens.get(tokenId);
        token?.object?._onHoverOut({});
    }

    static displayScrollingText(text, actor, {color="0xFFFFFF", stroke="0x000000"}={}) 
    {
        const tokens = actor.getActiveTokens();

        for ( let t of tokens ) 
        {
            if ( !t.visible || !t.renderable ) { continue; }
            canvas.interface.createScrollingText(t.center, text, {
                anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
                direction: CONST.TEXT_ANCHOR_POINTS.TOP,
                distance: (2 * t.h),
                fontSize: 36,
                fill: color,
                stroke,
                strokeThickness: 4,
                jitter: 0.25
            });
        }
    }

    
    static tokensInDrawing(drawing) {
        let scene = drawing.parent
  
        return this.containedTokenIds(drawing).map(t => scene.tokens.get(t))
      }
  
      static withinDrawings(token) {
        let scene = token.parent
        let drawings = scene.drawings.contents
  
        return drawings.filter(d => this.containedTokenIds(d).includes(token.id))
      }
  
      static tokenIsInDrawing(token, drawing)
      {
        return this.tokensInDrawing(drawing).find(t => t.id == token.id)
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
            {x : drawing.x + drawing.shape.width, y : drawing.y}, 
            {x : drawing.x + drawing.shape.width, y: drawing.y + drawing.shape.height}, 
            {x : drawing.x, y: drawing.y + drawing.shape.height}
          ]
        }
          
        let poly
  
        // Ellipse
        if (drawing.type == "e")
          poly = new PIXI.Ellipse(drawing.x + drawing.shape.width /2 , drawing.y + drawing.shape.height / 2, drawing.shape.width/2, drawing.shape.height/2 )
        else
          poly  = new PIXI.Polygon(points);
  
        return poly.contains(x, y);
      }
  
      static containedTokenIds(drawing) {
  
        let ids = [];
        for (let token of canvas.tokens.placeables)
        {
          if(this.pointInDrawing(token.center, drawing.object))
            ids.push(token.document.id)
        }
        return ids
      }
}

