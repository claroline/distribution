
import angular from 'angular/index'

/**
 * PaperService
 */
export default class PaperService {
  /**
   * Constructor.
   *
   * @param {Object}           $http
   * @param {Object}           $q
   * @param {ExerciseService}  ExerciseService
   * @param {StepService}      StepService
   * @param {QuestionService}  QuestionService
   * @param {Function}         url
   */
  constructor($http, $q, ExerciseService, StepService, QuestionService, url) {
    this.$http           = $http;
    this.$q              = $q;
    this.ExerciseService = ExerciseService;
    this.StepService     = StepService;
    this.QuestionService = QuestionService;
    this.UrlService = url

    /**
     * Contains the Paper to display.
     *
     * @type {{paper: object, questions: object}}
     */
    this.current = null

    /**
     * Number of papers already done for the current Exercise.
     *
     * @type {number}
     */
    this.nbPapers = 0

    /**
     * Disable sending papers to server.
     *
     * @type {boolean}
     */
    this.noSaveMode = false
  }

  /**
   * Is server save enabled ?
   *
   * @returns {boolean}
   */
  isNoSaveMode() {
    return this.noSaveMode
  }

  /**
   * Disable / Enable server save
   *
   * @param {boolean} noSaveMode
   */
  setNoSaveMode(noSaveMode) {
    this.noSaveMode = noSaveMode

    return this
  }

  /**
   * Get number of Papers.
   *
   * @returns {number}
   */
  getNbPapers() {
    return this.nbPapers
  }

  /**
   * Set number of Papers.
   *
   * @param {number} count
   *
   * @returns {PaperService}
   */
  setNbPapers(count) {
    this.nbPapers = count ? parseInt(count) : 0

    return this
  }

  /**
   * Get the paper to display.
   * (if we don't change current paper, it's loaded from memory, else we call the server to load it)
   *
   * @param   {String} id
   *
   * @returns {Promise}
   */
  getCurrent(id) {
    const deferred = this.$q.defer()

    if (!this.current || !this.current.paper || id !== this.current.paper.id) {
      // We need to load the paper from the server
      this.$http
        .get(this.UrlService('exercise_export_paper', { id: id }))
        .success(response => {
          this.current = response

          deferred.resolve(this.current)
        })
        .error(() => {
          deferred.reject([])
        })
    } else {
      // Send the current loaded paper
      deferred.resolve(this.current)
    }

    return deferred.promise
  }

  /**
   * Manually set the current paper.
   */
  setCurrent(current) {
    this.current = current
  }

  /**
   * Get all papers for an Exercise.
   *
   * @returns {Promise}
   */
  getAll() {
    const exercise = this.ExerciseService.getExercise()
    const deferred = this.$q.defer()

    this.$http
      .get(this.UrlService('exercise_papers', { id: exercise.id }))
      .success(response => {
        this.setNbPapers(response.length)

        deferred.resolve(response)
      })
      .error(() => {
        deferred.reject([])
      })

    return deferred.promise;
  }

  /**
   * Get Paper for a Question.
   *
   * @param {Object} paper
   * @param {Object} question
   */
  getQuestionPaper(paper, question) {
    let questionPaper = null

    for (let i = 0; i < paper.questions.length; i++) {
      if (paper.questions[i].id === question.id) {
        // Question paper found
        questionPaper = paper.questions[i]
        break
      }
    }

    if (null === questionPaper) {
      // There is no Paper for the current Question => initialize Object properties
      questionPaper = {
        id     : question.id,
        answer : null,
        score  : 0,
        nbTries: 0,
        hints  : []
      }

      paper.questions.push(questionPaper)
    }

    return questionPaper
  }

  /**
   * Delete all papers of an Exercise
   */
  deleteAll(papers) {
    const exercise = this.ExerciseService.getExercise()
    const deferred = this.$q.defer()

    this.$http
      .delete(this.UrlService('ujm_exercise_delete_papers', { id: exercise.id }))
      .success(response => {
        papers.splice(0, papers.length) // Empty the Papers list

        this.setNbPapers(0)

        deferred.resolve(response)
      })
      .error(() => {
        deferred.reject([])
      });

    return deferred.promise
  }

  /**
   * Check whether a paper need manual correction.
   *
   * @param {Object} paper
   *
   * @returns {Boolean}
   */
  needManualCorrection(paper) {
    var needed = false
    if (paper.questions && 0 !== paper.questions.length) {
      for(let i = 0; i < paper.questions.length; i++){
        if (-1 === paper.questions[i].score) {
          // The question has not been marked
          needed = true
          break // Stop searching
        }
      }
    }

    return needed
  }

  /**
   * Save the score for a question
   */
  saveScore(question, score) {
    const deferred = this.$q.defer();
    this.$http
      .put(this.UrlService('exercise_save_score', { id: this.current.paper.id, questionId: question.id, score: score }))
      .success((response) => {
        // Update paper instance
        angular.merge(this.current.paper, response)

        deferred.resolve(response)
      })
      .error(() => {
        deferred.reject([])
      })

    return deferred.promise
  }

  /**
   * Calculate the score of the Paper (/20)
   * @param   {Object} paper
   * @param   {Array} questions
   * @returns {number}
   */
  getPaperScore(paper, questions) {
    let score = 0.0 // final score
    let scoreTotal = 0

    for (let i = 0; i < questions.length; i++) {
      if (questions[i].scoreTotal) {
        scoreTotal += questions[i].scoreTotal
      }
    }

    let userScore = paper.scoreTotal
    if (userScore) {
      score = userScore * 20 / scoreTotal
      if (userScore > 0) {
        score = Math.round(score / 0.5) * 0.5
      } else {
        score = 0
      }
    }

    return score
  }

  calculateScore(paper) {
    for (let i = 0; i < paper.questions.length; i++) {
      this.calculateQuestionScore(paper.questions[i])
    }
  }

  calculateQuestionScore(questionPaper) {
    let item = this.ExerciseService.getItem(questionPaper.id)
    if (item) {
      this.QuestionService.calculateScore(item, questionPaper)
    }
  }

  /**
   * Order the Questions of a Step
   * @param   {Object} paper
   * @param   {Array}  questions
   * @returns {Array}
   */
  orderQuestions(paper, questions) {
    var ordered = [];

    if (paper && paper.order) {
      for (var i = 0; i < paper.order.length; i++) {
        var stepOrder = paper.order[i];
        for (var j = 0; j < stepOrder.items.length; j++) {
          var item = stepOrder.items[j];
          var question = this.QuestionService.getQuestion(questions, item);
          if (question) {
            ordered.push(question);
          }
        }
      }
    }

    return ordered;
  };

  /**
   * Order the Questions of a Step
   * @param   {Object} paper
   * @param   {Object} step
   * @returns {Array} The ordered list of Questions
   */
  orderStepQuestions(paper, step) {
    let ordered = [];
    if (step.items && 0 !== step.items.length) {
      // Get order for the current Step
      let itemsOrder = null;
      if (paper && paper.order) {
        for (let i = 0; i < paper.order.length; i++) {
          if (step.id === paper.order[i].id) {
            // Order for the current step found
            itemsOrder = paper.order[i].items;
            break; // Stop searching
          }
        }
      }

      if (itemsOrder) {
        for (let i = 0; i < itemsOrder.length; i++) {
          var question = this.StepService.getQuestion(step, itemsOrder[i]);
          if (question) {
            ordered.push(question);
          }
        }
      } else {
        ordered = step.items;
      }
    }

    return ordered;
  }

  /**
   * Get Exercise Metadata
   */
  getExerciseMeta() {
    const exercise = this.ExerciseService.getExercise()

    return exercise.meta
  }
}
