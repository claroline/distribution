<?php

namespace Claroline\AppBundle\Routing;

use Claroline\AppBundle\Annotations\ApiDoc;
use Claroline\AppBundle\API\FinderProvider;
use Claroline\AppBundle\API\SerializerProvider;
use Doctrine\Common\Annotations\Reader;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * @DI\Service("claroline.api.routing.documentator")
 */
class Documentator
{
    /**
     * Crud constructor.
     *
     * @DI\InjectParams({
     *     "finder"     = @DI\Inject("claroline.api.finder"),
     *     "serializer" = @DI\Inject("claroline.api.serializer"),
     *     "reader"    = @DI\Inject("annotation_reader")
     * })
     *
     * @param Router $router
     */
    public function __construct(
        FinderProvider $finder,
        SerializerProvider $serializer,
        Reader $reader
    ) {
        $this->finder = $finder;
        $this->serializer = $serializer;
        $this->reader = $reader;
    }

    public function document($route)
    {
        $base = [
            'url' => $route->getPath(),
            'method' => $route->getMethods(),
        ];

        $defaults = $route->getDefaults();

        if (isset($defaults['_controller'])) {
            $parts = explode(':', $defaults['_controller']);
            $class = $parts[0];
            $method = $parts[2];
            $extended = [];

            if (class_exists($class)) {
                $refClass = new \ReflectionClass($class);
                $controller = $refClass->newInstanceWithoutConstructor();
                $objectClass = $controller->getClass();

                if (method_exists($class, $method)) {
                    $refMethod = new \ReflectionMethod($class, $method);
                    $doc = $this->reader->getMethodAnnotation($refMethod, 'Claroline\\AppBundle\\Annotations\\ApiDoc');

                    if ($doc) {
                        $extended = $this->parseDoc($doc, $objectClass);
                    }
                }
            }
        }

        return array_merge($base, $extended);
    }

    private function parseDoc(ApiDoc $doc, $objectClass)
    {
        $data = [];

        $description = $doc->getDescription() ?
          $this->parseDescription($doc->getDescription(), $objectClass) : null;

        $queryString = $doc->getQueryString() ?
            $this->parseQueryString($doc->getQueryString(), $objectClass) : null;

        $body = $doc->getBody() ?
            $this->parseBody($doc->getBody(), $objectClass) : null;

        if ($description) {
            $data['description'] = $description;
        }

        if ($queryString) {
            $data['queryString'] = $queryString;
        }

        if ($doc->getParameters()) {
            $data['parameters'] = $doc->getParameters();
        }

        if ($body) {
            $data['body'] = $body;
        }

        return $data;
    }

    private function parseDescription($description, $objectClass)
    {
        return str_replace('$class', $objectClass, $description);
    }

    private function parseQueryString($queryStrings, $objectClass)
    {
        $doc = [];

        foreach ($queryStrings as $query) {
            if ('$finder' === $query) {
                $finder = $this->finder->get($objectClass);
                $finderDoc = [];

                if (method_exists($finder, 'getFilters')) {
                    $filters = $finder->getFilters();

                    foreach ($filters as $name => $data) {
                        $finderDoc[] = [
                            'name' => "filter[{$name}]",
                            'type' => $data['type'],
                            'description' => $data['description'],
                        ];
                    }

                    $doc = array_merge($finderDoc, $doc);
                }
            } else {
                $doc[] = $query;
            }
        }

        return $doc;
    }

    private function parseBody($body, $objectClass)
    {
        if (is_array($body)) {
            if (isset($body['schema']) && '$schema' === $body['schema']) {
                $body['schema'] = $this->serializer->getSchema($objectClass);
            }
        }

        return $body;
    }
}
