import tinymce from 'tinymce/tinymce'
import invariant from 'invariant'

import {makeId} from '#/main/core/scaffolding/id'
import {url} from '#/main/app/api'
import {CALLBACK_BUTTON} from '#/main/app/buttons'
import {trans} from '#/main/core/translation'

import {MODAL_RESOURCE_EXPLORER} from '#/main/core/resource/modals/explorer'

// TODO : make loaders work
// TODO : remove placeholder on selection cancel

/**
 * Opens a resource picker from a TinyMCE editor.
 */
function openResourcePicker(editor) {
  // We need to generate an anchor in the content to know where to put the resource we will pick.
  // For now, the resource picker will unmount the TinyMCE editor when shown in a modal
  // so we will loose the cursor position.
  const placeholder = `<span id="resource-picker-${makeId()}" style="display: none;">${trans('resource')}</span>`
  editor.insertContent(placeholder)

  editor.setProgressState(true)

  editor.settings.showModal(MODAL_RESOURCE_EXPLORER, {
    selectAction: (selected) => ({
      type: CALLBACK_BUTTON,
      callback: () => {
        selected.map((resourceNode, index) => {
          fetch(
            url(['claro_resource_embed', {type: resourceNode.meta.type, id: resourceNode.id}]), {
              credentials: 'include'
            })
            .then(response => {
              if (response.ok) {
                return response.text()
              }
            })
            .then(responseText => {
              // retrieve the editor which have requested the picker
              // ATTENTION : we don't reuse instance from func params because it could have been removed
              // when tinyMCE is rendered in a modal
              const initiator = tinymce.get(editor.id)
              if (initiator) {
                let content = initiator.getContent()

                const placeholderPosition = content.indexOf(placeholder)
                if (-1 !== placeholderPosition) {
                  // append resource
                  content = content.substr(0, placeholderPosition) + responseText + content.substr(placeholderPosition)

                  if (1 === selected.length || index + 1 === selected.length) {
                    // only one selected resource or appending the last one, we need to remove the placeholder
                    content = content.replace(placeholder, '')
                    initiator.setProgressState(false)
                  }

                  // replace content in editor
                  initiator.setContent(content)
                }
              }
            })
            .catch((error) => {
              // creates log error
              invariant(false, error.message)

              const initiator = tinymce.get(editor.id)
              if (initiator) {
                // displays generic error in ui
                initiator.notificationManager.open({type: 'error', text: trans('error_occured')})
                initiator.setProgressState(false)
              }
            })
        })
      }
    })
  })
}

// Register new plugin
tinymce.PluginManager.add('resource-picker', (editor) => {
  // provides an insert menu item
  editor.addMenuItem('resource-picker', {
    icon: 'resource-picker',
    text: trans('resource'),
    context: 'insert',
    onclick: () => openResourcePicker(editor)
  })

  // provides a toolbar button
  editor.addButton('resource-picker', {
    icon: 'resource-picker',
    tooltip: trans('resource'),
    onclick: () => openResourcePicker(editor)
  })
})
