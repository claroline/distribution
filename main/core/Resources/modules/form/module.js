import 'angular/angular.min'
import translation from 'angular-ui-translation/angular-translation'

import './Field/Checkbox/module'
import './Field/Checkboxes/module'
import './Field/Select/module'
import './Field/Text/module'
import './Field/Radio/module'
import './Field/Number/module'
import './Field/Country/module'

import FormDirective from './FormDirective'
import FormBuilderService from './FormBuilderService'
import FieldDirective from './FieldDirective'

angular.module('FormBuilder', [
  'ui.translation',
  'FieldCheckbox',
  'FieldCheckboxes',
  'FieldSelect',
  'FieldText',
  'FieldRadio',
  'FieldNumber',
  'FieldCountry'
])
  .directive('formbuilder', () => new FormDirective)
  .directive('formField', () => new FieldDirective)
  .service('FormBuilderService', FormBuilderService)
