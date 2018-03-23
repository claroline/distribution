<?php

namespace Claroline\CoreBundle\API\Transfer\Action\User;

use Claroline\AppBundle\API\Crud;
use Claroline\AppBundle\API\Transfer\Action\AbstractAction;
use Claroline\AppBundle\API\ValidatorProvider;
use Claroline\AppBundle\Persistence\ObjectManager;
use JMS\DiExtraBundle\Annotation as DI;

//todo add "*" to unlock this

/**
 * @DI\Service()
 * @DI\Tag("claroline.transfer.action")
 */
class Edit extends AbstractAction
{
    /**
     * Action constructor.
     *
     * @DI\InjectParams({
     *     "crud" = @DI\Inject("claroline.api.crud")
     * })
     *
     * @param Crud $crud
     */
    public function __construct(Crud $crud)
    {
        $this->crud = $crud;
    }

    public function execute(array $data)
    {
        $this->crud->update('Claroline\CoreBundle\Entity\User', $data);
    }

    public function getSchema()
    {
        return ['$root' => 'Claroline\CoreBundle\Entity\User'];
    }

    public function getMode()
    {
        return ValidatorProvider::UPDATE;
    }

    /**
     * return an array with the following element:
     * - section
     * - action
     * - action name.
     */
    public function getAction()
    {
        return ['user', 'edit'];
    }

    public function getBatchSize()
    {
        return 100;
    }

    public function clear(ObjectManager $om)
    {
    }
}
