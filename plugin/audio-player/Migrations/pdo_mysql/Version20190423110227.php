<?php

namespace Claroline\AudioPlayerBundle\Migrations\pdo_mysql;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated migration based on mapping information: modify it with caution.
 *
 * Generation date: 2019/04/23 11:02:28
 */
class Version20190423110227 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql('
            CREATE TABLE claro_audio_section (
                id INT AUTO_INCREMENT NOT NULL, 
                waveform_id INT DEFAULT NULL, 
                section_start INT NOT NULL, 
                section_end INT NOT NULL, 
                start_tolerance INT NOT NULL, 
                end_tolerance INT NOT NULL, 
                uuid VARCHAR(36) NOT NULL, 
                score DOUBLE PRECISION NOT NULL, 
                feedback LONGTEXT DEFAULT NULL, 
                UNIQUE INDEX UNIQ_3FFCA233D17F50A6 (uuid), 
                INDEX IDX_3FFCA2335B93C951 (waveform_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB
        ');
        $this->addSql('
            CREATE TABLE claro_audio_player_interaction_waveform (
                id INT AUTO_INCREMENT NOT NULL, 
                question_id INT DEFAULT NULL, 
                url VARCHAR(255) NOT NULL, 
                UNIQUE INDEX UNIQ_813824D71E27F6BF (question_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB
        ');
        $this->addSql('
            ALTER TABLE claro_audio_section 
            ADD CONSTRAINT FK_3FFCA2335B93C951 FOREIGN KEY (waveform_id) 
            REFERENCES claro_audio_player_interaction_waveform (id) 
            ON DELETE CASCADE
        ');
        $this->addSql('
            ALTER TABLE claro_audio_player_interaction_waveform 
            ADD CONSTRAINT FK_813824D71E27F6BF FOREIGN KEY (question_id) 
            REFERENCES ujm_question (id) 
            ON DELETE CASCADE
        ');
    }

    public function down(Schema $schema)
    {
        $this->addSql('
            ALTER TABLE claro_audio_section 
            DROP FOREIGN KEY FK_3FFCA2335B93C951
        ');
        $this->addSql('
            DROP TABLE claro_audio_section
        ');
        $this->addSql('
            DROP TABLE claro_audio_player_interaction_waveform
        ');
    }
}
