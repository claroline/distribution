<?php

namespace Claroline\DashboardBundle\Controller\Api;

use Claroline\CoreBundle\Entity\User;
use Claroline\DashboardBundle\Entity\Dashboard;
use Claroline\DashboardBundle\Manager\DashboardManager;
use JMS\DiExtraBundle\Annotation as DI;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as EXT;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * Dashboards Controller.
 *
 * @EXT\Route(
 *     options={"expose"=true},
 *     defaults={"_format": "json"}
 * )
 * @EXT\Method("GET")
 */
class DashboardsController extends Controller
{
    private $authorization;
    private $request;
    private $dashboardManager;
    private $tokenStorage;

    /**
     * @DI\InjectParams({
     *     "authorization"      = @DI\Inject("security.authorization_checker"),
     *     "request"            = @DI\Inject("request"),
     *     "dashboardManager"   = @DI\Inject("claroline.manager.dashboard_manager"),
     *     "tokenStorage"       = @DI\Inject("security.token_storage")
     * })
     */
    public function __construct(
        AuthorizationCheckerInterface $authorization,
        Request $request,
        DashboardManager $dashboardManager,
        TokenStorageInterface $tokenStorage
    ) {
        $this->authorization = $authorization;
        $this->request = $request;
        $this->dashboardManager = $dashboardManager;
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * @EXT\Route("/new", name="create_dashboard")
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     * @EXT\Method("POST")
     */
    public function createDashboard(User $user)
    {
        $data = $this->container->get('request')->request->all();
        $dashboard = $this->dashboardManager->create($user, $data);

        return new JsonResponse($dashboard);
    }

    /**
     * @EXT\Route("/dashboards", name="get_dashboards")
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     * @EXT\Method("GET")
     */
    public function getAll(User $user)
    {
        $dashboards = $this->dashboardManager->getAll($user);

        return new JsonResponse($dashboards);
    }

    /**
     * @EXT\Route("/dashboards/count", name="get_nb_dashboards")
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     * @EXT\Method("GET")
     */
    public function getNbDashboard(User $user)
    {
        $dashboards = $this->dashboardManager->getAll($user);

        return new JsonResponse(count($dashboards));
    }

    /**
     * @EXT\Route("/dashboards/{dashboardId}/times", name="get_dashboard_spent_times")
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     * @EXT\ParamConverter("dashboard", class="ClarolineDashboardBundle:Dashboard", options={"mapping": {"dashboardId": "id"}})
     * @EXT\Method("GET")
     */
    public function getDashboardWorkspaceSpentTimes(User $user, Dashboard $dashboard)
    {
        $all = $user->getId() === $dashboard->getWorkspace()->getCreator()->getId();

        $datas = $this->dashboardManager->getDashboardWorkspaceSpentTimes($dashboard->getWorkspace(), $user, $all);

        return new JsonResponse($datas);
    }

    /**
     * @EXT\Route("/dashboards/{dashboardId}", name="get_dashboard")
     * @EXT\ParamConverter("user", converter="current_user", options={"allowAnonymous"=false})
     * @EXT\ParamConverter("dashboard", class="ClarolineDashboardBundle:Dashboard", options={"mapping": {"dashboardId": "id"}})
     * @EXT\Method("GET")
     */
    public function getOne(User $user, Dashboard $dashboard)
    {
        $dashboard = $this->dashboardManager->exportDashboard($dashboard);

        return new JsonResponse($dashboard);
    }
}
