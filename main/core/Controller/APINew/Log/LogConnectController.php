<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Controller\APINew\Log;

use Claroline\AppBundle\API\FinderProvider;
use Claroline\CoreBundle\Entity\Log\Connection\LogConnectPlatform;
use Claroline\CoreBundle\Entity\Log\Connection\LogConnectResource;
use Claroline\CoreBundle\Entity\Log\Connection\LogConnectWorkspace;
use Claroline\CoreBundle\Entity\Organization\Organization;
use Claroline\CoreBundle\Entity\Resource\ResourceNode;
use Claroline\CoreBundle\Entity\User;
use Claroline\CoreBundle\Entity\Workspace\Workspace;
use Claroline\CoreBundle\Manager\LogConnectManager;
use Claroline\CoreBundle\Manager\ToolManager;
use JMS\DiExtraBundle\Annotation as DI;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as EXT;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * @EXT\Route("/log_connect")
 */
class LogConnectController
{
    /** @var AuthorizationCheckerInterface */
    private $authorization;

    /** @var FinderProvider */
    private $finder;

    /** @var LogConnectManager */
    private $logConnectManager;

    /** @var ToolManager */
    private $toolManager;

    /**
     * CourseController constructor.
     *
     * @DI\InjectParams({
     *     "authorization"     = @DI\Inject("security.authorization_checker"),
     *     "finder"            = @DI\Inject("claroline.api.finder"),
     *     "logConnectManager" = @DI\Inject("claroline.manager.log_connect"),
     *     "toolManager"       = @DI\Inject("claroline.manager.tool_manager")
     * })
     *
     * @param AuthorizationCheckerInterface $authorization
     * @param FinderProvider                $finder
     * @param LogConnectManager             $logConnectManager
     * @param ToolManager                   $toolManager
     */
    public function __construct(
        AuthorizationCheckerInterface $authorization,
        FinderProvider $finder,
        LogConnectManager $logConnectManager,
        ToolManager $toolManager
    ) {
        $this->authorization = $authorization;
        $this->finder = $finder;
        $this->logConnectManager = $logConnectManager;
        $this->toolManager = $toolManager;
    }

    public function getName()
    {
        return 'log_connect_platform';
    }

    /**
     * @EXT\Route(
     *     "/platform/list",
     *     name="apiv2_log_connect_platform_list"
     * )
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     *
     * @param User    $user
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function logConnectPlatformListAction(User $user, Request $request)
    {
        $this->checkAdminToolAccess();
        $isAdmin = $this->authorization->isGranted('ROLE_ADMIN');
        $hiddenFilters = $isAdmin ?
            [] :
            ['hiddenFilters' => [
                'organizations' => array_map(function (Organization $organization) {
                    return $organization->getUuid();
                }, $user->getAdministratedOrganizations()->toArray()),
            ]];

        return new JsonResponse(
            $this->finder->search(LogConnectPlatform::class, array_merge(
                $request->query->all(),
                $hiddenFilters
            ))
        );
    }

    /**
     * @EXT\Route(
     *     "/platform/csv",
     *     name="apiv2_log_connect_platform_list_csv"
     * )
     * @EXT\Method("GET")
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     *
     * @param User    $user
     * @param Request $request
     *
     * @return StreamedResponse
     */
    public function logConnectPlatformListCsvAction(User $user, Request $request)
    {
        $this->checkAdminToolAccess();
        $isAdmin = $this->authorization->isGranted('ROLE_ADMIN');
        $query = $request->query->all();
        $filters = isset($query['filters']) ? $query['filters'] : [];
        $sortBy = null;

        if (isset($query['sortBy'])) {
            $direction = '-' === substr($query['sortBy'], 0, 1) ? -1 : 1;
            $property = 1 === $direction ? $query['sortBy'] : substr($query['sortBy'], 1);
            $sortBy = ['property' => $property, 'direction' => $direction];
        }
        if (!$isAdmin) {
            $filters['organizations'] = array_map(function (Organization $organization) {
                return $organization->getUuid();
            }, $user->getAdministratedOrganizations()->toArray());
        }
        $downloadDate = date('Y-m-d_H-i-s');

        return new StreamedResponse(function () use ($filters, $sortBy) {
            $this->logConnectManager->exportConnectionsToCsv(LogConnectPlatform::class, $filters, $sortBy);
        }, 200, [
            'Content-Type' => 'application/force-download',
            'Content-Disposition' => 'attachment; filename="connection_time_platform_'.$downloadDate.'.csv"',
        ]);
    }

    /**
     * @EXT\Route(
     *     "/workspace/{workspace}/list",
     *     name="apiv2_log_connect_workspace_list"
     * )
     * @EXT\ParamConverter(
     *     "workspace",
     *     class="ClarolineCoreBundle:Workspace\Workspace",
     *     options={"mapping": {"workspace": "id"}}
     * )
     *
     * @param Workspace $workspace
     * @param Request   $request
     *
     * @return JsonResponse
     */
    public function logConnectWorkspaceListAction(Workspace $workspace, Request $request)
    {
        $this->checkWorkspaceToolAccess($workspace);

        return new JsonResponse(
            $this->finder->search(LogConnectWorkspace::class, array_merge(
                $request->query->all(),
                [
                    'hiddenFilters' => [
                        'workspace' => $workspace->getUuid(),
                    ],
                ]
            ))
        );
    }

    /**
     * @EXT\Route(
     *     "/workspace/{workspace}/csv",
     *     name="apiv2_log_connect_workspace_list_csv"
     * )
     * @EXT\Method("GET")
     * @EXT\ParamConverter(
     *     "workspace",
     *     class="ClarolineCoreBundle:Workspace\Workspace",
     *     options={"mapping": {"workspace": "id"}}
     * )
     *
     * @param Workspace $workspace
     * @param Request   $request
     *
     * @return StreamedResponse
     */
    public function logConnectWorkspaceListCsvAction(Workspace $workspace, Request $request)
    {
        $this->checkWorkspaceToolAccess($workspace);
        $query = $request->query->all();
        $filters = isset($query['filters']) ? $query['filters'] : [];
        $sortBy = null;

        if (isset($query['sortBy'])) {
            $direction = '-' === substr($query['sortBy'], 0, 1) ? -1 : 1;
            $property = 1 === $direction ? $query['sortBy'] : substr($query['sortBy'], 1);
            $sortBy = ['property' => $property, 'direction' => $direction];
        }
        $filters['workspace'] = $workspace->getUuid();
        $downloadDate = date('Y-m-d_H-i-s');

        return new StreamedResponse(function () use ($filters, $sortBy) {
            $this->logConnectManager->exportConnectionsToCsv(LogConnectWorkspace::class, $filters, $sortBy);
        }, 200, [
            'Content-Type' => 'application/force-download',
            'Content-Disposition' => 'attachment; filename="connection_time_workspace_'.$workspace->getUuid().'_'.$downloadDate.'.csv"',
        ]);
    }

    /**
     * @EXT\Route(
     *     "/resource/{resource}/list",
     *     name="apiv2_log_connect_resource_list"
     * )
     * @EXT\ParamConverter(
     *     "resource",
     *     class="ClarolineCoreBundle:Resource\ResourceNode",
     *     options={"mapping": {"resource": "id"}}
     * )
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     *
     * @param ResourceNode $resource
     * @param User         $user
     * @param Request      $request
     *
     * @return JsonResponse
     */
    public function logConnectResourceListAction(ResourceNode $resource, User $user, Request $request)
    {
        $hiddenFilters = ['resource' => $resource->getUuid()];

        if (!$this->authorization->isGranted('administrate', $resource->getWorkspace())) {
            $hiddenFilters['user'] = $user->getUuid();
        }

        return new JsonResponse(
            $this->finder->search(LogConnectResource::class, array_merge(
                $request->query->all(),
                ['hiddenFilters' => $hiddenFilters]
            ))
        );
    }

    /**
     * @EXT\Route(
     *     "/resource/{resource}/csv",
     *     name="apiv2_log_connect_resource_list_csv"
     * )
     * @EXT\Method("GET")
     * @EXT\ParamConverter(
     *     "resource",
     *     class="ClarolineCoreBundle:Resource\ResourceNode",
     *     options={"mapping": {"resource": "id"}}
     * )
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     *
     * @param ResourceNode $resource
     * @param User         $user
     * @param Request      $request
     *
     * @return StreamedResponse
     */
    public function logConnectResourceListCsvAction(ResourceNode $resource, User $user, Request $request)
    {
        $query = $request->query->all();
        $filters = isset($query['filters']) ? $query['filters'] : [];
        $sortBy = null;

        if (isset($query['sortBy'])) {
            $direction = '-' === substr($query['sortBy'], 0, 1) ? -1 : 1;
            $property = 1 === $direction ? $query['sortBy'] : substr($query['sortBy'], 1);
            $sortBy = ['property' => $property, 'direction' => $direction];
        }
        $filters['resource'] = $resource->getUuid();

        if (!$this->authorization->isGranted('administrate', $resource->getWorkspace())) {
            $filters['user'] = $user->getUuid();
        }
        $downloadDate = date('Y-m-d_H-i-s');

        return new StreamedResponse(function () use ($filters, $sortBy) {
            $this->logConnectManager->exportConnectionsToCsv(LogConnectResource::class, $filters, $sortBy);
        }, 200, [
            'Content-Type' => 'application/force-download',
            'Content-Disposition' => 'attachment; filename="connection_time_resource_'.$resource->getUuid().'_'.$downloadDate.'.csv"',
        ]);
    }

    /**
     * @EXT\Route(
     *     "/embedded/resource/{resource}/compute",
     *     name="apiv2_log_connect_embedded_resource_compute"
     * )
     * @EXT\ParamConverter(
     *     "resource",
     *     class="ClarolineCoreBundle:Resource\ResourceNode",
     *     options={"mapping": {"resource": "uuid"}}
     * )
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     *
     * @param ResourceNode $resource
     * @param User         $user
     *
     * @return JsonResponse
     */
    public function embeddedResourceComputeAction(ResourceNode $resource, User $user)
    {
        $this->logConnectManager->computeEmbeddedResourceDuration($user, $resource);

        return new JsonResponse();
    }

    /**
     * @param string $rights
     */
    private function checkAdminToolAccess($rights = 'OPEN')
    {
        $logsTool = $this->toolManager->getAdminToolByName('dashboard');

        if (is_null($logsTool) || !$this->authorization->isGranted($rights, $logsTool)) {
            throw new AccessDeniedException();
        }
    }

    /**
     * @param Workspace $workspace
     * @param string    $rights
     */
    private function checkWorkspaceToolAccess(Workspace $workspace, $rights = 'OPEN')
    {
        if (!$this->authorization->isGranted(['dashboard', $rights], $workspace)) {
            throw new AccessDeniedException();
        }
    }
}
