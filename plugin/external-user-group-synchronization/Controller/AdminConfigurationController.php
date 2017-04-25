<?php
/**
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * Date: 4/11/17
 */

namespace Claroline\ExternalSynchronizationBundle\Controller;

use Claroline\ExternalSynchronizationBundle\Form\ExternalSourceConfigurationType;
use Claroline\ExternalSynchronizationBundle\Form\ExternalSourceUserConfigurationType;
use Claroline\ExternalSynchronizationBundle\Manager\ExternalSynchronizationManager;
use JMS\DiExtraBundle\Annotation as DI;
use JMS\SecurityExtraBundle\Annotation as SEC;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as EXT;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class ExternalUserGroupSynchronizationAdminController.
 *
 * @DI\Tag("security.secure_service")
 * @SEC\PreAuthorize("canOpenAdminTool('platform_parameters')")
 */
class AdminConfigurationController extends Controller
{
    /**
     * @var ExternalSynchronizationManager
     * @DI\Inject("claroline.manager.external_user_group_sync_manager")
     */
    private $externalUserGroupSyncManager;

    /**
     * @EXT\Route("/", name="claro_admin_external_user_group_config_index")
     * @EXT\Template("ClarolineExternalSynchronizationBundle:Configuration:index.html.twig")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $sources = $this->externalUserGroupSyncManager->getExternalSourcesNames();

        return ['sources' => $sources];
    }

    /**
     * @EXT\Route("/new", name="claro_admin_external_user_group_new_source_form")
     * @EXT\Method({ "GET" })
     * @EXT\Template("ClarolineExternalSynchronizationBundle:Configuration:newSource.html.twig")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function newSourceAction()
    {
        $form = $this->createForm(new ExternalSourceConfigurationType());

        return ['form' => $form->createView()];
    }

    /**
     * @EXT\Route("/new", name="claro_admin_external_user_group_post_new_source")
     * @EXT\Method({ "POST" })
     * @EXT\Template("ClarolineExternalSynchronizationBundle:Configuration:newSource.html.twig")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function postNewSourceAction(Request $request)
    {
        $form = $this->createForm(new ExternalSourceConfigurationType());
        $form->handleRequest($request);
        if ($form->isValid()) {
            $config = $form->getData();
            $this->externalUserGroupSyncManager->setExternalSource($config['name'], $config);

            return $this->redirectToRoute('claro_admin_external_user_group_config_index');
        }

        return ['form' => $form->createView()];
    }

    /**
     * @EXT\Route("/edit/{source}",
     *     options={"expose"=true},
     *     name="claro_admin_external_user_group_edit_source_form"
     * )
     * @EXT\Method({ "GET" })
     * @EXT\Template("ClarolineExternalSynchronizationBundle:Configuration:editSource.html.twig")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function editSourceAction($source)
    {
        $sourceConfig = $this->externalUserGroupSyncManager->getExternalSource($source);
        $form = $this->createForm(new ExternalSourceConfigurationType(), $sourceConfig);

        return [
            'sourceConfig' => $sourceConfig,
            'source' => $source,
            'form' => $form->createView(),
        ];
    }

    /**
     * @EXT\Route("/edit/{source}", name="claro_admin_external_user_group_update_source")
     * @EXT\Method({ "POST" })
     * @EXT\Template("ClarolineExternalSynchronizationBundle:Configuration:editSource.html.twig")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function updateSourceAction(Request $request, $source)
    {
        $sourceConfig = $this->externalUserGroupSyncManager->getExternalSource($source);
        $form = $this->createForm(new ExternalSourceConfigurationType(), $sourceConfig);
        $form->handleRequest($request);
        if ($form->isValid()) {
            $config = $form->getData();
            $this->externalUserGroupSyncManager->setExternalSource($config['name'], $config);

            return $this->redirectToRoute('claro_admin_external_user_group_config_index');
        }

        return [
            'sourceConfig' => $sourceConfig,
            'source' => $source,
            'form' => $form->createView(),
        ];
    }

    /**
     * @EXT\Route("/edit/user/{source}",
     *     options={"expose"=true},
     *     name="claro_admin_external_user_group_source_user_configuration_form"
     * )
     * @EXT\Method({ "GET" })
     * @EXT\Template("ClarolineExternalSynchronizationBundle:Configuration:userConfiguration.html.twig")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function userConfigurationForSourceAction($source)
    {
        $sourceConfig = $this->externalUserGroupSyncManager->getExternalSource($source);
        $tableNames = $this->externalUserGroupSyncManager->getTableNames($source);
        $form = $this->createForm(
            new ExternalSourceUserConfigurationType(),
            $sourceConfig,
            ['table_names' => $tableNames]
        );

        return [
            'sourceConfig' => $sourceConfig,
            'source' => $source,
            'form' => $form->createView(),
        ];
    }

    /**
     * @EXT\Route("/edit/user/{source}", name="claro_admin_external_user_group_source_update_user_configuration")
     * @EXT\Method({ "POST" })
     * @EXT\Template("ClarolineExternalSynchronizationBundle:Configuration:userConfiguration.html.twig")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function updateUserConfigurationForSourceAction(Request $request, $source)
    {
        $sourceConfig = $this->externalUserGroupSyncManager->getExternalSource($source);
        $tableNames = $this->externalUserGroupSyncManager->getTableNames($source);
        $form = $this->createForm(
            new ExternalSourceUserConfigurationType(),
            $sourceConfig,
            ['table_names' => $tableNames]
        );
        $form->handleRequest($request);
        if ($form->isValid()) {
            $config = $form->getData();
            $this->externalUserGroupSyncManager->setExternalSource($config['name'], $config);

            return $this->redirectToRoute('claro_admin_external_user_group_config_index');
        }

        return [
            'sourceConfig' => $sourceConfig,
            'source' => $source,
            'form' => $form->createView(),
        ];
    }

    /**
     * @EXT\Route("/delete/{source}",
     *     options={"expose"=true},
     *     name="claro_admin_external_user_group_delete_source"
     * )
     * @EXT\Method({ "DELETE" })
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteSourceAction($source)
    {
        $deleted = $this->externalUserGroupSyncManager->deleteExternalSource($source);

        return new JsonResponse(['deleted' => true], !$deleted ? 500 : 200);
    }

    /**
     * @param $source
     * @EXT\Route("/{source}/tables",
     *     options={"expose"=true},
     *     name="claro_admin_external_user_group_table_names"
     * )
     * @EXT\Method({ "GET" })
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getTableNamesForSourceAction($source)
    {
        $columns = $this->externalUserGroupSyncManager->getTableNames($source);

        return new JsonResponse($columns);
    }

    /**
     * @param $source
     * @param $table
     * @EXT\Route("/{source}/{table}/columns",
     *     options={"expose"=true},
     *     name="claro_admin_external_user_group_table_columns"
     * )
     * @EXT\Method({ "GET" })
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getTableColumnsForSourceAction($source, $table)
    {
        $columns = $this->externalUserGroupSyncManager->getColumnNamesForTable($source, $table);

        return new JsonResponse($columns);
    }

    /**
     * @param $source
     * @EXT\Route("/{source}/users",
     *     options={"expose"=true},
     *     name="claro_admin_external_user_group_users"
     * )
     * @EXT\Method({ "GET" })
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getUsersForSourceAction($source)
    {
        $users = $this->externalUserGroupSyncManager->loadUsersForExternalSource($source);

        return new JsonResponse($users);
    }

    /**
     * @param $source
     * @EXT\Route("/{source}/groups",
     *     options={"expose"=true},
     *     name="claro_admin_external_user_group_groups"
     * )
     * @EXT\Method({ "GET" })
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getGroupsForSourceAction($source)
    {
        $groups = $this->externalUserGroupSyncManager->loadGroupsForExternalSource($source);

        return new JsonResponse($groups);
    }

    /**
     * @EXT\Route("/synchronization", name="claro_admin_external_user_group_source_synchronization")
     * @EXT\Template("ClarolineExternalSynchronizationBundle:Configuration:index.html.twig")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function sourceSynchronizationAction()
    {
        $sources = $this->externalUserGroupSyncManager->getExternalSourcesNames();

        return ['sources' => $sources];
    }
}
