<?php

namespace Claroline\CoreBundle\Tests\Security;

use Claroline\CoreBundle\Library\Testing\TransactionalTestCase;

/**
 * These tests are related to the /api/ firewall.
 */
class APISecurityTest extends TransactionalTestCase
{
    private $container;

    protected function setUp()
    {
        parent::setUp();
        $this->container = $this->client->getContainer();
        $this->persister = $this->container->get('claroline.library.testing.persister');
    }

    public function testUserPasswordOauthAuthentication()
    {
        $grantTypes = ['password', 'refresh_token'];
        $client = $this->newClient('user', $grantTypes);
        $user = $this->persister->user('user');
        $request = "/oauth/v2/token?client_id={$client->getConcatRandomId()}&client_secret={$client->getSecret()}&grant_type=password&username={$user->getUsername()}&password={$user->getUsername()}";
        $this->client->request('GET', $request);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertTrue(array_key_exists('access_token', $data));
        $token = $data['access_token'];

        //are we properly identified ?
        $this->client->request('GET', "/api/connected_user?access_token={$token}");
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals($data['username'], 'user');

        //try to access something protected with the token
        $this->client->request('GET', "/api/users?access_token={$token}");
        $this->assertEquals(403, $this->client->getResponse()->getStatusCode());

        //it currently returns a stack trace. Maybe we should hide it
    }

    public function testAdminPasswordOauthAuthentication()
    {
        $grantTypes = ['password', 'refresh_token'];
        $client = $this->newClient('user', $grantTypes);
        $admin = $this->persister->user('admin');
        $role = $this->persister->role('ROLE_ADMIN');
        $admin->addRole($role);
        $this->persister->persist($admin);
        $this->persister->flush();

        $request = "/oauth/v2/token?client_id={$client->getConcatRandomId()}&client_secret={$client->getSecret()}&grant_type=password&username={$admin->getUsername()}&password={$admin->getUsername()}";
        $this->client->request('GET', $request);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertTrue(array_key_exists('access_token', $data));
        $token = $data['access_token'];

        //try to access something protected with the token
        $this->client->request('GET', "/api/users?access_token={$token}");
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals($data[0]['username'], 'admin');
    }

    public function testMasterOauthAuthentication()
    {
        $grantTypes = ['refresh_token', 'client_credentials'];
        $client = $this->newClient('master', $grantTypes);

        //get the master token
        $request = "/oauth/v2/token?client_id={$client->getConcatRandomId()}&client_secret={$client->getSecret()}&grant_type=client_credentials";
        $this->client->request('GET', $request);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertTrue(array_key_exists('access_token', $data));
        $token = $data['access_token'];
        $user = $this->persister->user('user');
        //try to access an admininistration protected url
        $this->client->request('GET', "/api/users?access_token={$token}");
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals($data[0]['username'], 'user');
    }

    public function testCookieAuthentication()
    {
        $user = $this->persister->user('user');
        //this method is defined in the super class and uses a Cookie
        $this->login($user);
        $this->client->request('GET', '/api/connected_user');
        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals($data['username'], 'user');
    }

    public function testHttpAuthentication()
    {
        $user = $this->persister->user('user');

        $this->client->request(
            'GET',
            '/api/connected_user',
            [],
            [],
            ['PHP_AUTH_USER' => $user->getUsername(), 'PHP_AUTH_PW' => $user->getUsername()]
        );

        $this->assertEquals(200, $this->client->getResponse()->getStatusCode());
        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals($data['username'], 'user');
    }

    public function testAnonymousAuthentication()
    {
    }

    /**
     * Allowed grant types: authorization_code, password, refresh_token, token, client_credentials.
     */
    private function newClient($name, $grantTypes)
    {
        $om = $this->container->get('claroline.persistence.object_manager');
        $client = $this->container->get('claroline.manager.oauth_manager')->createClient();
        $client->setName($name);
        $client->setAllowedGrantTypes($grantTypes);
        $om->persist($client);
        $om->flush();

        return $client;
    }
}
