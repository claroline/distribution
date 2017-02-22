<?php

namespace UJM\ExoBundle\Validator\JsonSchema\Item\Type;

use JMS\DiExtraBundle\Annotation as DI;
use UJM\ExoBundle\Library\Validator\JsonSchemaValidator;

/**
 * @DI\Service("ujm_exo.validator.item_video_content")
 */
class VideoContentItemValidator extends JsonSchemaValidator
{
    public function getJsonSchemaUri()
    {
        return 'question/video-content/schema.json';
    }

    public function validateAfterSchema($question, array $options = [])
    {
        return [];
    }

    /**
     * Validates the solution of the question.
     * Sends the keywords collection to the keyword validator.
     *
     * @param \stdClass $question
     *
     * @return array
     */
    protected function validateSolutions(\stdClass $question)
    {
        return [];
    }
}
