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
}

