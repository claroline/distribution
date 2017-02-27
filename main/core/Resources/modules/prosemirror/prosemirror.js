import {EditorState} from 'prosemirror-state'
const {MenuBarEditorView, MenuItem} = require("prosemirror-menu")
import {schema} from 'prosemirror-schema-basic'
import {exampleSetup, buildMenuItems} from 'prosemirror-example-setup/dist/index'
import {DOMParser, Schema} from 'prosemirror-model'
import {addListNodes} from 'prosemirror-schema-list'
import {addTableNodes} from 'prosemirror-schema-table'
const {InputRule, inputRules} = require("prosemirror-inputrules")

import 'prosemirror-menu/style/menu.css'
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-example-setup/style/style.css'

export class Editor {
  constructor(root) {
    this.root = root
    this.editor = null
  }

  instantiate(content = '', plugins = []) {

    const dinos = ["brontosaurus", "stegosaurus", "triceratops", "tyrannosaurus", "pterodactyl"]

    const dino = {
      attrs: {type: {default: "brontosaurus"}},
      draggable: true,
      toDOM: node => ["img", {"dino-type": node.attrs.type,
                              src: "/img/dino/" + node.attrs.type + ".png",
                              title: node.attrs.type,
                              class: "dinosaur"}],
      parseDOM: [{
        tag: "img[dino-type]",
        getAttrs: dom => {
          let type = dom.getAttribute("dino-type")
          if (dinos.indexOf(type) > -1) return {type}
        }
      }],

      inline: true,
      group: "inline"
    }

    const dinoSchema = new Schema({
      nodes: schema.nodeSpec,
      marks: schema.markSpec
    })
    const dinoType = dinoSchema.nodes.dino

    const dinoInputRule = new InputRule(new RegExp("\\[(" + dinos.join("|") + ")\\]$"), (state, match, start, end) => {
      return state.tr.replaceWith(start, end, dinoType.create({type: match[1]}))
    })

    let menu = buildMenuItems(dinoSchema)
    menu.insertMenu.content = dinos.map(name => new MenuItem({
      title: "Insert " + name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      select(state) {
        return insertPoint(state.doc, state.selection.from, dinoType) != null
      },
      run(state, dispatch) { dispatch(state.tr.replaceSelectionWith(dinoType.create({type: name}))) }
    })).concat(menu.insertMenu.content)

    let view = new MenuBarEditorView(this.root, {
      state: EditorState.create({
        doc: '',
        plugins: exampleSetup({schema: dinoSchema}).concat(inputRules({rules: [dinoInputRule]}))
      }),
      menuContent: menu.fullMenu
    })

    this.editor = view.editor
  }

  getBaseSchema() {
    return new Schema({
      nodes: addListNodes(addTableNodes(schema.nodeSpec, 'block+', 'block'), 'paragraph block*', 'block'),
      marks: schema.markSpec
    })
  }

  getEditor() {
    return this.editor
  }
}
