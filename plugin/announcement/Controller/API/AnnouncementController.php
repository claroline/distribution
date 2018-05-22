<?php

namespace Claroline\AnnouncementBundle\Controller\API;

use Claroline\AnnouncementBundle\Entity\Announcement;
use Claroline\AnnouncementBundle\Entity\AnnouncementAggregate;
use Claroline\AnnouncementBundle\Manager\AnnouncementManager;
use Claroline\AppBundle\API\Crud;
use Claroline\AppBundle\API\SerializerProvider;
use Claroline\CoreBundle\Security\PermissionCheckerTrait;
use JMS\DiExtraBundle\Annotation as DI;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as EXT;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Manages announces of an announcement resource.
 *
 * @EXT\Route("/{aggregateId}", options={"expose"=true})
 * @EXT\ParamConverter(
 *      "aggregate",
 *      class="ClarolineAnnouncementBundle:AnnouncementAggregate",
 *      options={"mapping": {"aggregateId": "uuid"}}
 * )
 */
class AnnouncementController
{
    use PermissionCheckerTrait;

    /** @var AnnouncementManager */
    private $manager;

    /**
     * AnnouncementController constructor.
     *
     * @DI\InjectParams({
     *     "manager"    = @DI\Inject("claroline.manager.announcement_manager"),
     *     "serializer" = @DI\Inject("claroline.api.serializer"),
     *     "crud"       = @DI\Inject("claroline.api.crud")
     * })
     *
     * @param AnnouncementManager $managersuppression
     */
    public function __construct(AnnouncementManager $manager, SerializerProvider $serializer, Crud $crud)
    {
        $this->manager = $manager;
        $this->serializer = $serializer;
        $this->crud = $crud;
    }

    /**
     * Creates a new announce.
     *
     * @EXT\Route("/", name="claro_announcement_create")
     * @EXT\Method("POST")
     *
     * @param AnnouncementAggregate $aggregate
     * @param Request               $request
     *
     * @return JsonResponse
     */
    public function createAction(AnnouncementAggregate $aggregate, Request $request)
    {
        $this->checkPermission('EDIT', $aggregate->getResourceNode(), [], true);

        $announcement = $this->crud->create($this->getClass(), $this->decodeRequest($request), [
          'announcement_aggregate' => $aggregate,
        ]);

        return new JsonResponse(
            $this->serializer->serialize($announcement),
            201
        );
    }

    /**
     * Updates an existing announce.
     *
     * @EXT\Route("/{id}", name="claro_announcement_update")
     * @EXT\Method("PUT")
     * @EXT\ParamConverter(
     *      "announcement",
     *      class="ClarolineAnnouncementBundle:Announcement",
     *      options={"mapping": {"id": "uuid"}}
     * )
     *
     * @param AnnouncementAggregate $aggregate
     * @param Announcement          $announcement
     * @param Request               $request
     *
     * @return JsonResponse
     */
    public function updateAction(AnnouncementAggregate $aggregate, Announcement $announcement, Request $request)
    {
        $this->checkPermission('EDIT', $aggregate->getResourceNode(), [], true);

        $announcement = $this->crud->update($this->getClass(), $this->decodeRequest($request), [
          'announcement_aggregate' => $aggregate,
        ]);

        return new JsonResponse(
            $this->serializer->serialize($announcement),
            201
        );
    }

    /**
     * Deletes an announce.
     *
     * @EXT\Route("/{id}", name="claro_announcement_delete")
     * @EXT\Method("DELETE")
     * @EXT\ParamConverter(
     *      "announcement",
     *      class="ClarolineAnnouncementBundle:Announcement",
     *      options={"mapping": {"id": "uuid"}}
     * )
     *
     * @param AnnouncementAggregate $aggregate
     * @param Announcement          $announcement
     *
     * @return JsonResponse
     */
    public function deleteAction(AnnouncementAggregate $aggregate, Announcement $announcement)
    {
        $this->checkPermission('EDIT', $aggregate->getResourceNode(), [], true);

        $this->crud->delete($announcement, [
          'announcement_aggregate' => $aggregate,
        ]);

        return new JsonResponse(null, 204);
    }

    /**
     * Sends an announce (in current implementation, it's sent by email).
     *
     * @EXT\Route("/{id}/send", name="claro_announcement_send")
     * @EXT\Method("POST")
     * @EXT\ParamConverter(
     *      "announcement",
     *      class="ClarolineAnnouncementBundle:Announcement",
     *      options={"mapping": {"id": "uuid"}}
     * )
     *
     * @param AnnouncementAggregate $aggregate
     * @param Announcement          $announcement
     *
     * @return JsonResponse
     */
    public function validateSendAction(AnnouncementAggregate $aggregate, Announcement $announcement)
    {
        $this->checkPermission('EDIT', $aggregate->getResourceNode(), [], true);
    }

    /**
     * Sends an announce (in current implementation, it's sent by email).
     *
     * @EXT\Route("/{id}/send", name="claro_announcement_send")
     * @EXT\Method("POST")
     * @EXT\ParamConverter(
     *      "announcement",
     *      class="ClarolineAnnouncementBundle:Announcement",
     *      options={"mapping": {"id": "uuid"}}
     * )
     *
     * @param AnnouncementAggregate $aggregate
     * @param Announcement          $announcement
     *
     * @return JsonResponse
     */
    public function sendAction(AnnouncementAggregate $aggregate, Announcement $announcement)
    {
        $this->checkPermission('EDIT', $aggregate->getResourceNode(), [], true);

        try {
            $this->manager->sendMail($announcement);

            return new JsonResponse(null, 204);
        } catch (\Exception $e) {
            return new JsonResponse($e->getMessage(), 422);
        }
    }

    public function getClass()
    {
        return 'Claroline\AnnouncementBundle\Entity\Announcement';
    }

    protected function decodeRequest(Request $request)
    {
        $decodedRequest = json_decode($request->getContent(), true);

        if (null === $decodedRequest) {
            throw new InvalidDataException('Invalid request content sent.', []);
        }

        return $decodedRequest;
    }
}
