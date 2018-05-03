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
     *     cascade={"persist", "remove"}
     * )
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    protected $subject;

    /**
     * @ORM\Column(type="boolean")
     */
    protected $isVisible = true;

    public function setSubject(Subject $subject)
    {
        $this->subject = $subject;
    }

    public function getSubject()
    {
        return $this->subject;
    }

    public function setIsVisible($bool)
    {
        $this->isVisible = $bool;
    }

    public function isVisible()
    {
        return $this->isVisible;
    }
}
