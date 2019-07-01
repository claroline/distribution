<?php

namespace Claroline\AppBundle\API;

use Claroline\AppBundle\Persistence\ObjectManager;
use JMS\DiExtraBundle\Annotation as DI;
use JVal\Context;
use JVal\Registry;
use JVal\Resolver;
use JVal\Uri;
use JVal\Utils;
use JVal\Walker;

/**
 * @DI\Service("claroline.api.schema")
 */
class SchemaProvider
{
    /**
     * The list of registered serializers in the platform.
     *
     * @var array
     */
    private $serializers = [];
    /** @var ObjectManager */
    private $rootDir;
    /** @var string */
    private $baseUri;

    /**
     * Injects Serializer service.
     *
     * @DI\InjectParams({
     *      "rootDir" = @DI\Inject("%kernel.root_dir%")
     * })
     *
     * @param ObjectManager $om
     * @param string        $rootDir
     */
    public function setRootDir($rootDir)
    {
        $this->rootDir = $rootDir.'/..';
        $this->baseUri = 'https://github.com/claroline/Distribution/tree/master';
    }

    /**
     * Registers a new serializer.
     *
     * @param mixed $serializer
     *
     * @throws \Exception
     */
    public function add($serializer)
    {
        if (method_exists($serializer, 'getSchema')) {
            $this->serializers[] = $serializer;
        }
    }

    /**
     * Returns the class handled by the schema provider.
     *
     * @param mixed $serializer
     *
     * @return $string
     */
    public function getSchemaHandledClass($serializer)
    {
        if (method_exists($serializer, 'getClass')) {
            // 1. the serializer implements the getClass method, so we just call it
            //    this is the recommended way because it's more efficient than using reflection
            return $serializer->getClass();
        } else {
            // 2. else, we try to find the correct serializer by using the type hint of the `serialize` method
            //    this is not always possible, because some serializers can not use type hint (mostly because of an Interface),
            //    so for this case the `getClass` method is required
            $p = new \ReflectionParameter([get_class($serializer), 'serialize'], 0);

            return $p->getClass()->getName();
        }
    }

    /**
     * Gets a registered serializer instance.
     *
     * @param mixed $object
     *
     * @return mixed
     *
     * @throws \Exception
     */
    public function get($class)
    {
        foreach ($this->serializers as $serializer) {
            if ($class === $this->getSchemaHandledClass($serializer)) {
                return $serializer;
            }
        }

        //no exception to not break everything atm
    }

    /**
     * Check if serializer instance exists.
     *
     * @param mixed $object
     *
     * @return mixed
     *
     * @throws \Exception
     */
    public function has($class)
    {
        // search for the correct serializer
        foreach ($this->serializers as $serializer) {
            if ($class === $this->getSchemaHandledClass($serializer)) {
                return true;
            }
        }

        false;
    }

    /**
     * Get the identifier list from the json schema.
     */
    public function getIdentifiers($class)
    {
        $schema = $this->getSchema($class);

        if (isset($schema->claroline)) {
            return $schema->claroline->ids;
        }
    }

    /**
     * Gets the json schema of a class.
     *
     * @param string $class
     *
     * @return \stdClass
     */
    public function getSchema($class, array $options = [])
    {
        $serializer = $this->get($class);

        if (method_exists($serializer, 'getSchema')) {
            $url = $serializer->getSchema();
            $path = explode('/', $url);
            array_shift($path); //that one is for the #, we have no implementation for plugins yet
            $first = array_shift($path);
            $sec = array_shift($path);
            $absolutePath = $this->rootDir.'/vendor/claroline/distribution/'
            .$first.'/'.$sec.'/Resources/schemas/'.implode('/', $path);

            $schema = $this->loadSchema($absolutePath);

            if (in_array(Options::IGNORE_COLLECTIONS, $options) && isset($schema->properties)) {
                foreach ($schema->properties as $key => $property) {
                    if ('array' === $property->type) {
                        unset($schema->properties->{$key});
                    }
                }
            }

            return $schema;
        }
    }

    /**
     * Loads a json schema.
     *
     * @param string $path
     *
     * @return \stdClass
     */
    public function loadSchema($path)
    {
        $schema = Utils::LoadJsonFromFile($path);

        $hook = function ($uri) {
            return $this->resolveRef($uri);
        };

        //this is the resolution of the $ref thingy with Jval classes
        //resolver can take a Closure parameter to change the $ref value
        $resolver = new Resolver();
        $resolver->setPreFetchHook($hook);
        $walker = new Walker(new Registry(), $resolver);
        $schema = $walker->resolveReferences($schema, new Uri(''));

        return $walker->parseSchema($schema, new Context());
    }

    /**
     * @param string $class
     *
     * @return string
     */
    public function getSampleDirectory($class)
    {
        $serializer = $this->get($class);

        if (method_exists($serializer, 'getSamples')) {
            $url = $serializer->getSamples();
            $path = explode('/', $url);

            return $this->rootDir.'/vendor/claroline/distribution/'
              .$path[1].'/'.$path[2].'/Resources/samples/'.$path[3];
        }
    }

    /**
     * Converts distant schema URI to a local one to load schemas from source code.
     *
     * @param string $uri
     *
     * @return string mixed
     */
    private function resolveRef($uri)
    {
        $uri = str_replace($this->baseUri, '', $uri);
        $schemaDir = realpath("{$this->rootDir}/vendor/claroline/distribution");

        return $schemaDir.'/'.$uri;
    }
}
