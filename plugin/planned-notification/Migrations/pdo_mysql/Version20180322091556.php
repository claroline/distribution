<?php

namespace Claroline\PlannedNotificationBundle\Migrations\pdo_mysql;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated migration based on mapping information: modify it with caution.
 *
 * Generation date: 2018/03/22 09:15:58
 */
class Version20180322091556 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('
            CREATE TABLE claro_plannednotificationbundle_planned_notification (
                id INT AUTO_INCREMENT NOT NULL, 
                workspace_id INT NOT NULL, 
                message_id INT NOT NULL, 
                triggering_action VARCHAR(255) NOT NULL, 
                planned_interval INT NOT NULL, 
                by_mail TINYINT(1) NOT NULL, 
                by_message TINYINT(1) NOT NULL, 
                uuid VARCHAR(36) NOT NULL, 
                UNIQUE INDEX UNIQ_DB5DE453D17F50A6 (uuid), 
                INDEX IDX_DB5DE45382D40A1F (workspace_id), 
                INDEX IDX_DB5DE453537A1329 (message_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB
        ');
        $this->addSql('
            CREATE TABLE claro_plannednotificationbundle_message (
                id INT AUTO_INCREMENT NOT NULL, 
                workspace_id INT NOT NULL, 
                content LONGTEXT NOT NULL, 
                uuid VARCHAR(36) NOT NULL, 
                UNIQUE INDEX UNIQ_6897C1B7D17F50A6 (uuid), 
                INDEX IDX_6897C1B782D40A1F (workspace_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB
        ');
        $this->addSql('
            ALTER TABLE claro_plannednotificationbundle_planned_notification 
            ADD CONSTRAINT FK_DB5DE45382D40A1F FOREIGN KEY (workspace_id) 
            REFERENCES claro_workspace (id) 
            ON DELETE CASCADE
        ');
        $this->addSql('
            ALTER TABLE claro_plannednotificationbundle_planned_notification 
            ADD CONSTRAINT FK_DB5DE453537A1329 FOREIGN KEY (message_id) 
            REFERENCES claro_plannednotificationbundle_message (id) 
            ON DELETE CASCADE
        ');
        $this->addSql('
            ALTER TABLE claro_plannednotificationbundle_message 
            ADD CONSTRAINT FK_6897C1B782D40A1F FOREIGN KEY (workspace_id) 
            REFERENCES claro_workspace (id) 
            ON DELETE CASCADE
        ');
    }

    public function down(Schema $schema)
    {
        $this->addSql('
            ALTER TABLE claro_plannednotificationbundle_planned_notification 
            DROP FOREIGN KEY FK_DB5DE453537A1329
        ');
        $this->addSql('
            DROP TABLE claro_plannednotificationbundle_planned_notification
        ');
        $this->addSql('
            DROP TABLE claro_plannednotificationbundle_message
        ');
    }
}
