<?php

namespace Icap\SocialmediaBundle\Migrations\pdo_pgsql;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated migration based on mapping information: modify it with caution.
 *
 * Generation date: 2015/04/27 05:00:13
 */
class Version20150427170011 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('
            CREATE TABLE icap__socialmedia_share (
                id SERIAL NOT NULL, 
                resource_id INT DEFAULT NULL, 
                user_id INT DEFAULT NULL, 
                network VARCHAR(255) DEFAULT NULL, 
                url VARCHAR(255) DEFAULT NULL, 
                title VARCHAR(255) DEFAULT NULL, 
                creation_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, 
                PRIMARY KEY(id)
            )
        ');
        $this->addSql('
            CREATE INDEX IDX_4DB117C589329D25 ON icap__socialmedia_share (resource_id)
        ');
        $this->addSql('
            CREATE INDEX IDX_4DB117C5A76ED395 ON icap__socialmedia_share (user_id)
        ');
        $this->addSql('
            CREATE TABLE icap__socialmedia_like (
                id SERIAL NOT NULL, 
                resource_id INT DEFAULT NULL, 
                user_id INT DEFAULT NULL, 
                url VARCHAR(255) DEFAULT NULL, 
                title VARCHAR(255) DEFAULT NULL, 
                creation_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, 
                PRIMARY KEY(id)
            )
        ');
        $this->addSql('
            CREATE INDEX IDX_7C98AD9089329D25 ON icap__socialmedia_like (resource_id)
        ');
        $this->addSql('
            CREATE INDEX IDX_7C98AD90A76ED395 ON icap__socialmedia_like (user_id)
        ');
        $this->addSql('
            CREATE TABLE icap__socialmedia_comment (
                id SERIAL NOT NULL, 
                resource_id INT DEFAULT NULL, 
                user_id INT DEFAULT NULL, 
                text TEXT DEFAULT NULL, 
                url VARCHAR(255) DEFAULT NULL, 
                title VARCHAR(255) DEFAULT NULL, 
                creation_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, 
                PRIMARY KEY(id)
            )
        ');
        $this->addSql('
            CREATE INDEX IDX_6FC00C3089329D25 ON icap__socialmedia_comment (resource_id)
        ');
        $this->addSql('
            CREATE INDEX IDX_6FC00C30A76ED395 ON icap__socialmedia_comment (user_id)
        ');
        $this->addSql('
            CREATE TABLE icap__socialmedia_wall_item (
                id SERIAL NOT NULL, 
                like_id INT DEFAULT NULL, 
                share_id INT DEFAULT NULL, 
                comment_id INT DEFAULT NULL, 
                user_id INT DEFAULT NULL, 
                creation_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, 
                PRIMARY KEY(id)
            )
        ');
        $this->addSql('
            CREATE INDEX IDX_436BC420859BFA32 ON icap__socialmedia_wall_item (like_id)
        ');
        $this->addSql('
            CREATE INDEX IDX_436BC4202AE63FDB ON icap__socialmedia_wall_item (share_id)
        ');
        $this->addSql('
            CREATE INDEX IDX_436BC420F8697D13 ON icap__socialmedia_wall_item (comment_id)
        ');
        $this->addSql('
            CREATE INDEX IDX_436BC420A76ED395 ON icap__socialmedia_wall_item (user_id)
        ');
        $this->addSql('
            CREATE TABLE icap__socialmedia_note (
                id SERIAL NOT NULL, 
                resource_id INT DEFAULT NULL, 
                user_id INT DEFAULT NULL, 
                text TEXT DEFAULT NULL, 
                url VARCHAR(255) DEFAULT NULL, 
                title VARCHAR(255) DEFAULT NULL, 
                creation_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, 
                PRIMARY KEY(id)
            )
        ');
        $this->addSql('
            CREATE INDEX IDX_1F46173789329D25 ON icap__socialmedia_note (resource_id)
        ');
        $this->addSql('
            CREATE INDEX IDX_1F461737A76ED395 ON icap__socialmedia_note (user_id)
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_share 
            ADD CONSTRAINT FK_4DB117C589329D25 FOREIGN KEY (resource_id) 
            REFERENCES claro_resource_node (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_share 
            ADD CONSTRAINT FK_4DB117C5A76ED395 FOREIGN KEY (user_id) 
            REFERENCES claro_user (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_like 
            ADD CONSTRAINT FK_7C98AD9089329D25 FOREIGN KEY (resource_id) 
            REFERENCES claro_resource_node (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_like 
            ADD CONSTRAINT FK_7C98AD90A76ED395 FOREIGN KEY (user_id) 
            REFERENCES claro_user (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_comment 
            ADD CONSTRAINT FK_6FC00C3089329D25 FOREIGN KEY (resource_id) 
            REFERENCES claro_resource_node (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_comment 
            ADD CONSTRAINT FK_6FC00C30A76ED395 FOREIGN KEY (user_id) 
            REFERENCES claro_user (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_wall_item 
            ADD CONSTRAINT FK_436BC420859BFA32 FOREIGN KEY (like_id) 
            REFERENCES icap__socialmedia_like (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_wall_item 
            ADD CONSTRAINT FK_436BC4202AE63FDB FOREIGN KEY (share_id) 
            REFERENCES icap__socialmedia_share (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_wall_item 
            ADD CONSTRAINT FK_436BC420F8697D13 FOREIGN KEY (comment_id) 
            REFERENCES icap__socialmedia_comment (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_wall_item 
            ADD CONSTRAINT FK_436BC420A76ED395 FOREIGN KEY (user_id) 
            REFERENCES claro_user (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_note 
            ADD CONSTRAINT FK_1F46173789329D25 FOREIGN KEY (resource_id) 
            REFERENCES claro_resource_node (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_note 
            ADD CONSTRAINT FK_1F461737A76ED395 FOREIGN KEY (user_id) 
            REFERENCES claro_user (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
    }

    public function down(Schema $schema)
    {
        $this->addSql('
            ALTER TABLE icap__socialmedia_wall_item 
            DROP CONSTRAINT FK_436BC4202AE63FDB
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_wall_item 
            DROP CONSTRAINT FK_436BC420859BFA32
        ');
        $this->addSql('
            ALTER TABLE icap__socialmedia_wall_item 
            DROP CONSTRAINT FK_436BC420F8697D13
        ');
        $this->addSql('
            DROP TABLE icap__socialmedia_share
        ');
        $this->addSql('
            DROP TABLE icap__socialmedia_like
        ');
        $this->addSql('
            DROP TABLE icap__socialmedia_comment
        ');
        $this->addSql('
            DROP TABLE icap__socialmedia_wall_item
        ');
        $this->addSql('
            DROP TABLE icap__socialmedia_note
        ');
    }
}
