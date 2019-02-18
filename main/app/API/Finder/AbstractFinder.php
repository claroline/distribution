<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\AppBundle\API\Finder;

use Claroline\AppBundle\API\Options;
use Claroline\AppBundle\Event\StrictDispatcher;
use Claroline\AppBundle\Persistence\ObjectManager;
use Claroline\CoreBundle\Event\SearchObjectsEvent;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\NativeQuery;
use Doctrine\ORM\Query;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Doctrine\ORM\QueryBuilder;
use JMS\DiExtraBundle\Annotation as DI;

abstract class AbstractFinder implements FinderInterface
{
    /** @var ObjectManager */
    protected $om;
    /** @var EntityManager */
    protected $_em;
    /** @var StrictDispatcher */
    private $eventDispatcher;

    /**
     * AbstractFinder constructor.
     *
     * @DI\InjectParams({
     *      "om"              = @DI\Inject("claroline.persistence.object_manager"),
     *      "em"              = @DI\Inject("doctrine.orm.entity_manager"),
     *      "eventDispatcher" = @DI\Inject("claroline.event.event_dispatcher")
     * })
     *
     * @param ObjectManager    $om
     * @param EntityManager    $em
     * @param StrictDispatcher $eventDispatcher
     */
    public function setObjectManager(
        ObjectManager $om,
        EntityManager $em,
        StrictDispatcher $eventDispatcher
    ) {
        $this->om = $om;
        $this->_em = $em;
        $this->eventDispatcher = $eventDispatcher;
    }

    /**
     * The queried object is already named "obj".
     *
     * @param QueryBuilder $qb
     * @param array        $searches
     * @param array|null   $sortBy
     * @param array        $options
     */
    abstract public function configureQueryBuilder(QueryBuilder $qb, array $searches, array $sortBy = null, array $options = ['count' => false, 'page' => 0, 'limit' => -1]);

    public function find(array $filters = [], array $sortBy = null, $page = 0, $limit = -1, $count = false, $options = [])
    {
        //sorting is not required when we count stuff
        $sortBy = $count ? null : $sortBy;

        /** @var QueryBuilder $qb */
        $qb = $this->om->createQueryBuilder();
        $qb->select($count ? 'COUNT(DISTINCT obj)' : 'DISTINCT obj')->from($this->getClass(), 'obj');
        //make an option parameters for query builder ?
        $queryOptions = [
            'page' => $page,
            'limit' => $limit,
            'count' => $count,
        ];

        // Let's the whole app knows we are doing a search with an event
        // ATTENTION : This needs to be done first because if a listener manage a filter (like Tags),
        // it needs to be removed from list of filters to avoid the finder implementation to process it

        /** @var SearchObjectsEvent $event */
        $event = $this->eventDispatcher->dispatch('objects.search', SearchObjectsEvent::class, [
            'queryBuilder' => $qb,
            'objectClass' => $this->getClass(),
            'filters' => $filters,
            'sortBy' => $sortBy,
            'page' => $page,
            'limit' => $limit,
        ]);

        // filter query - let's the finder implementation process the filters to configure query
        $query = $this->configureQueryBuilder($qb, $event->getFilters(), $sortBy, $queryOptions);

        if ($query instanceof QueryBuilder) {
            $qb = $query;
        }

        if (!($query instanceof NativeQuery)) {
            // order query if implementation has not done it
            $this->sortResults($qb, $sortBy);
            if (!$count && 0 < $limit) {
                $qb->setFirstResult($page * $limit);
                $qb->setMaxResults($limit);
            }

            $query = $qb->getQuery();
        }

        if (in_array(Options::SQL_ARRAY_MAP, $options)) {
            return $query->getArrayResult();
        }

        return $count ? (int) $query->getSingleScalarResult() : $query->getResult();
    }

    public function findOneBy(array $filters = [])
    {
        $data = $this->find($filters);

        if (count($data) > 1) {
            throw new \Exception('Multiple results found ('.count($data).')');
        } elseif (0 === count($data)) {
            return null;
        }

        return $data[0];
    }

    /**
     * @param QueryBuilder $qb
     * @param array|null   $sortBy
     */
    private function sortResults(QueryBuilder $qb, array $sortBy = null)
    {
        if ($sortBy && $sortBy['property'] && 0 !== $sortBy['direction']) {
            // query needs to be sorted, check if the Finder implementation has a custom sort system
            $queryOrder = $qb->getDQLPart('orderBy');
            if (!$queryOrder) {
                // no order by defined
                $qb->orderBy('obj.'.$sortBy['property'], 1 === $sortBy['direction'] ? 'ASC' : 'DESC');
            }
        }
    }

    //     .--..--..--..--..--..--.
    //   .' \  (`._   (_)     _   \
    // .'    |  '._)         (_)  |
    // \ _.')\      .----..---.   /
    // |(_.'  |    /    .-\-.  \  |
    // \     0|    |   ( O| O) | o|
    //  |  _  |  .--.____.'._.-.  |
    //  \ (_) | o         -` .-`  |
    //   |    \   |`-._ _ _ _ _\ /
    //   \    |   |  `. |_||_|   |
    //   | o  |    \_      \     |     -.   .-.
    //   |.-.  \     `--..-'   O |     `.`-' .'
    // _.'  .' |     `-.-'      /-.__   ' .-'
    // .' `-.` '.|='=.='=.='=.='=|._/_ `-'.'
    // `-._  `.  |________/\_____|    `-.'
    //  .'   ).| '=' '='\/ '=' |
    //  `._.`  '---------------'
    //          //___\   //___\
    //            ||       ||
    //            ||_.-.   ||_.-.
    //           (_.--__) (_.--__)
    //
    // This is going to be wtf until the end of file. We're more or less implementing the union for our query builder.
    // ONLY ONE PER REQUEST MAXS
    //
    public function union(array $firstSearch, array $secondSearch, array $options = [], array $sortBy = null)
    {
        //let doctrine do its stuff for the fist part
        $firstQb = $this->om->createQueryBuilder();
        $extraSelect = $options['count'] ? [] : $this->getExtraSelect();
        $firstQb->select('DISTINCT obj', ...$extraSelect)->from($this->getClass(), 'obj');
        /** @var SearchObjectsEvent $event */
        $build = $this->configureQueryBuilder($firstQb, $firstSearch);
        $event = $this->eventDispatcher->dispatch('objects.search', SearchObjectsEvent::class, [
            'queryBuilder' => $firstQb,
            'objectClass' => $this->getClass(),
            'filters' => $firstSearch,
            'sortBy' => $sortBy,
        ]);

        $firstQb = $build ? $build : $firstQb;
        //this is our first part of the union

        $firstQ = $firstQb->getQuery();
        $firstSql = $this->getSql($firstQ);

        //new qb for the 2nd part
        $secQb = $this->om->createQueryBuilder();
        $secQb->select('DISTINCT obj', ...$extraSelect)->from($this->getClass(), 'obj');

        $build = $this->configureQueryBuilder($secQb, $secondSearch);

        $event = $this->eventDispatcher->dispatch('objects.search', SearchObjectsEvent::class, [
            'queryBuilder' => $secQb,
            'objectClass' => $this->getClass(),
            'filters' => $secondSearch,
            'sortBy' => $sortBy,
        ]);

        $secQb = $build ? $build : $secQb;
        //this is the second part of the union
        $secQ = $secQb->getQuery();

        $secSql = $this->getSql($secQ);
        $sql = $firstSql.' UNION '.$secSql;
        $query = $this->buildQueryFromSql($sql, $options, $sortBy);

        $parameters = new ArrayCollection(array_merge(
          $firstQb->getParameters()->toArray(),
          $secQb->getParameters()->toArray()
        ));

        foreach ($parameters as $k => $p) {
            $query->setParameter($k, $p->getValue(), $p->getType());
        }

        return $query;
    }

    private function getSql(Query $query)
    {
        $sql = $query->getSql();
        //we may find a way to turn the getExtraSelect() into something nice here but not many idea on how to do it.
        //the qb getAllAliases() func doesn't return what's needed
        $sql = preg_replace('/ AS \S+/', ',', $sql);
        $sql = str_replace(', FROM', ' FROM', $sql);

        foreach ($this->getAliases() as $property => $alias) {
            $sql = str_replace(', '.$property, ', '.$property.' AS '.$alias, $sql);
        }

        return $sql;
    }

    private function buildQueryFromSql($sql, array $options, array $sortBy = null)
    {
        if ($options['count']) {
            $sql = "SELECT COUNT(*) as count FROM ($sql) AS wathever";
            $rsm = new ResultSetMapping();
            $rsm->addScalarResult('count', 'count', 'integer');
            $query = $this->_em->createNativeQuery($sql, $rsm);
        } else {
            //add page & limit
            $sql .= ' '.$this->getSqlOrderBy($sortBy);

            if ($options['limit'] > -1) {
                $sql .= ' LIMIT '.$options['limit'];
            }

            if ($options['limit'] > 0) {
                $offset = $options['limit'] * $options['page'];
                $sql .= ' OFFSET  '.$offset;
            }

            $rsm = new ResultSetMappingBuilder($this->_em);
            $rsm->addRootEntityFromClassMetadata($this->getClass(), 'c0_');
            $query = $this->_em->createNativeQuery($sql, $rsm);
            $query = $this->_em->createQuery($sql);
        }

        return $query;
    }

    private function getSqlOrderBy(array $sortBy = null)
    {
        if ($sortBy && $sortBy['property'] && 0 !== $sortBy['direction']) {
            // no order by defined
            $property = array_key_exists($sortBy['property'], $this->getExtraFieldMapping()) ?
               $this->getExtraFieldMapping()[$sortBy['property']] :
               $this->getSqlPropertyFromMapping($sortBy['property']);

            if ($property) {
                $sql = 'ORDER BY '.$property.' ';
                $dir = 1 === $sortBy['direction'] ? 'ASC' : 'DESC';

                return $sql.$dir;
            }
        }

        return '';
    }

    public function setDefaults(QueryBuilder $qb, $filterName, $filterValue)
    {
        if (!property_exists($this->getClass(), $filterName)) {
            return;
        }

        if (is_string($filterValue)) {
            $qb->andWhere("UPPER(obj.{$filterName}) LIKE :{$filterName}");
            $qb->setParameter($filterName, '%'.strtoupper($filterValue).'%');
        } else {
            $qb->andWhere("obj.{$filterName} = :{$filterName}");
            $qb->setParameter($filterName, $filterValue);
        }
    }

    private function getSqlPropertyFromMapping($property)
    {
        $metadata = $this->om->getClassMetadata($this->getClass());

        return $metadata->getColumnName($property);
    }

    public function getExtraFieldMapping()
    {
        return [];
    }

    public function getExtraSelect()
    {
        return [];
    }

    public function getAliases()
    {
        return [];
    }
}
