<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\DropZoneBundle\Entity;

use Claroline\CoreBundle\Entity\Model\UuidTrait;
use Claroline\CoreBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Claroline\DropZoneBundle\Repository\DropRepository")
 * @ORM\Table(
 *     name="claro_dropzonebundle_drop",
 *     uniqueConstraints={
 *         @ORM\UniqueConstraint(
 *             name="dropzone_drop_unique_dropzone_team",
 *             columns={"dropzone_id", "team_id"}
 *         )
 *     })
 */
class Drop
{
    use UuidTrait;

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @ORM\ManyToOne(targetEntity="Claroline\DropZoneBundle\Entity\Dropzone")
     * @ORM\JoinColumn(name="dropzone_id", nullable=false, onDelete="CASCADE")
     */
    protected $dropzone;

    /**
     * @ORM\ManyToOne(targetEntity="Claroline\CoreBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", nullable=true, onDelete="SET NULL")
     */
    protected $user;

    /**
     * @ORM\OneToMany(
     *     targetEntity="Claroline\DropZoneBundle\Entity\Document",
     *     mappedBy="drop"
     * )
     */
    protected $documents;

    /**
     * @ORM\Column(name="drop_date", type="datetime", nullable=true)
     */
    protected $dropDate;

    /**
     * @ORM\Column(name="score", type="float", nullable=true)
     */
    protected $score;

    /**
     * @ORM\Column(type="boolean", nullable=false)
     */
    protected $reported = false;

    /**
     * @ORM\Column(type="boolean", nullable=false)
     */
    protected $finished = false;

    /**
     * @ORM\Column(name="drop_number", type="integer", nullable=true)
     */
    protected $number;

    /**
     * Indicate if the drop was close automaticaly (when time is up by the dropzone option $autoCloseDropsAtDropEndDate).
     *
     * @ORM\Column(name="auto_closed_drop", type="boolean", nullable=false)
     */
    protected $autoClosedDrop = false;

    /**
     * Used to flag that a copy have been unlocked ( admin made a correction that unlocked the copy:
     * the copy doesn't wait anymore the expected number of correction.
     *
     * @ORM\Column(name="unlocked_drop", type="boolean", nullable=false)
     */
    protected $unlockedDrop = false;

    /**
     * Used to flag that a user have been unlocked ( admin made a correction that unlocked the copy:
     * the drop author will not need anymore to do the expected number of correction to see his copy.).
     *
     * @ORM\Column(name="unlocked_user", type="boolean", nullable=false)
     */
    protected $unlockedUser = false;

    /**
     * @ORM\Column(name="team_id", type="integer", nullable=true)
     */
    protected $teamId;

    /**
     * @ORM\Column(name="team_name", nullable=true)
     */
    protected $teamName;

    /**
     * @ORM\OneToMany(
     *     targetEntity="Claroline\DropZoneBundle\Entity\Correction",
     *     mappedBy="drop"
     * )
     */
    protected $corrections;

    /**
     * @ORM\ManyToMany(
     *     targetEntity="Claroline\CoreBundle\Entity\User"
     * )
     * @ORM\JoinTable(name="claro_dropzonebundle_drop_users")
     */
    protected $users;

    public function __construct()
    {
        $this->refreshUuid();
        $this->documents = new ArrayCollection();
        $this->corrections = new ArrayCollection();
        $this->users = new ArrayCollection();
    }

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getDropzone()
    {
        return $this->dropzone;
    }

    public function setDropzone(Dropzone $dropzone)
    {
        $this->dropzone = $dropzone;
    }

    public function getUser()
    {
        return $this->user;
    }

    public function setUser(User $user = null)
    {
        $this->user = $user;
    }

    public function getDocuments()
    {
        return $this->documents->toArray();
    }

    public function addDocument(Document $document)
    {
        if (!$this->documents->contains($document)) {
            $this->documents->add($document);
        }
    }

    public function removeDocument(Document $document)
    {
        if ($this->documents->contains($document)) {
            $this->documents->removeElement($document);
        }
    }

    public function emptyDocuments()
    {
        $this->documents->clear();
    }

    public function getDropDate()
    {
        return $this->dropDate;
    }

    public function setDropDate(\DateTime $dropDate = null)
    {
        $this->dropDate = $dropDate;
    }

    public function getScore()
    {
        return $this->score;
    }

    public function setScore($score)
    {
        $this->score = $score;
    }

    public function isReported()
    {
        return $this->reported;
    }

    public function setReported($reported)
    {
        $this->reported = $reported;
    }

    public function isFinished()
    {
        return $this->finished;
    }

    public function setFinished($finished)
    {
        $this->finished = $finished;
    }

    public function getNumber()
    {
        return $this->number;
    }

    public function setNumber($number)
    {
        $this->number = $number;
    }

    public function getAutoClosedDrop()
    {
        return $this->autoClosedDrop;
    }

    public function setAutoClosedDrop($autoClosedDrop)
    {
        $this->autoClosedDrop = $autoClosedDrop;
    }

    public function isUnlockedDrop()
    {
        return $this->unlockedDrop;
    }

    public function setUnlockedDrop($unlockedDrop)
    {
        $this->unlockedDrop = $unlockedDrop;
    }

    public function isUnlockedUser()
    {
        return $this->unlockedUser;
    }

    public function setUnlockedUser($unlockedUser)
    {
        $this->unlockedUser = $unlockedUser;
    }

    public function getTeamId()
    {
        return $this->teamId;
    }

    public function setTeamId($teamId)
    {
        $this->teamId = $teamId;
    }

    public function getTeamName()
    {
        return $this->teamName;
    }

    public function setTeamName($teamName)
    {
        $this->teamName = $teamName;
    }

    public function getCorrections()
    {
        return $this->corrections->toArray();
    }

    public function addCorrection(Correction $correction)
    {
        if (!$this->corrections->contains($correction)) {
            $this->corrections->add($correction);
        }
    }

    public function removeCorrection(Correction $correction)
    {
        if ($this->corrections->contains($correction)) {
            $this->corrections->removeElement($correction);
        }
    }

    public function emptyCorrections()
    {
        $this->corrections->clear();
    }

    public function getUsers()
    {
        return $this->users->toArray();
    }

    public function hasUser(User $user)
    {
        return $this->users->contains($user);
    }

    public function addUser(User $user)
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
        }
    }

    public function removeUser(User $user)
    {
        if ($this->users->contains($user)) {
            $this->users->removeElement($user);
        }
    }

    public function emptyUsers()
    {
        $this->users->clear();
    }
}
