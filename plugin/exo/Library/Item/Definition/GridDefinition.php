<?php

namespace UJM\ExoBundle\Library\Item\Definition;

use JMS\DiExtraBundle\Annotation as DI;
use UJM\ExoBundle\Entity\ItemType\AbstractItem;
use UJM\ExoBundle\Entity\ItemType\GridQuestion;
use UJM\ExoBundle\Entity\Misc\Cell;
use UJM\ExoBundle\Entity\Misc\CellChoice;
use UJM\ExoBundle\Library\Attempt\CorrectedAnswer;
use UJM\ExoBundle\Library\Attempt\GenericPenalty;
use UJM\ExoBundle\Library\Attempt\GenericScore;
use UJM\ExoBundle\Library\Item\ItemType;
use UJM\ExoBundle\Library\Options\GridSumMode;
use UJM\ExoBundle\Serializer\Item\Type\GridQuestionSerializer;
use UJM\ExoBundle\Validator\JsonSchema\Attempt\AnswerData\GridAnswerValidator;
use UJM\ExoBundle\Validator\JsonSchema\Item\Type\GridQuestionValidator;

/**
 * Grid question definition.
 *
 * @DI\Service("ujm_exo.definition.question_grid")
 * @DI\Tag("ujm_exo.definition.item")
 */
class GridDefinition extends AbstractDefinition
{
    /**
     * @var GridQuestionValidator
     */
    private $validator;

    /**
     * @var GridAnswerValidator
     */
    private $answerValidator;

    /**
     * @var GridQuestionSerializer
     */
    private $serializer;

    /**
     * PairDefinition constructor.
     *
     * @param GridQuestionValidator  $validator
     * @param GridAnswerValidator    $answerValidator
     * @param GridQuestionSerializer $serializer
     *
     * @DI\InjectParams({
     *     "validator"       = @DI\Inject("ujm_exo.validator.question_grid"),
     *     "answerValidator" = @DI\Inject("ujm_exo.validator.answer_grid"),
     *     "serializer"      = @DI\Inject("ujm_exo.serializer.question_grid")
     * })
     */
    public function __construct(
        GridQuestionValidator $validator,
        GridAnswerValidator $answerValidator,
        GridQuestionSerializer $serializer)
    {
        $this->validator = $validator;
        $this->answerValidator = $answerValidator;
        $this->serializer = $serializer;
    }

    /**
     * Gets the grid question mime-type.
     *
     * @return string
     */
    public static function getMimeType()
    {
        return ItemType::GRID;
    }

    /**
     * Gets the grid question entity.
     *
     * @return string
     */
    public static function getEntityClass()
    {
        return '\UJM\ExoBundle\Entity\ItemType\GridQuestion';
    }

    /**
     * Gets the grid question validator.
     *
     * @return PairQuestionValidator
     */
    protected function getQuestionValidator()
    {
        return $this->validator;
    }

    /**
     * Gets the grid answer validator.
     *
     * @return PairAnswerValidator
     */
    protected function getAnswerValidator()
    {
        return $this->answerValidator;
    }

    /**
     * Gets the grid question serializer.
     *
     * @return PairQuestionSerializer
     */
    protected function getQuestionSerializer()
    {
        return $this->serializer;
    }

    /**
     * Used to compute the answer(s) score.
     *
     * @param GridQuestion $question
     * @param array        $answer
     *
     * @return CorrectedAnswer
     */
    public function correctAnswer(AbstractItem $question, $answer)
    {
        $scoreRule = json_decode($question->getQuestion()->getScoreRule());
        if ($scoreRule->type === 'fixed') {
            return $this->getCorrectAnswerForFixMode($question, $answer);
        } else {
            // 3 sum submode
            switch ($question->getSumMode()) {
              case GridSumMode::SUM_CELL:
                return $this->getCorrectAnswerForSumCellsMode($question, $answer);
              break;
              case GridSumMode::SUM_COLUMN:
                return $this->getCorrectAnswerForColumnSumMode($question, $answer);
              break;
              case GridSumMode::SUM_ROWS:
                return $this->getCorrectAnswerForRowSumMode($question, $answer);
              break;
            }
        }
    }

    /**
     * @param GridQuestion $question
     * @param array        $answer
     *
     * @return CorrectedAnswer
     */
    private function getCorrectAnswerForFixMode(AbstractItem $question, $answer)
    {
        $corrected = new CorrectedAnswer();
        if (!is_null($answer)) {
            foreach ($answer as $gridAnswer) {
                $cell = $question->getCell($gridAnswer->cellId);
                $choice = $cell->getChoice($gridAnswer->text);
                if (!empty($choice)) {
                    if ($choice->isExpected()) {
                        $corrected->addExpected($choice);
                    } else {
                        $corrected->addUnexpected($choice);
                    }
                } else {
                    // Retrieve the best answer for the cell
                  $corrected->addMissing($this->findCellExpectedAnswer($cell));
                }
            }
        } else {
            $cells = $question->getCells();
            foreach ($cells as $cell) {
                if (0 < count($cell->getChoices())) {
                    $corrected->addMissing($this->findCellExpectedAnswer($cell));
                }
            }
        }

        return $corrected;
    }

    /**
     * @param GridQuestion $question
     * @param array        $answer
     *
     * @return CorrectedAnswer
     */
    private function getCorrectAnswerForSumCellsMode(AbstractItem $question, $answer)
    {
        $corrected = new CorrectedAnswer();
        if (!is_null($answer)) {
            foreach ($answer as $gridAnswer) {
                $cell = $question->getCell($gridAnswer->cellId);
                $choice = $cell->getChoice($gridAnswer->text);
                if (!empty($choice)) {
                    if (0 < $choice->getScore()) {
                        $corrected->addExpected($choice);
                    } else {
                        $corrected->addUnexpected($choice);
                    }
                } else {
                    // Retrieve the best answer for the cell
                  $corrected->addMissing($this->findCellExpectedAnswer($cell));
                }
            }
        } else {
            $cells = $question->getCells();
            foreach ($cells as $cell) {
                if (0 < count($cell->getChoices())) {
                    $corrected->addMissing($this->findCellExpectedAnswer($cell));
                }
            }
        }

        return $corrected;
    }

    /**
     * @param GridQuestion $question
     * @param array        $answer
     *
     * @return CorrectedAnswer
     */
    private function getCorrectAnswerForRowSumMode(AbstractItem $question, $answer)
    {
        $corrected = new CorrectedAnswer();
        if (!is_null($answer)) {
            // correct answers per row
            for ($i = 0; $i < $question->getRows(); ++$i) {

                // get cells where there is at least 1 expected answer for the current row (none possible)
                $rowCellsUuids = array_map(function (Cell $cell) {
                    // only fill array with cells that own at least one expected answer
                    if ($cell->getCoordsY === $i && 0 < $cell->getChoices()) {
                        return $cell->getUuid();
                    }
                }, $question->getCells());

                // if any answer is needed in this row
                if (!empty($rowCellsUuids)) {
                    // score will be applied only if all expected answers are there and valid
                    $all = true;
                    foreach ($answer as $cellAnswer) {
                        if (in_array($cellAnswer->cellId, $rowCellsUuids)) {
                            $cell = $question->getCell($cellAnswer->cellId);
                            $choice = $cell->getChoice($cellAnswer->text);
                            // wrong or empty anwser -> score will not be applied
                            if (empty($choice) || (!empty($choice) && !$choice->isExpected())) {
                                $all = false;
                                break;
                            }
                        }
                    }

                    if ($all) {
                        $cell = $question->getCell($rowCellsUuids[0]);
                        $scoreToApply = $cell->getChoices()[0]->getScore();
                        $corrected->addExpected(new GenericScore($scoreToApply));
                    } else {
                        $corrected->addUnexpected(new GenericPenalty($question->getPenalty()));
                    }
                }
            }
        }

        return $corrected;
    }

    /**
     * @param GridQuestion $question
     * @param array        $answer
     *
     * @return CorrectedAnswer
     */
    private function getCorrectAnswerForColumnSumMode(AbstractItem $question, $answer)
    {
        $corrected = new CorrectedAnswer();
        if (!is_null($answer)) {
            // correct answers per row
            for ($i = 0; $i < $question->getColumns(); ++$i) {

                // get cells where there is at least 1 expected answers for the current column (none possible)
                $colCellsUuids = array_map(function (Cell $cell) {
                    // only fill array with awaited answer cells uuid
                    if ($cell->getCoordsX === $i && 0 < $cell->getChoices()) {
                        return $cell->getUuid();
                    }
                }, $question->getCells());

                // if any answer are needed in this row
                if (!empty($colCellsUuids)) {
                    // score will be applied only if all expected answers are valid
                    $all = true;
                    foreach ($answer as $cellAnswer) {
                        if (in_array($cellAnswer->cellId, $colCellsUuids)) {
                            $cell = $question->getCell($cellAnswer->cellId);
                            $choice = $cell->getChoice($cellAnswer->text);
                            // wrong or empty anwser -> score will not be applied
                            // wrong or empty anwser -> score will not be applied
                            if (empty($choice) || (!empty($choice) && !$choice->isExpected())) {
                                $all = false;
                                break;
                            }
                        }
                    }

                    if ($all) {
                        $cell = $question->getCell($colCellsUuids[0]);
                        $scoreToApply = $cell->getChoices()[0]->getScore();
                        $corrected->addExpected(new GenericScore($scoreToApply));
                    } else {
                        $corrected->addUnexpected(new GenericPenalty($question->getPenalty()));
                    }
                }
            }
        }

        return $corrected;
    }

    /**
     * Used to compute the question total score.
     *
     * @param GridQuestion $question
     *
     * @return array
     */
    public function expectAnswer(AbstractItem $question)
    {
        $expected = [];
        foreach ($question->getCells()->toArray() as $cell) {
            if (0 < count($cell->getChoices())) {
                $expected[] = $this->findCellExpectedAnswer($cell);
            }
        }

        return $expected;
    }

    public function getStatistics(AbstractItem $pairQuestion, array $answers)
    {
        // TODO: Implement getStatistics() method.

        return [];
    }

    /**
     * @param Cell $cell
     *
     * @return CellChoice|null
     */
    private function findCellExpectedAnswer(Cell $cell)
    {
        $best = null;
        foreach ($cell->getChoices() as $choice) {
            /** @var CellChoice $choice */
            if (empty($best) || $best->getScore() < $choice->getScore()) {
                $best = $choice;
            }
        }

        return $best;
    }
}
