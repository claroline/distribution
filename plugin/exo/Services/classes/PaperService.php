<?php

namespace UJM\ExoBundle\Services\classes;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Symfony\Component\DependencyInjection\Container;
use UJM\ExoBundle\Entity\AbstractInteraction;
use UJM\ExoBundle\Entity\Paper;
use UJM\ExoBundle\Entity\Response;

/**
 * Services for the paper.
 */
class PaperService
{
    private $doctrine;
    private $container;

    /**
     * Constructor.
     *
     *
     * @param \Doctrine\Bundle\DoctrineBundle\Registry         $doctrine  Dependency Injection;
     * @param \Symfony\Component\DependencyInjection\Container $container
     */
    public function __construct(Registry $doctrine, Container $container)
    {
        $this->doctrine = $doctrine;
        $this->container = $container;
    }

    /**
     * Get total score for an paper.
     *
     *
     * @param int $paperID id Paper
     *
     * @return float
     */
    public function getPaperTotalScore($paperID)
    {
        $em = $this->doctrine->getManager();
        $exercisePaperTotalScore = 0;
        $paper = $interaction = $em->getRepository('UJMExoBundle:Paper')
                                   ->find($paperID);

        $interQuestions = $paper->getOrdreQuestion();
        $interQuestions = substr($interQuestions, 0, strlen($interQuestions) - 1);
        $interQuestionsTab = explode(';', $interQuestions);

        foreach ($interQuestionsTab as $interQuestion) {
            $interaction = $em->getRepository('UJMExoBundle:Question')->find($interQuestion);
            $interSer = $this->container->get('ujm.exo_'.$interaction->getType());
            $interactionX = $interSer->getInteractionX($interaction->getId());
            $exercisePaperTotalScore += $interSer->maxScore($interactionX);
        }

        return $exercisePaperTotalScore;
    }

    /**
     * Round up and down a score.
     *
     * @param float $toBeAdjusted
     *
     * @return float
     */
    public function roundUpDown($toBeAdjusted)
    {
        return round($toBeAdjusted / 0.5) * 0.5;
    }

    /**
     * Get information about a paper response, maxExoScore, scorePaper, scoreTemp (all questions graphiced or no).
     *
     * @param Paper $paper
     *
     * @return array
     */
    public function getInfosPaper($paper)
    {
        $infosPaper = array();
        $scorePaper = 0;
        $scoreTemp = false;

        $interactions = $this->getInteractions($paper->getOrdreQuestion());
        $interactionsSorted = $this->sortInteractions($interactions, $paper->getOrdreQuestion());
        $infosPaper['interactions'] = $interactionsSorted;

        $responses = $this->getResponses($paper->getId());
        $responsesSorted = $this->sortResponses($responses, $paper->getOrdreQuestion());
        $infosPaper['responses'] = $responsesSorted;

        $infosPaper['maxExoScore'] = $this->getPaperTotalScore($paper->getId());

        foreach ($responses as $response) {
            if ($response->getMark() != -1) {
                $scorePaper += $response->getMark();
            } else {
                $scoreTemp = true;
            }
        }

        $infosPaper['scorePaper'] = $scorePaper;
        $infosPaper['scoreTemp'] = $scoreTemp;

        return $infosPaper;
    }

    /**
     * sort the array of interactions in the order recorded for the paper.
     *
     *
     * @param AbstractInteraction[] $interactions
     * @param string                                          $order
     *
     * @return AbstractInteraction[]
     */
    private function sortInteractions($interactions, $order)
    {
        $inter = array();
        $order = substr($order, 0, strlen($order) - 1);
        $order = explode(';', $order);

        foreach ($order as $interId) {
            foreach ($interactions as $key => $interaction) {
                if ($interaction->getId() == $interId) {
                    $inter[] = $interaction;
                    unset($interactions[$key]);
                    break;
                }
            }
        }

        return $inter;
    }

    /**
     * sort the array of responses to match the order of questions.
     *
     * @param Response[] $responses
     * @param string $order
     *
     * @return Response[]
     */
    private function sortResponses($responses, $order)
    {
        $resp = array();
        $order = $this->formatQuestionOrder($order);
        foreach ($order as $interId) {
            $tem = 0;
            foreach ($responses as $key => $response) {
                if ($response->getQuestion()->getId() == $interId) {
                    ++$tem;
                    $resp[] = $response;
                    unset($responses[$key]);
                    break;
                }
            }
            //if no response
            if ($tem == 0) {
                $response = new Response();
                $response->setResponse('');
                $response->setMark(0);

                $resp[] = $response;
            }
        }

        return $resp;
    }

    /**
     * @param string $orderQuestion
     *
     * Return \UJM\ExoBundle\Interaction[]
     */
    private function getInteractions($orderQuestion)
    {
        $questionIds = explode(';', substr($orderQuestion, 0, -1));
        $em = $this->doctrine->getManager();

        return $em
            ->getRepository('UJMExoBundle:Question')
            ->findByIds($questionIds);
    }

    /**
     * @param int $paperId
     *
     * Return \UJM\ExoBundle\Entity\Interaction[]
     */
    private function getResponses($paperId)
    {
        $em = $this->doctrine->getManager();

        return $em
            ->getRepository('UJMExoBundle:Response')
            ->getPaperResponses($paperId);
    }

    /**
     * @param string $orderOrig
     *
     * @return integer[]
     */
    private function formatQuestionOrder($orderOrig)
    {
        $order = substr($orderOrig, 0, strlen($orderOrig) - 1);
        $orderFormatted = explode(';', $order);

        return $orderFormatted;
    }
}
