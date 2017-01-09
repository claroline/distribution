<?php

namespace UJM\ExoBundle\Repository;

use Doctrine\ORM\EntityRepository;
use UJM\ExoBundle\Entity\Exercise;

/**
 * ExerciseRepository.
 */
class ExerciseRepository extends EntityRepository
{
    /**
     * Lists scores obtained to an exercise.
     *
     * @param Exercise $exercise
     *
     * @return array
     */
    public function findScores(Exercise $exercise)
    {
    }

    public function invalidateUnfinishedPapers(Exercise $exercise)
    {
        return $this->getEntityManager()
            ->createQuery('
                UPDATE paper AS p 
                SET p.invalidated = :invalidated 
                WHERE p.exercise = :exercise 
                  AND p.invalidated = false
                  AND p.end IS NULL
            ')
            ->setParameters([
                'exercise' => $exercise,
                'invalidated' => true,
            ]);
    }
}
