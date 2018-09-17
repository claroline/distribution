<?php

namespace Claroline\CoreBundle\API\Transfer\Action\Workspace;

use Claroline\AppBundle\API\Transfer\Action\AbstractCreateAction;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * @DI\Service()
 * @DI\Tag("claroline.transfer.action")
 */
class Delete extends AbstractCreateAction
{
    public function getClass()
    {
        return 'Claroline\CoreBundle\Entity\Workspace\Workspace';
    }

    public function getAction()
    {
        return ['workspace', self::MODE_DELETE];
    }
}
