<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\ForumBundle\Entity;

use Claroline\CoreBundle\Entity\AbstractMessage;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="claro_forum_message")
 */
class Message extends AbstractMessage
{
    /**
     * @ORM\ManyToOne(
     *     targetEntity="Claroline\ForumBundle\Entity\Subject",
     *     inversedBy="messages",
     *     cascade={"persist"}
     * )
     */
    protected $subject;

    /**
     * @ORM\ManyToOne(
     *     targetEntity="Claroline\ForumBundle\Entity\Message",
     *     inversedBy="children"
     * )
     */
    protected $parent;

    /**
     * @ORM\OneToMany(
     *     targetEntity="Claroline\ForumBundle\Entity\Message",
     *     mappedBy="parent"
     * )
     */
    protected $children;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $visible = true;

    /**
     * @ORM\Column(type="boolean")
     * todo: renommer
     */
    protected $flagged = false;

    //required because we use a "property_exists" somewhere in the crud and it doesn't work otherwise.
    protected $uuid;

    public function setSubject(Subject $subject)
    {
        $this->subject = $subject;
    }

    public function getSubject()
    {
        return $this->subject;
    }

    public function setVisible($bool)
    {
        $this->visible = $bool;
    }

    public function isVisible()
    {
        return $this->visible;
    }

    public function setParent(self $parent)
    {
        $this->parent = $parent;
    }

    public function getParent()
    {
        return $this->parent;
    }

    public function getChildren()
    {
        return $this->children;
    }

    public function setFlagged($bool)
    {
        $this->flagged = $bool;
    }

    public function isFlagged()
    {
        return $this->flagged;
    }
}
