import {trans} from '#/main/app/intl/translation'

import {RuleInput} from '#/plugin/open-badge/tools/badges/data/types/rule/components/inpunt'

// todo implements Search
// todo implements render()
// todo implements parse()
// todo implements validate()

const dataType = {
  name: 'rule',
  meta: {
    icon: 'fa fa-fw fa-calendar',
    label: trans('rule'),
    description: trans('rule')
  },

  /**
   * Validates input value for a date range.
   *
   * @param {string} value
   *
   * @return {boolean}
   */
  validate: () => {
    // it's an array of strings
    // it contains two valid dates or null
    // start < end
  },

  components: {
    input: RuleInput
  }
}

export {
  dataType
}
