<?php

namespace UJM\ExoBundle\Transfer;

use Claroline\CoreBundle\Library\Transfert\Importer;
use Claroline\CoreBundle\Library\Transfert\RichTextInterface;
use JMS\DiExtraBundle\Annotation as DI;
use Ramsey\Uuid\Uuid;
use Symfony\Component\DependencyInjection\ContainerInterface;
use UJM\ExoBundle\Entity\Exercise;
use UJM\ExoBundle\Library\Options\Transfer;
use UJM\ExoBundle\Library\Options\Validation;
use UJM\ExoBundle\Library\Validator\ValidationException;

/**
 * @DI\Service("ujm_exo.importer.exercise")
 * @DI\Tag("claroline.importer")
 */
class ExerciseImporter extends Importer implements RichTextInterface
{
    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * ExerciseImporter constructor.
     *
     * @DI\InjectParams({
     *     "container" = @DI\Inject("service_container")
     * })
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function getName()
    {
        return 'ujm_exercise';
    }

    public function validate(array $data)
    {
        $errors = $this->container->get('ujm_exo.validator.exercise')
            ->validate(json_decode(json_encode($data['data']['quiz'])), [Validation::REQUIRE_SOLUTIONS]);

        if (!empty($errors)) {
            throw new ValidationException('Exercise : import data are not valid.', $errors);
        }
    }

    public function import(array $data)
    {
        // Create the exercise entity
        // The rest of the structure will be created at the same time than the rich texts
        // Because this will not be possible to retrieves created entities as all ids are re-generated
        $exercise = new Exercise();
        $exercise->setUuid($data['data']['id']);

        return $exercise;
    }

    public function format($data)
    {
        $quizData = json_decode(json_encode($data['quiz']));

        // Replace rich texts in quiz definition
        $this->setText($quizData, 'description');

        array_walk($quizData->steps, function (\stdClass $step) {
            $this->setText($step, 'description');
            array_walk($step->items, function (\stdClass $item) {
                $this->setText($item, 'content');
                $this->setText($item, 'description');

                if ($item->hints) {
                    array_walk($item->hints, function (\stdClass $hint) {
                        $this->setText($hint, 'value');
                    });
                }
            });
        });

        // Retrieve the new exercise
        $exercise = $this->container->get('claroline.persistence.object_manager')
            ->getRepository('UJMExoBundle:Exercise')
            ->findOneBy([
                'uuid' => $data['id'],
            ]);

        // Create entities from import data
        // It uses id generated by the server for data creation to avoid duplicates uuids
        $this->container->get('ujm_exo.manager.exercise')->createCopy($quizData, $exercise);
    }

    public function export($workspace, array &$files, $exercise)
    {
        $exerciseData = $this->container->get('ujm_exo.serializer.exercise')->serialize($exercise, [Transfer::INCLUDE_SOLUTIONS]);

        // Extracts content texts
        $this->dumpText($exerciseData, 'description', $files);

        // Changes questions ids to avoid possible conflicts at import
        array_walk($exerciseData->steps, function (\stdClass $step) use (&$files) {
            $this->dumpText($step, 'description', $files);

            array_walk($step->items, function (\stdClass $item) use (&$files) {
                $item->id = Uuid::uuid4()->toString();
                $this->dumpText($item, 'content', $files);
                $this->dumpText($item, 'description', $files);

                if ($item->hints) {
                    array_walk($item->hints, function (\stdClass $hint) use (&$files) {
                        $this->dumpText($hint, 'value', $files);
                    });
                }
            });
        });

        return [
            // The id will be used to retrieve the imported entity to replace the HTML contents
            'id' => Uuid::uuid4()->toString(),
            // YML which will receive the quiz structure can not handle stdClasses (he prefers associative arrays)
            // So we do some ugly encoding/decoding to give him what he wants
            'quiz' => json_decode(json_encode($exerciseData), true),
        ];
    }

    private function dumpText(\stdClass $object, $property, array &$files)
    {
        $uid = null;
        if (!empty($object->{$property})) {
            $uid = uniqid().'.txt';
            $tmpPath = $this->container->get('claroline.config.platform_config_handler')->getParameter('tmp_dir').DIRECTORY_SEPARATOR.$uid;
            file_put_contents($tmpPath, $object->{$property});
            $files[$uid] = $tmpPath;
            $object->{$property} = $uid;
        }
    }

    private function setText(\stdClass $object, $property)
    {
        if (!empty($object->{$property})) {
            $textPath = $this->getRootPath().DIRECTORY_SEPARATOR.$object->{$property};
            $text = file_get_contents($textPath);
            $object->{$property} = $this->container->get('claroline.importer.rich_text_formatter')->format($text);
        }
    }
}
