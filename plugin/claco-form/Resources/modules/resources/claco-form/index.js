import React from 'react'
import {
  hashHistory as history,
  HashRouter as Router
} from 'react-router-dom'
import {bootstrap} from '#/main/core/utilities/app/bootstrap'
import {registerModalTypes} from '#/main/core/layout/modal'
import {reducer as modalReducer}    from '#/main/core/layout/modal/reducer'
import {reducer as resourceNodeReducer} from '#/main/core/layout/resource/reducer'
import {
  resourceReducers,
  mainReducers,
  parametersReducers,
  messageReducers
} from './reducers'
import {categoryReducers} from './editor/category/reducers'
import {keywordReducers} from './editor/keyword/reducers'
import {fieldReducers} from './editor/field/reducers'
import {ClacoFormResource} from './components/claco-form-resource.jsx'
import {CategoryFormModal} from './editor/category/components/category-form-modal.jsx'
import {KeywordFormModal} from './editor/keyword/components/keyword-form-modal.jsx'
import {FieldFormModal} from './editor/field/components/field-form-modal.jsx'

// mount the react application
bootstrap(
  // app DOM container (also holds initial app data as data attributes)
  '.claco-form-container',

  // app main component (accepts either a `routedApp` or a `ReactComponent`)
  () => React.createElement(Router, {
    history: history
  }, React.createElement(ClacoFormResource)),

  // app store configuration
  {
    // app reducers
    user: mainReducers,
    resource: resourceReducers,
    canEdit: mainReducers,
    isAnon: mainReducers,
    canGeneratePdf: mainReducers,
    parameters: parametersReducers,
    categories: categoryReducers,
    keywords: keywordReducers,
    fields: fieldReducers,
    cascadeLevelMax: mainReducers,
    message: messageReducers,

    // generic reducers
    resourceNode: resourceNodeReducer,
    modal: modalReducer
  },

  // transform data attributes for redux store
  (initialData) => {
    const resourceNode = initialData.resourceNode
    const resource = initialData.resource

    return {
      user: initialData.user,
      resource: resource,
      resourceNode: resourceNode,
      canEdit: resourceNode.rights.current.edit,
      isAnon: !initialData.user,
      canGeneratePdf: initialData.canGeneratePdf === 1,
      parameters: Object.assign({}, resource.details, {'activePanelKey': ''}),
      categories: resource.categories,
      keywords: resource.keywords,
      fields: initialData.fields,
      cascadeLevelMax: initialData.cascadeLevelMax
    }
  }
)

registerModalTypes([
  ['MODAL_CATEGORY_FORM', CategoryFormModal],
  ['MODAL_KEYWORD_FORM', KeywordFormModal],
  ['MODAL_FIELD_FORM', FieldFormModal]
])
