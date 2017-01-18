<?php

namespace UJM\ExoBundle\Entity\Misc;

use Doctrine\ORM\Mapping as ORM;
use UJM\ExoBundle\Entity\Misc\Label;
use UJM\ExoBundle\Entity\Misc\Proposal;
use UJM\ExoBundle\Entity\QuestionType\MatchQuestion;
use UJM\ExoBundle\Library\Attempt\AnswerPartInterface;
use UJM\ExoBundle\Library\Model\FeedbackTrait;
use UJM\ExoBundle\Library\Model\ScoreTrait;

/**
 * Label.
 *
 * @ORM\Entity()
 * @ORM\Table(name="ujm_association")
 */
class Association implements AnswerPartInterface
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="UJM\ExoBundle\Entity\QuestionType\MatchQuestion", inversedBy="associations")
     * @ORM\JoinColumn(name="match_question_id", referencedColumnName="id")
     */
    private $interactionMatching;

    /**
     * @ORM\ManyToOne(targetEntity="UJM\ExoBundle\Entity\Misc\Label")
     * @ORM\JoinColumn(name="label_id", referencedColumnName="id")
     */
    private $label;

    /**
     * @ORM\ManyToOne(targetEntity="UJM\ExoBundle\Entity\Misc\Proposal")
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id")
     */
    private $proposal;

    use ScoreTrait;

    use FeedbackTrait;

    /**
     * Get id.
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get InteractionMatching.
     *
     * @return MatchQuestion
     */
    public function getInteractionMatching()
    {
        return $this->interactionMatching;
    }

    /**
     * Set InteractionMatching.
     *
     * @param MatchQuestion $interactionMatching
     */
    public function setInteractionMatching(MatchQuestion $interactionMatching)
    {
        $this->interactionMatching = $interactionMatching;
    }

    /**
     * Set label.
     *
     * @param Label $label
     */
    public function setLabel(Label $label)
    {
        $this->label = $label;
    }

    /**
     * Get label.
     *
     * @return Label
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * Set proposal.
     *
     * @param Proposal $proposal
     */
    public function setProposal(Proposal $proposal)
    {
        $this->proposal = $proposal;
    }

    /**
     * Get proposal.
     *
     * @return Proposal
     */
    public function getProposal()
    {
        return $this->proposal;
    }
}
