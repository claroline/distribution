<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace HeVinci\CompetencyBundle\Controller\API;

use Claroline\AppBundle\API\Options;
use Claroline\AppBundle\Controller\AbstractCrudController;
use HeVinci\CompetencyBundle\Entity\Competency;
use HeVinci\CompetencyBundle\Manager\CompetencyManager;
use JMS\DiExtraBundle\Annotation as DI;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as EXT;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

/**
 * @EXT\Route("/competency")
 */
class CompetencyController extends AbstractCrudController
{
    /** @var CompetencyManager */
    private $manager;

    /**
     * @DI\InjectParams({
     *     "manager" = @DI\Inject("hevinci.competency.competency_manager")
     * })
     *
     * @param CompetencyManager $manager
     */
    public function __construct(CompetencyManager $manager)
    {
        $this->manager = $manager;
    }

    public function getName()
    {
        return 'competency';
    }

    public function getClass()
    {
        return Competency::class;
    }

    public function getIgnore()
    {
        return ['exist', 'copyBulk', 'schema', 'find', 'list'];
    }

    /**
     * @EXT\Route(
     *     "/root/list",
     *     name="apiv2_competency_root_list"
     * )
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function competenciesRootListAction(Request $request)
    {
        $params = $request->query->all();

        if (!isset($params['hiddenFilters'])) {
            $params['hiddenFilters'] = [];
        }
        $params['hiddenFilters']['parent'] = null;
        $data = $this->finder->search(Competency::class, $params, [Options::SERIALIZE_MINIMAL]);

        return new JsonResponse($data, 200);
    }

    /**
     * @EXT\Route(
     *     "/competency/{id}/list",
     *     name="apiv2_competency_tree_list"
     * )
     * @EXT\ParamConverter(
     *     "competency",
     *     class="HeVinciCompetencyBundle:Competency",
     *     options={"mapping": {"id": "uuid"}}
     * )
     *
     * @param Competency $competency
     * @param Request    $request
     *
     * @return JsonResponse
     */
    public function competenciesTreeListAction(Competency $competency, Request $request)
    {
        $root = $competency;

        while (!is_null($root->getParent())) {
            $root = $root->getParent();
        }
        $params = $request->query->all();

        if (!isset($params['hiddenFilters'])) {
            $params['hiddenFilters'] = [];
        }
        $params['hiddenFilters']['uuid'] = $root->getUuid();
        $data = $this->finder->search(Competency::class, $params, [Options::SERIALIZE_MINIMAL, Options::IS_RECURSIVE]);

        return new JsonResponse($data, 200);
    }

    /**
     * @EXT\Route(
     *     "/framework/{id}/export",
     *     name="apiv2_competency_framework_export"
     * )
     * @EXT\ParamConverter(
     *     "framework",
     *     class="HeVinciCompetencyBundle:Competency",
     *     options={"mapping": {"id": "uuid"}}
     * )
     *
     * @param Competency $framework
     *
     * @return Response
     */
    public function frameworkExportAction(Competency $framework)
    {
        $this->manager->ensureIsRoot($framework);
        $response = new Response($this->manager->exportFramework($framework));
        $disposition = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            "{$framework->getName()}.json",
            "framework-{$framework->getId()}.json"
        );
        $response->headers->set('Content-Type', 'application/json');
        $response->headers->set('Content-Disposition', $disposition);

        return $response;
    }

    /**
     * @EXT\Route(
     *    "/framework/file/upload",
     *     name="apiv2_competency_framework_file_upload"
     * )
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function uploadAction(Request $request)
    {
        $files = $request->files->all();
        $data = null;

        if (1 === count($files)) {
            foreach ($files as $file) {
                $data = file_get_contents($file);
            }
        } else {
            return new JsonResponse('No uploaded file', 500);
        }

        return new JsonResponse($data, 200);
    }

    /**
     * @EXT\Route(
     *     "/framework/import",
     *     name="apiv2_competency_framework_import"
     * )
     *
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function frameworkImportAction(Request $request)
    {
        $data = $this->decodeRequest($request);
        $fileData = isset($data['file']) ? $data['file'] : null;
        $this->manager->importFramework($fileData);

        return new JsonResponse();
    }

    public function getOptions()
    {
        return [
            'get' => [Options::IS_RECURSIVE],
        ];
    }
}
