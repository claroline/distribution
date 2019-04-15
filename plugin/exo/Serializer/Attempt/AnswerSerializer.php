<?php

namespace UJM\ExoBundle\Serializer\Attempt;

use Claroline\AppBundle\API\Serializer\SerializerTrait;
use JMS\DiExtraBundle\Annotation as DI;
use UJM\ExoBundle\Entity\Attempt\Answer;
use UJM\ExoBundle\Library\Options\Transfer;

/**
 * Serializer for answer data.
 *
 * @DI\Service("ujm_exo.serializer.answer")
 * @DI\Tag("claroline.serializer")
 */
class AnswerSerializer
{
    use SerializerTrait;

    /**
     * Converts an Answer into a JSON-encodable structure.
     *
     * @param Answer $answer
     * @param array  $options
     *
     * @return array
     */
    public function serialize(Answer $answer, array $options = [])
    {
        $serialized = [
            'id' => $answer->getUuid(),
            'questionId' => $answer->getQuestionId(),
            'tries' => $answer->getTries(),
            'usedHints' => array_map(function ($hintId) use ($options) {
                return $options['hints'][$hintId];
            }, $answer->getUsedHints()),
        ];

        if (!empty($answer->getData())) {
            $serialized['data'] = json_decode($answer->getData(), true);
        }
        // Adds user score
        if (in_array(Transfer::INCLUDE_USER_SCORE, $options)) {
            $serialized = array_merge($serialized, [
                'score' => $answer->getScore(),
                'feedback' => $answer->getFeedback(),
            ]);
        }

        return $serialized;
    }

    /**
     * Converts raw data into a Answer entity.
     *
     * @param array  $data
     * @param Answer $answer
     * @param array  $options
     *
     * @return Answer
     */
    public function deserialize($data, Answer $answer = null, array $options = [])
    {
        $answer = $answer ?: new Answer();

        $this->sipe('id', 'setUuid', $data, $answer);
        $this->sipe('questionId', 'setQuestionId', $data, $answer);
        $this->sipe('tries', 'setTries', $data, $answer);
        $this->sipe('score', 'setScore', $data, $answer);
        $this->sipe('feedback', 'setFeedback', $data, $answer);

        if (isset($data['usedHints'])) {
            foreach ($data['usedHints'] as $usedHint) {
                $answer->addUsedHint($usedHint['id']);
            }
        }
        if (!empty($data['data'])) {
            $answer->setData(json_encode($data['data']));
        }

        return $answer;
    }
}
