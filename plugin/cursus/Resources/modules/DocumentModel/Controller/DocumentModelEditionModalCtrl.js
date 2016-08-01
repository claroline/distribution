/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global Routing*/
/*global Translator*/

export default class DocumentModelEditionModalCtrl {
  constructor($http, $uibModalInstance, CourseService, title, model, callback) {
    this.$http = $http
    this.$uibModalInstance = $uibModalInstance
    this.title = title
    this.source = model
    this.callback = callback
    this.documentModel = {
      name: null,
      content: null,
      documentType: null
    }
    this.documentModelErrors = {
      name: null,
      content: null,
      documentType: null
    }
    this.documentTypes = [
      {name: Translator.trans('session_invitation', {}, 'cursus'), value: 0},
      {name: Translator.trans('session_event_invitation', {}, 'cursus'), value: 1},
      {name: Translator.trans('session_certificate', {}, 'cursus'), value: 2}
    ]
    this.documentType = null
    this.tinymceOptions = CourseService.getTinymceConfiguration()
    this.initializeDocumentModel()
  }

  initializeDocumentModel () {
    this.documentModel['name'] = this.source['name']
    this.documentModel['content'] = this.source['content']
    this.documentModel['documentType'] = this.source['documentType']

    const selectedType = this.documentTypes.find(dt => dt['value'] === this.source['documentType'])
    this.documentType = selectedType

  }

  submit () {
    this.resetErrors()

    if (!this.documentModel['name']) {
      this.documentModelErrors['name'] = Translator.trans('form_not_blank_error', {}, 'cursus')
    }

    if (!this.documentModel['content']) {
      this.documentModelErrors['content'] = Translator.trans('form_not_blank_error', {}, 'cursus')
    }

    if (!this.documentType) {
      this.documentModelErrors['documentType'] = Translator.trans('form_not_blank_error', {}, 'cursus')
      this.documentModel['documentType'] = null
    } else {
      this.documentModel['documentType'] = this.documentType['value']
    }

    if (this.isValid()) {
      const url = Routing.generate('api_put_cursus_document_model_edition', {documentModel: this.source['id']})
      this.$http.put(url, {documentModelDatas: this.documentModel}).then(d => {
        this.callback(d['data'])
        this.$uibModalInstance.close()
      })
    }
  }

  resetErrors () {
    for (const key in this.documentModelErrors) {
      this.documentModelErrors[key] = null
    }
  }

  isValid () {
    let valid = true

    for (const key in this.documentModelErrors) {
      if (this.documentModelErrors[key]) {
        valid = false
        break
      }
    }

    return valid
  }
}
