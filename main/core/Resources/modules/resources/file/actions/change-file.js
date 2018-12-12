import {MODAL_BUTTON} from '#/main/app/buttons'

import {trans} from '#/main/app/intl/translation'
import {MODAL_FILE_FORM} from '#/main/core/resources/file/modals/form'

export default (resourceNodes) => ({
  name: 'change_file',
  type: MODAL_BUTTON,
  icon: 'fa fa-fw fa-exchange-alt',
  label: trans('change_file', {}, 'resource'),
  modal: [MODAL_FILE_FORM, {
    resourceNode: resourceNodes[0]
  }]
})
