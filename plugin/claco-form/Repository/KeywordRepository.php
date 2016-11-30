<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\ClacoFormBundle\Repository;

use Claroline\ClacoFormBundle\Entity\ClacoForm;
use Doctrine\ORM\EntityRepository;

class KeywordRepository extends EntityRepository
{
    public function findKeywordByNameExcludingId(ClacoForm $clacoForm, $name, $id)
    {
        $dql = '
            SELECT k
            FROM Claroline\ClacoFormBundle\Entity\Keyword k
            JOIN k.clacoForm c
            WHERE c = :clacoForm
            AND UPPER(k.name) = :name
            AND k.id != :id
        ';
        $query = $this->_em->createQuery($dql);
        $query->setParameter('clacoForm', $clacoForm);
        $upperName = strtoupper($name);
        $query->setParameter('name', $upperName);
        $query->setParameter('id', $id);

        return $query->getOneOrNullResult();
    }
}
