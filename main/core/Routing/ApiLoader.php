<?php

// src/AppBundle/Routing/ExtraLoader.php
namespace Claroline\CoreBundle\Routing;

use Claroline\CoreBundle\Annotations\ApiMeta;
use Doctrine\Common\Annotations\Reader;
use JMS\DiExtraBundle\Annotation as DI;
use Symfony\Component\Config\FileLocatorInterface;
use Symfony\Component\Config\Loader\Loader;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;

/**
 * @DI\Service("claroline.routing.api_loader")
 * @DI\Tag("routing.loader")
 */
class ApiLoader extends Loader
{
    private $loaded = false;

    /**
     * @DI\InjectParams({
     *     "locator"   = @DI\Inject("file_locator"),
     *     "reader"    = @DI\Inject("annotation_reader"),
     *     "container" = @DI\Inject("service_container")
     * })
     */
    public function __construct(
      FileLocatorInterface $locator,
      Reader $reader,
      ContainerInterface $container
    ) {
        $this->locator = $locator;
        $this->container = $container;
        $this->reader = $reader;
    }

    public function load($resource, $type = null)
    {
        if (true === $this->loaded) {
            throw new \RuntimeException('Do not add the "api" loader twice');
        }

        $path = $this->locator->locate($resource);
        $routes = new RouteCollection();

        foreach (new \DirectoryIterator($path) as $fileInfo) {
            if (!$fileInfo->isDot()) {
                $file = $fileInfo->getPathname();

                $defaults = [
                  'create' => ['', 'POST'],
                  'update' => ['{uuid}', 'PUT'],
                  'deleteBulk' => ['', 'DELETE'],
                  'list' => ['', 'GET'],
                ];

                //find prefix from annotations
                $controller = $this->findClass($file);

                if ($controller) {
                    $refClass = new \ReflectionClass($controller);
                    $found = false;

                    foreach ($this->reader->getClassAnnotations($refClass) as $annotation) {
                        if ($annotation instanceof ApiMeta) {
                            $found = true;
                            $prefix = $annotation->prefix;
                            $class = $annotation->class;
                        }
                    }

                    if ($found) {
                        foreach ($defaults as $name => $options) {
                            $pattern = '/'.$prefix.'/'.$options[0];
                            $routeDefaults = [
                              '_controller' => $controller.'::'.$name,
                              'class' => $class,
                              'env' => $this->container->getParameter('kernel.environment'),
                            ];

                            $route = new Route($pattern, $routeDefaults, []);
                            $route->setMethods([$options[1]]);

                            // add the new route to the route collection:
                            $routeName = 'apiv2_'.$prefix.'_'.$name;
                            $routes->add($routeName, $route);
                        }

                        //add Traits here

                        $imported = $this->import($resource, 'annotation');
                        $routes->addCollection($imported);
                    }
                }
            }
        }

        return $routes;
    }

    /**
     * {@inheritdoc}
     */
    public function supports($resource, $type = null)
    {
        return is_string($resource) && 'api' === $type;
    }

    /**
     * Returns the full class name for the first class in the file.
     * From the loader classes of sf2 itself.
     *
     * @param string $file A PHP file path
     *
     * @return string|false Full class name if found, false otherwise
     */
    protected function findClass($file)
    {
        $class = false;
        $namespace = false;
        $tokens = token_get_all(file_get_contents($file));
        if (1 === count($tokens) && T_INLINE_HTML === $tokens[0][0]) {
            throw new \InvalidArgumentException(sprintf('The file "%s" does not contain PHP code. Did you forgot to add the "<?php" start tag at the beginning of the file?', $file));
        }
        for ($i = 0; isset($tokens[$i]); ++$i) {
            $token = $tokens[$i];
            if (!isset($token[1])) {
                continue;
            }
            if (true === $class && T_STRING === $token[0]) {
                return $namespace.'\\'.$token[1];
            }
            if (true === $namespace && T_STRING === $token[0]) {
                $namespace = $token[1];
                while (isset($tokens[++$i][1]) && in_array($tokens[$i][0], [T_NS_SEPARATOR, T_STRING])) {
                    $namespace .= $tokens[$i][1];
                }
                $token = $tokens[$i];
            }
            if (T_CLASS === $token[0]) {
                // Skip usage of ::class constant
                $isClassConstant = false;
                for ($j = $i - 1; $j > 0; --$j) {
                    if (!isset($tokens[$j][1])) {
                        break;
                    }
                    if (T_DOUBLE_COLON === $tokens[$j][0]) {
                        $isClassConstant = true;
                        break;
                    } elseif (!in_array($tokens[$j][0], [T_WHITESPACE, T_DOC_COMMENT, T_COMMENT])) {
                        break;
                    }
                }
                if (!$isClassConstant) {
                    $class = true;
                }
            }
            if (T_NAMESPACE === $token[0]) {
                $namespace = true;
            }
        }

        return false;
    }
}
