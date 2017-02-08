/**
 * Form module
 */

import angular from 'angular'

import DurationFieldDirective from './Directive/DurationFieldDirective'
import FieldValidationDirective from './Directive/FieldValidationDirective'

angular
  .module('Form', [])
  .directive('durationField', [
    () => new DurationFieldDirective
  ])
  .directive('fieldValidation', [
    () => new FieldValidationDirective
  ])
