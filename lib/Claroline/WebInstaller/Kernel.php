<?php

namespace Claroline\WebInstaller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class Kernel implements HttpKernelInterface
{
    private $rootDirectory;

    public function __construct($rootDirectory)
    {
        $this->rootDirectory = $rootDirectory;
    }

    public function handle(Request $request, $type = self::MASTER_REQUEST, $catch = true)
    {
        $request->setSession(new Session());
        $container = new Container($request, $this->rootDirectory);
        $controller = new Controller($container);
        $pathInfo = $request->getPathInfo();
        $method = $request->getMethod();
        $response = null;

        if ($pathInfo === '/' && $method === 'GET') {
            $response = $controller->languageStep();
        } elseif ($pathInfo === '/' && $method === 'POST') {
            $response = $controller->languageStepSubmit();
        } elseif ($pathInfo === '/requirements' && $method === 'GET') {
            $response = $controller->requirementStep();
        } elseif ($pathInfo === '/database' && $method === 'GET') {
            $response = $controller->databaseStep();
        } elseif ($pathInfo === '/database' && $method === 'POST') {
            $response = $controller->databaseStepSubmit();
        } elseif ($pathInfo === '/platform' && $method === 'GET') {
            $response = $controller->platformStep();
        } elseif ($pathInfo === '/platform' && $method === 'POST') {
            $response = $controller->platformSubmitStep();
        }

        $response = $response ?: new Response('<h1>Page not found</h1>', 404);
        $response->send();
    }
}
