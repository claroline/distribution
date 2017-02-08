/* global ResourceManagerFilters */
/* global Twig */

import Backbone from 'backbone'
import 'bootstrap-datepicker'

export default Backbone.View.extend({
  className: 'filters container-fluid',
  events: {
    'click button.close-panel': 'toggle',
    'click input.datepicker': 'openDatePicker',
    'changeDate input.datepicker': 'closeDatePicker',
    'keydown input.datepicker': 'closeDatePicker'
  },
  initialize: function(parameters) {
    this.parameters = parameters
    this.isVisible = false
    this.$el.css('display', 'none')
  },
  toggle: function() {
    this.isVisible = !this.isVisible
    this.$el.css('display', this.isVisible ? 'block' : 'none')
  },
  close: function() {
    if (this.isVisible) {
      this.$el.css('display', 'none')
    }
  },
  openDatePicker: function(event) {
    this.$(event.currentTarget).datepicker('show')
  },
  closeDatePicker: function(event) {
    event.preventDefault()
    this.$(event.currentTarget).datepicker('hide')
  },
  getParameters: function() {
    var parameters = {}
    var dateFrom = this.$('input.date-from').first().val()
    var dateTo = this.$('input.date-to').first().val()
    var types = this.$('select.node-types').val()

    if (dateFrom) {
      parameters.dateFrom = dateFrom + ' 00:00:00'
    }

    if (dateTo) {
      parameters.dateTo = dateTo + ' 23:59:59'
    }

    if (types) {
      parameters.types = types
    }

    return parameters
  },
  render: function() {
    this.$el.html(Twig.render(ResourceManagerFilters, {
      language: this.parameters.language,
      resourceTypes: this.parameters.resourceTypes
    }))
  }
})
