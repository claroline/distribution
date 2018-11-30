<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\SlideshowBundle\Controller;

use Claroline\AppBundle\Annotations\ApiMeta;
use Claroline\AppBundle\Controller\AbstractCrudController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration as EXT;

/**
 * @ApiMeta(class="Claroline\SlideshowBundle\Entity\Resource\Slideshow")
 * @EXT\Route("/slideshow")
 */
class SlideshowController extends AbstractCrudController
{
    public function getName()
    {
        return 'slideshow';
    }
}
