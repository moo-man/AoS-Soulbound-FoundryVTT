import fs from "fs";
import getSystemPath from "./foundry-path.mjs";
import copy from 'rollup-plugin-copy-watch'
import postcss from "rollup-plugin-postcss"
import jscc from 'rollup-plugin-jscc'

let manifest = JSON.parse(fs.readFileSync("./system.json"))

let systemPath = getSystemPath(manifest.id, manifest.compatibility.verified);

console.log("Bundling to " + systemPath)

export default {
  input: [`./scripts/${manifest.id}.js`, `./style/${manifest.id}.scss`],
    output: {
        dir : systemPath
    },
    watch : {
        clareScreen: true
    },
    plugins: [
        jscc({      
            values : {_ENV :  process.env.NODE_ENV}
        }),
        copy({
            targets : [
                {src : "./template.json", dest : systemPath},
                {src : "./system.json", dest : systemPath},
                {src : "./static/*", dest : systemPath},
            ],
            watch: process.env.NODE_ENV == "production" ? false : ["./static/*/**", "system.json", "template.json"]
        }),
        postcss({
            extract : `${manifest.id}.css`,
            plugins: []
          })
    ]
}