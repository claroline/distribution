/**
 * Open Question Controller
 * @param {FeedbackService} FeedbackService
 * @constructor
 */
var OpenQuestionCtrl = function OpenQuestionCtrl(FeedbackService) {
    AbstractQuestionCtrl.apply(this, arguments);
};

// Extends AbstractQuestionCtrl
OpenQuestionCtrl.prototype = Object.create(AbstractQuestionCtrl.prototype);

// Set up dependency injection (get DI from parent too)
OpenQuestionCtrl.$inject = AbstractQuestionCtrl.$inject;

/**
 * Answer of the student with highlighted keywords
 * @type {string}
 */
OpenQuestionCtrl.prototype.answerWithKeywords = '';

/**
 * Callback executed when Feedback for the Question is shown
 */
OpenQuestionCtrl.prototype.onFeedbackShow = function onFeedbackShow() {
    this.answerWithKeywords = this.answer ? this.answer : '';

    // Get EOL
    this.answerWithKeywords = this.answerWithKeywords.replace(/(\r\n|\n|\r)/gm, '<br/>');

    if ('long' !== this.question.typeOpen) {
        // Initialize answer with keywords
        // Search used keywords in student answer
        for (var i = 0; i < this.question.solutions.length; i++) {
            var solution = this.question.solutions[i];

            // Check in answer if the keyword as been used
            var searchFlags      = 'g' + (solution.caseSensitive ? 'i' : '');
            var searchExpression = new RegExp(solution.word, searchFlags);
            if (-1 !== this.answer.search(searchExpression)) {
                // Keyword has been found in answer => Update formatted answer
                var keyword = '';
                keyword += '<b class="text-success feedback-info" data-toggle="tooltip" title="' + solution.feedback + '">';
                keyword += solution.word;
                keyword += '<span class="fa fa-fw fa-check"></span>';
                keyword += '</b>';

                this.answerWithKeywords = this.answerWithKeywords.replace(searchExpression, keyword, searchFlags);
            }
        }
    }
};

// Register controller into AngularJS
angular
    .module('Question')
    .controller('OpenQuestionCtrl', OpenQuestionCtrl);