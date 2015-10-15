# DevBundle

Bundle gathering tools, libraries and commands useful for Claroline
development.

## Tools and libraries

### [PHPUnit](https://phpunit.de/)

Unit testing framework.

### [PHP-CS-Fixer](http://cs.sensiolabs.org/)

Detects and fixes coding standard violations. The configuration included 
in this bundle relies on PSR-* and Symfony coding standards (see 
[http://symfony.com/doc/master/contributing/code/standards.html]
(http://symfony.com/doc/master/contributing/code/standards.html)).

### [vfsStream](http://vfs.bovigo.org/)

Creates a virtual filesystem (useful for mocking the real one in unit tests). 

### [Travis CI](http://travis-ci.org)

Offers a continuous integration service for building and testing
projects hosted at github.

This bundle provides a few scripts and resources for setting up a
working environment for Claroline bundles on travis. Basically,
the procedure described below will reproduce a minimal app structure,
with a test database and all the dependencies required by your
bundle.

Here are the steps to getting started:

1) Activate travis for your bundle's github repository (just follow the
   instructions at [http://travis-ci.org](http://travis-ci.org)).
2) Make sure you have a *phpunit.xml* file located in the root directory
   of your bundle. If you don't, you can copy the [default config file]
   (https://github.com/claroline/DevBundle/tree/master/Resources/travis/phpunit.xml)
   provided by this bundle.
3) Include this bundle in the dev dependencies of your bundle:
```json
   "require-dev": {
       "claroline/dev-bundle": "dev-master"
   }
```
4) Place this [.travis.yml](https://github.com/claroline/DevBundle/tree/master/Resources/travis/.travis.yml)
   in the root directory of your bundle.
5) Commit and push/PR, and you should see a travis build starting.

## Commands

### claroline:debug:service OWNER SERVICE_NAME METHOD_NAME PARAMETERS [-a]
This command fires a method of a service. It's allows you to see your logs in real time and is especially convenient for debugging doctrine with the -a parameter (doctrine flushes are shown).

- OWNER: the username of the user starting the action (it's injected into the symfony2 token storage service).
- SERVICE_NAME: the service you want to execute.
- METHOD_NAME:  The method you want to fire.
- PARAMETERS: The list of parameters your function needs. It currently support only 'simple' type (ie: string, int, boolean). If the parameter is an entity, you can pass its id and the object will be retrieved.
- [-a]: Show the doctrine logs.

`php app/console claroline:debug:service root claroline.manager.workspace_manager createWorkspaceFromModel 2 1 lh lh -a -vvv`

### claroline:debug:translation LANGUAGE [--domain=] [--main_lang=] [--fqcn=] [-f]
This command will allow you to reorder translations and adding the missing keys of foreign languages files. It will show you missing translations in the console (those where the translation keys are equals to the translations).

- LOCALE : The language you want to check.
- [--domain=]:  the translation domain (default: platform)
- [--main_lang]= : the language file containing all translations (default: fr)
- [--fqcn]= : The bundle you want to check the translations (default: ClarolineCoreBundle)
- [-f]: Update the translation file (reorder and inject the missing keys).

`php app/console claroline:debug:translation en --domain=forum --main_lang=fr --fqcn=ClarolineForumBundle -f`

### claroline:tool [tool [bundle]]

Launches one of the available tool scripts (located in 
*./Resources/scripts/tools*) for a given bundle.

This command can be used interactively (e.g. to see the 
list of available tools) :

`php app/console claroline:tool`

**Available tools:**

- *cs*: applies PHP-CS-fixer to the bundle
- *cs-dry*: applies PHP-CS-fixer diff (no changes, just preview) to the bundle