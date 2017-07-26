<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Twig;

use JMS\DiExtraBundle\Annotation\Inject;
use JMS\DiExtraBundle\Annotation\InjectParams;
use JMS\DiExtraBundle\Annotation\Service;
use JMS\DiExtraBundle\Annotation\Tag;

/**
 * @Service
 * @Tag("twig.extension")
 */
class SearcherExtension extends \Twig_Extension
{
    protected $container;

    /**
     * @InjectParams({
     *     "container" = @Inject("service_container")
     * })
     */
    public function __construct($container)
    {
        $this->container = $container;
    }

    public function getFunctions()
    {
        return [
            'search' => new \Twig_Function_Method($this, 'search'),
        ];
    }

    public function getName()
    {
        return 'searcher_extension';
    }

    public function search($class, $offset, $limit, $queryOptions, $serializerOptions)
    {
        return $this->container->get('claroline.API.finder')->search(
            $class,
            $offset,
            $limit,
            $queryOptions,
            $serializerOptions
        )['results'];
    }
}
