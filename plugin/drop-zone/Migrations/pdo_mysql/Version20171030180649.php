<?php

namespace Claroline\DropZoneBundle\Migrations\pdo_mysql;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated migration based on mapping information: modify it with caution.
 *
 * Generation date: 2017/10/30 06:06:51
 */
class Version20171030180649 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('
            CREATE TABLE claro_dropzonebundle_criterion (
                id INT AUTO_INCREMENT NOT NULL, 
                dropzone_id INT NOT NULL, 
                instruction LONGTEXT NOT NULL, 
                uuid VARCHAR(36) NOT NULL, 
                UNIQUE INDEX UNIQ_1DD9F2E2D17F50A6 (uuid), 
                INDEX IDX_1DD9F2E254FC3EC3 (dropzone_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB
        ');
        $this->addSql('
            CREATE TABLE claro_dropzonebundle_dropzone (
                id INT AUTO_INCREMENT NOT NULL, 
                edition_state SMALLINT NOT NULL, 
                instruction LONGTEXT DEFAULT NULL, 
                correction_instruction LONGTEXT DEFAULT NULL, 
                success_message LONGTEXT DEFAULT NULL, 
                fail_message LONGTEXT DEFAULT NULL, 
                workspace_resource_enabled TINYINT(1) NOT NULL, 
                upload_enabled TINYINT(1) NOT NULL, 
                url_enabled TINYINT(1) NOT NULL, 
                rich_text_enabled TINYINT(1) NOT NULL, 
                peer_review TINYINT(1) NOT NULL, 
                expected_correction_total SMALLINT NOT NULL, 
                display_notation_to_learners TINYINT(1) NOT NULL, 
                display_notation_message_to_learners TINYINT(1) NOT NULL, 
                score_to_pass DOUBLE PRECISION NOT NULL, 
                manual_planning TINYINT(1) NOT NULL, 
                manual_state VARCHAR(255) NOT NULL, 
                drop_start_date DATETIME DEFAULT NULL, 
                drop_end_date DATETIME DEFAULT NULL, 
                review_start_date DATETIME DEFAULT NULL, 
                review_end_date DATETIME DEFAULT NULL, 
                comment_in_correction_enabled TINYINT(1) NOT NULL, 
                comment_in_correction_forced TINYINT(1) NOT NULL, 
                display_corrections_to_learners TINYINT(1) NOT NULL, 
                correction_denial_enabled TINYINT(1) NOT NULL, 
                criteria_enabled TINYINT(1) NOT NULL, 
                criteria_total SMALLINT NOT NULL, 
                auto_close_drops_at_drop_end_date TINYINT(1) NOT NULL, 
                auto_close_state VARCHAR(255) NOT NULL, 
                notify_on_drop TINYINT(1) NOT NULL, 
                uuid VARCHAR(36) NOT NULL, 
                resourceNode_id INT DEFAULT NULL, 
                UNIQUE INDEX UNIQ_FB84B2AFD17F50A6 (uuid), 
                UNIQUE INDEX UNIQ_FB84B2AFB87FAB32 (resourceNode_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB
        ');
        $this->addSql('
            CREATE TABLE claro_dropzonebundle_drop (
                id INT AUTO_INCREMENT NOT NULL, 
                dropzone_id INT NOT NULL, 
                user_id INT NOT NULL, 
                drop_date DATETIME NOT NULL, 
                reported TINYINT(1) NOT NULL, 
                finished TINYINT(1) NOT NULL, 
                number INT NOT NULL, 
                auto_closed_drop TINYINT(1) NOT NULL, 
                unlocked_drop TINYINT(1) NOT NULL, 
                unlocked_user TINYINT(1) NOT NULL, 
                uuid VARCHAR(36) NOT NULL, 
                UNIQUE INDEX UNIQ_97D5DB31D17F50A6 (uuid), 
                INDEX IDX_97D5DB3154FC3EC3 (dropzone_id), 
                INDEX IDX_97D5DB31A76ED395 (user_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB
        ');
        $this->addSql('
            CREATE TABLE claro_dropzonebundle_document (
                id INT AUTO_INCREMENT NOT NULL, 
                drop_id INT NOT NULL, 
                resource_id INT DEFAULT NULL, 
                document_type VARCHAR(255) NOT NULL, 
                url VARCHAR(255) DEFAULT NULL, 
                content LONGTEXT DEFAULT NULL, 
                uuid VARCHAR(36) NOT NULL, 
                UNIQUE INDEX UNIQ_E846CAA8D17F50A6 (uuid), 
                INDEX IDX_E846CAA84D224760 (drop_id), 
                INDEX IDX_E846CAA889329D25 (resource_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB
        ');
        $this->addSql('
            ALTER TABLE claro_dropzonebundle_criterion 
            ADD CONSTRAINT FK_1DD9F2E254FC3EC3 FOREIGN KEY (dropzone_id) 
            REFERENCES claro_dropzonebundle_dropzone (id) 
            ON DELETE CASCADE
        ');
        $this->addSql('
            ALTER TABLE claro_dropzonebundle_dropzone 
            ADD CONSTRAINT FK_FB84B2AFB87FAB32 FOREIGN KEY (resourceNode_id) 
            REFERENCES claro_resource_node (id) 
            ON DELETE CASCADE
        ');
        $this->addSql('
            ALTER TABLE claro_dropzonebundle_drop 
            ADD CONSTRAINT FK_97D5DB3154FC3EC3 FOREIGN KEY (dropzone_id) 
            REFERENCES claro_dropzonebundle_dropzone (id) 
            ON DELETE CASCADE
        ');
        $this->addSql('
            ALTER TABLE claro_dropzonebundle_drop 
            ADD CONSTRAINT FK_97D5DB31A76ED395 FOREIGN KEY (user_id) 
            REFERENCES claro_user (id) 
            ON DELETE CASCADE
        ');
        $this->addSql('
            ALTER TABLE claro_dropzonebundle_document 
            ADD CONSTRAINT FK_E846CAA84D224760 FOREIGN KEY (drop_id) 
            REFERENCES claro_dropzonebundle_drop (id) 
            ON DELETE CASCADE
        ');
        $this->addSql('
            ALTER TABLE claro_dropzonebundle_document 
            ADD CONSTRAINT FK_E846CAA889329D25 FOREIGN KEY (resource_id) 
            REFERENCES claro_resource_node (id) 
            ON DELETE SET NULL
        ');
    }

    public function down(Schema $schema)
    {
        $this->addSql('
            ALTER TABLE claro_dropzonebundle_criterion 
            DROP FOREIGN KEY FK_1DD9F2E254FC3EC3
        ');
        $this->addSql('
            ALTER TABLE claro_dropzonebundle_drop 
            DROP FOREIGN KEY FK_97D5DB3154FC3EC3
        ');
        $this->addSql('
            ALTER TABLE claro_dropzonebundle_document 
            DROP FOREIGN KEY FK_E846CAA84D224760
        ');
        $this->addSql('
            DROP TABLE claro_dropzonebundle_criterion
        ');
        $this->addSql('
            DROP TABLE claro_dropzonebundle_dropzone
        ');
        $this->addSql('
            DROP TABLE claro_dropzonebundle_drop
        ');
        $this->addSql('
            DROP TABLE claro_dropzonebundle_document
        ');
    }
}
