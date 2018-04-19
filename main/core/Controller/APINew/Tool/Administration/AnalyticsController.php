<?php

namespace Claroline\CoreBundle\Controller\APINew\Tool\Administration;

use Claroline\CoreBundle\Manager\AnalyticsManager;
use JMS\DiExtraBundle\Annotation as DI;
use JMS\SecurityExtraBundle\Annotation as SEC;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * @Route("/tools/admin/analytics", name="admin_tool_analytics")
 * @SEC\PreAuthorize("canOpenAdminTool('platform_analytics')")
 */
class AnalyticsController
{
    /** @var AnalyticsManager */
    private $analyticsManager;

    /**
     * @DI\InjectParams({
     *     "analyticsManager"       = @DI\Inject("claroline.manager.analytics_manager")
     * })
     *
     * LogController constructor.
     *
     * @param AnalyticsManager $analyticsManager
     */
    public function __construct(
        AnalyticsManager $analyticsManager
    ) {
        $this->analyticsManager = $analyticsManager;
    }

    /**
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     * @Route("", name="apiv2_admin_tool_analytics_overview")
     * @Method("GET")
     */
    public function overviewAction()
    {
        $lastMonthActions = $this->analyticsManager->getDailyActions();
        $mostViewedWS = $this->analyticsManager->topWorkspaceByAction(['limit' => 5]);
        $mostViewedMedia = $this->analyticsManager->topResourcesByAction(['limit' => 5], true);
        $mostDownloadedResources = $this->analyticsManager->topResourcesByAction([
            'limit' => 5,
            'filters' => [
                'action' => 'resource-export',
            ],
        ]);
        $usersCount = $this->analyticsManager->userRolesData();

        return new JsonResponse([
            'activity' => $lastMonthActions,
            'top' => [
                'workspace' => $mostViewedWS,
                'media' => $mostViewedMedia,
                'download' => $mostDownloadedResources,
            ],
            'users' => $usersCount,
        ]);
    }

    /**
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     * @Route("/audience", name="apiv2_admin_tool_analytics_audience")
     * @Method("GET")
     */
    public function audienceAction()
    {
        $actionsForRange = $this->analyticsManager
            ->getDailyActionNumberForDateRange($this->analyticsManager->getDefaultRange(), 'user_login', false);

        $activeUsersForDateRange = $this->analyticsManager
            ->getActiveUsersForDateRange($this->analyticsManager->getDefaultRange());

        $connections = $actionsForRange;
        $countConnectionsForDateRange = array_sum(array_map(function ($item) {
            return $item[1];
        }, $connections));
        $activeUsers = $this->analyticsManager->getActiveUsers();

        return new JsonResponse([
            'activity' => [
                'daily' => $connections,
                'total' => $countConnectionsForDateRange,
            ],
            'users' => [
                'all' => $activeUsers,
                'period' => $activeUsersForDateRange,
            ],
        ]);
    }

    /**
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     * @Route("/resources", name="apiv2_admin_tool_analytics_resources")
     * @Method("GET")
     */
    public function resourcesAction()
    {
        $wsCount = $this->analyticsManager->countNonPersonalWorkspaces();
        $resourceCount = $this->analyticsManager->getResourceTypesCount();
        $otherResources = $this->analyticsManager->getOtherResourceTypesCount();

        return new JsonResponse([
            'resources' => $resourceCount,
            'workspaces' => $wsCount,
            'other' => $otherResources,
        ]);
    }

    /**
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     * @Route("/widgets", name="apiv2_admin_tool_analytics_widgets")
     * @Method("GET")
     */
    public function widgetsAction()
    {
        return new JsonResponse($this->analyticsManager->getWidgetsData());
    }

    /**
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     * @Route("/top", name="apiv2_admin_tool_analytics_top_actions")
     * @Method("GET")
     */
    public function topActionsAction(Request $request)
    {
        $range = $this->analyticsManager->getDefaultRange();
        $topType = $request->query->get('type');
        $max = $request->query->get('max');

        $listData = $this->analyticsManager->getTopByCriteria($range, $topType, $max);

        return new JsonResponse($listData);
    }
}
