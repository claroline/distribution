/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*global Translator*/

export default class EntriesManagementCtrl {
  constructor (NgTableParams, ClacoFormService, EntryService, FieldService) {
    this.ClacoFormService = ClacoFormService
    this.EntryService = EntryService
    this.FieldService = FieldService
    this.config = ClacoFormService.getResourceDetails()
    this.fields = FieldService.getFields()
    this.entries = EntryService.getEntries()
    this.tableParams = new NgTableParams(
      {count: 20},
      {counts: [10, 20, 50, 100], dataset: this.entries}
    )
    this.columns = {
      title: {name: Translator.trans('title', {}, 'platform'), value: true},
      creationDateString: {name: Translator.trans('date', {}, 'platform'), value: true},
      userString: {name: Translator.trans('user', {}, 'platform'), value: true}
    }
    this.columnsKeys = ['title', 'creationDateString', 'userString']
    this.fieldsColumns = [
      {id: 'alert', sortable: 'alert'},
      {id: 'title', title: Translator.trans('title', {}, 'platform'), filter: {title: 'text'}, sortable: 'title'},
      {id: 'creationDateString', title: Translator.trans('date', {}, 'platform'), filter: {creationDateString: 'text'}, sortable: 'creationDateString'},
      {id: 'userString', title: Translator.trans('user', {}, 'platform'), filter: {userString: 'text'}, sortable: 'userString'},
    ]
    this._updateEntryCallback = this._updateEntryCallback.bind(this)
    this._removeEntryCallback = this._removeEntryCallback.bind(this)
    this.initialize()
  }

  _updateEntryCallback (data) {
    this.EntryService._updateEntryCallback(data)
    this.tableParams.reload()
  }

  _removeEntryCallback (data) {
    this.EntryService._removeEntryCallback(data)
    this.tableParams.reload()
  }

  initialize () {
    this.ClacoFormService.clearSuccessMessage()
    this.fields.forEach(f => {
      if (!f['isMetadata']) {
        const id = f['id']
        this.columns[id] = {name: f['name'], value: false}
        this.columnsKeys.push(id)
        let data = {id: id, title: f['name']}

        if (f['type'] === 3) {
          data['sortable'] = `${id}`
        } else {
          data['sortable'] = `field_${id}`
        }

        if (f['searchable']) {
          data['filter'] = {['field_' + id]: 'text'}
        }
        this.fieldsColumns.push(data)
      }
    })

    if (this.canEdit() || (!this.isAnon() && this.config['edition_enabled'])) {
      this.columns['actions'] = {name: Translator.trans('actions', {}, 'platform'), value: true}
      this.columnsKeys.push('actions')
      this.fieldsColumns.push({id: 'actions', title: Translator.trans('actions', {}, 'platform')})
    }
  }

  isAnon () {
    return this.ClacoFormService.getIsAnon()
  }

  canEdit () {
    return this.ClacoFormService.getCanEdit()
  }

  getStatusClass (status) {
    let statusClass = ''

    if (status === 0) {
      statusClass = 'pending-entry-row'
    } else if (status === 2) {
      statusClass = 'unpublished-entry-row'
    }

    return statusClass
  }

  getDisplayedColumns () {
    let columns = []

    this.fieldsColumns.forEach(fc => {
      if (fc['id'] === 'alert') {
        columns.push(fc)
      } else {
        if (this.columns[fc['id']]['value']) {
          columns.push(fc)
        }
      }
    })

    return columns
  }

  deleteEntry (entry) {
    this.EntryService.deleteEntry(entry, this._removeEntryCallback)
  }

  changeEntryStatus (entry) {
    this.EntryService.changeEntryStatus(entry, this._updateEntryCallback)
  }
}