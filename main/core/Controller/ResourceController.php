<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Controller;

use Buzz\Message\Request;
use Claroline\CoreBundle\Entity\Resource\ResourceNode;
use Claroline\CoreBundle\Manager\Resource\ResourceActionManager;
use Claroline\CoreBundle\Security\PermissionCheckerTrait;
use JMS\DiExtraBundle\Annotation as DI;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as EXT;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @EXT\Route("/resources", options={"expose"=true})
 */
class ResourceController
{
    use PermissionCheckerTrait;

    /** @var ResourceActionManager */
    private $actionManager;

    /**
     * ResourceController constructor.
     *
     * @DI\InjectParams({
     *     "actionManager" = @DI\Inject("claroline.manager.resource_action")
     * })
     *
     * @param ResourceActionManager $actionManager
     */
    public function __construct(
        ResourceActionManager $actionManager)
    {
        $this->actionManager = $actionManager;
    }

    /**
     * Executes an action an one resource.
     *
     * @EXT\Route("/{action}/{id}", name="claro_resource_action_short")
     * @EXT\Route("/{resourceType}/{action}/{id}", name="claro_resource_action")
     *
     * @param Request      $request
     * @param ResourceNode $resourceNode
     * @param string       $action
     */
    public function singleAction(Request $request, ResourceNode $resourceNode, $action)
    {
        // retrieves the action
        $resourceAction = $this->actionManager->get($resourceNode, $action);
        if (empty($resourceAction)) {
            // undefined action
            throw new NotFoundHttpException(
                sprintf('The action % does not exist.', $action)
            );
        }

        // checks current user rights
        //$this->checkPermission($resourceAction->getMask(), $resourceNode, [], true);

        // dispatches action event

        // grab and return response
    }

    public function bulkAction(Request $request)
    {

    }
}
