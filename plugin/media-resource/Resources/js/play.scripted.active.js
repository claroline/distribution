'use strict';

var problems = [];
var audioPlayer;
var step = 1;
var currentTime = 0;
var PLAY_NORMAL = 1;
var PLAY_LOOP = 2;
var PLAY_SLOW = 3;
var PLAY_TTS = 4;
var helpsObjects;
var currentStart;
var currentEnd;
// ======================================================================================================== //
// ACTIONS BOUND WHEN DOM READY (PLAY / PAUSE, MOVE BACKWARD / FORWARD, ADD MARKER, CALL HELP, ANNOTATE)
// ======================================================================================================== //
var actions = {
    playFirstStep: function() {
        audioPlayer.play();
        $('#btn-flag').prop('disabled', false);
        $('#btn-play').prop('disabled', true);
        audioPlayer.addEventListener('ended', function() {
            if (problems.length > 0) {
                showFullView();
            } else {                
                showRetryMessage();
            }
        });
        document.activeElement.blur();
    },
    flag: function() {
        document.activeElement.blur();
        addProblem();
    }
};

// ======================================================================================================== //
// ACTIONS BOUND WHEN DOM READY END
// ======================================================================================================== //

// ======================================================================================================== //
// DOCUMENT READY
// ======================================================================================================== //
$(document).ready(function() {

    // bind data-action events
    $("button[data-action]").click(function() {
        var action = $(this).data('action');
        if (actions.hasOwnProperty(action)) {
            actions[action]($(this));
        }
    });
    audioPlayer = document.getElementById('active-scripted-audio-player');
    commonVars.audioData = Routing.generate('innova_get_mediaresource_resource_file', {
        workspaceId: commonVars.wId,
        id: commonVars.mrId
    });

    audioPlayer.src = commonVars.audioData;
    var label = Translator.trans('scripted_active_identified_problems_label', {
        'number': problems.length
    }, 'media_resource');
    $('.nb-problems-label').text(label);

    // listen to time update for the region/help audio player
    commonVars.htmlAudioPlayer.addEventListener('timeupdate', function() {

        if (commonVars.htmlAudioPlayer.currentTime >= currentEnd) {
            if (commonVars.htmlAudioPlayer.loop) {
                commonVars.htmlAudioPlayer.currentTime = currentStart;
                commonVars.htmlAudioPlayer.play();
                commonVars.playing = true;
            } else {
                commonVars.playing = false;
                $('.btn-help-play').prop('disabled', false);
            }
        }
    });

});

function addProblem() {
    var time = audioPlayer.currentTime;
    problems.push(time);
    var label = Translator.trans('scripted_active_identified_problems_label', {
        'number': problems.length
    }, 'media_resource');
    $('.nb-problems-label').text(label);
}

// ======================================================================================================== //
// VIEWS SWITCH
// ======================================================================================================== //
function showRetryMessage(){
  $('.introduction-message').hide();
  $('.scripted-player-step1-buttons').hide();
  $('.scripted-player-step1-label').hide();
  $('.no-problems-detected-message').show();
}

function showFullView() {
    audioPlayer.currentTime = 0;
    var url = Routing.generate('mediaresource_get_regions_helps', {
        workspaceId: commonVars.wId,
        id: commonVars.mrId,
        data: problems
    });
    // get infos that will allow the construction of help rows according to problem detected
    $.ajax(url)
        .done(function(result) {
            // add rows to the domUtils
            appendHelpRows(result);
            helpsObjects = result;
            // hide step 1 container
            $('.step-1-container').hide();
            // show step 2 container
            $('.step-2-container').show();
        })
        .fail(function(e) {
            console.log("error");
            console.log(e);
        });
}

// ======================================================================================================== //
// VIEWS SWITCH END
// ======================================================================================================== //

// ======================================================================================================== //
// HELP
// ======================================================================================================== //

function showHelp(id) {
    var elem = document.getElementById(id);
    // if already visible do not hide
    if(!(elem.offsetWidth > 0) && !(elem.offsetHeight > 0)){
      $('#' + id).show(200);
    }
    $('.help-details-row').each(function(){
      console.log($(this).attr('id'));
      var compare = Number($(this).attr('id'));
      if(compare !== id){
        console.log('hide');
        $(this).hide();
      }
    });
}

function appendHelpRows(data) {
    var $root = $('.helps-row-container');
    $.each(data, function(index, entry) {
        buildHelpRow(entry, $root);
    });
}

function buildHelpRow(help, $elem) {

    var row = '';
    row += '<div class="row help-row">'; // main help row container
    row += '  <div class="col-md-12">';

    row += '    <div class="row">'; // region preview and show help button and prev current region choice row
    row += '      <div class="col-md-2">';
    row += '        <div class="btn-group">';
    row += '          <button class="btn btn-default btn-help-play" data-id="main-'+help.id+'" data-start="' + help.start + '"  data-end="' + help.end + '" data-mode="' + PLAY_NORMAL + '"><i class="fa fa-play"></i>&nbsp;/&nbsp;<i class="fa fa-pause"></i></button>';
    row += '          <button class="btn btn-default" onclick="showHelp(' + help.id + ')"><i class="fa fa-question"></i></button>';
    row += '        </div>';
    row += '      </div>';
    row += '      <div class="col-md-10">';
    if (Object.keys(help.previous).length > 0) {
        row += '          <button class="btn btn-default btn-load-previous" data-id="' + help.id + '">' + Translator.trans('i_missed_the_region', {}, 'media_resource') + '</button>';
    }
    row += '      </div>';
    row += '    </div>'; // end region preview and show help button and prev current region choice row

    // help details panel (toggle able)
    row += '    <div class="panel panel-primary help-details-row" id="' + help.id + '" style="display:none;">';
    row += '      <div class="panel-heading">';
    row += '        <h4>';
    row += Translator.trans('current_segment_help', {}, 'media_resource');
    row += '        </h4>';
    row += '      </div>';
    row += '      <div class="panel-body">';
    row += buildHelpDetails(help);
    row += '      </div>';
    row += '    </div>'; // end help details panel

    row += '  </div>';
    row += '</div>'; // end main help row container

    row += '<hr>';
    $elem.append(row);
}

function buildHelpDetails(help) {
    var details = '';
    if (help.hasHelp) {
        // play modes
        if (help.loop || help.backward || help.rate || help.connex.length > 0) {
            details += '      <div class="row">'; // help play modes row
            details += '        <div class="col-md-12">';
            details += '          <div class="btn-group">';
            if (help.loop) {
                details += '       <button class="btn btn-default btn-help-play" data-id="loop-'+help.id+'" title="' + Translator.trans('region_help_segment_playback_loop', {}, 'media_resource') + '" data-start="' + help.start + '"  data-end="' + help.end + '" data-mode="' + PLAY_LOOP + '">';
                details += '           <i class="fa fa-retweet"></i> ';
                details += '       </button>';
            }
            if (help.backward) {
                details += '       <button class="btn btn-default btn-help-play" data-id="backward-'+help.id+'" title="' + Translator.trans('region_help_segment_playback_backward', {}, 'media_resource') + '" data-note="' + help.note + '"  data-mode="' + PLAY_TTS + '">';
                details += '           <i class="fa fa-exchange"></i> ';
                details += '       </button>';
            }
            if (help.rate) {
                details += '       <button class="btn btn-default btn-help-play" data-id="rate-'+help.id+'" title="' + Translator.trans('region_help_segment_playback_rate', {}, 'media_resource') + '" data-start="' + help.start + '"  data-end="' + help.end + '" data-mode="' + PLAY_SLOW + '">x0.8</button>';
            }
            if (help.connex) {
                details += '       <button class="btn btn-default btn-help-play" data-id="connex-'+help.id+'" title="' + Translator.trans('region_help_related_segment_playback', {}, 'media_resource') + '" data-start="' + help.connex.start + '"  data-end="' + help.connex.end + '" data-mode="' + PLAY_NORMAL + '">';
                details += '           <i class="fa fa-play"></i> ';
                details += '           / ';
                details += '           <i class="fa fa-pause"></i>';
                details += '       </button>';
            }
            details += '          </div>';
            details += '        </div>';
            details += '      </div>'; // end help play modes row
        }
        // help texts row
        if (help.texts.length > 0) {
            details += '  <hr>';
            details += '  <div class="row">';
            details += '    <div class="col-md-4">';
            details += '      <h4>' + Translator.trans('region_config_help_texts', {}, 'media_resource') + '</h4>';
            details += '    </div>';
            details += '    <div class="col-md-8">';
            details += '        <div class="btn-group">';
            for (var i = 0; i < help.texts.length; i++) {
                var index = i + 1;
                details += '      <button class="btn btn-default btn-help-text" data-text="' + help.texts[i] + '">';
                details += Translator.trans('region_help_help_text_label', {}, 'media_resource') + '&nbsp;' + index;
                details += '      </button>';
            }
            details += '        </div>';
            details += '    </div>';
            details += '  </div>';
        }
        if (help.links.length > 0) {
            details += '    <hr>';
            details += '    <div class="row">';
            details += '      <div class="col-md-4">';
            details += '        <h4>' + Translator.trans('region_help_help_links_label', {}, 'media_resource') + '</h4>';
            details += '      </div>';
            details += '      <div class="col-md-8">';
            details += '        <div class="btn-group">';
            for (var i = 0; i < help.links.length; i++) {
                var index = i + 1;
                details += '      <a class="btn btn-default fa fa-link" title="' + Translator.trans('region_help_help_link_label', {}, 'media_resource') + ' &nbsp;' + index + '" target="_blank" href="' + help.links[i] + '"></a>';
            }
            details += '        </div>';
            details += '      </div>';
            details += '   </div>';
        }
    } else {
        details += '       <h4>' + Translator.trans('region_help_no_help_available', {}, 'media_resource') + '</h4>';
    }
    return details;
}

// ======================================================================================================== //
// HELP END
// ======================================================================================================== //


// ======================================================================================================== //
// LISTENERS
// ======================================================================================================== //


/* listen to spacebar press event (ie add problem) */
$('body').on('keypress', function(e) {
    if (e.which === 32) {
        addProblem();
    }
});

$('body').on('click', '.btn-help-text', function() {
    var text = $(this).data('text');
    $(this).text(text);
    $(this).prop('disabled', true);
});

$('body').on('click', '.btn-load-previous', function() {
    var id = $(this).data('id');
    var data = findHelpById(id);
    $(this).prop('disabled', true);
    var html = '<hr>';
    html += '<div class="panel panel-info">';
    html += ' <div class="panel-heading">';
    html += '   <h4 class="panel-title">';
    html += Translator.trans('previous_region_help', {}, 'media_resource');
    html += '   </h4>'
    html += ' </div>';
    html += ' <div class="panel-body">';
    html += buildHelpDetails(data.previous);
    html += ' </div>';
    html += '</div>';
    $(this).closest('.help-row').find('.panel-body').append(html);
});

$('body').on('click', '.btn-help-play', function() {
    var start = $(this).data('start');
    var end = $(this).data('end');
    var mode = $(this).data('mode');
    var callerId = $(this).data('id');

    // disable every "play help" buttons except the caller
    $('.btn-help-play').each(function() {
        if (callerId !== $(this).data('id')) {
            $(this).prop('disabled', true);
        }
    });
    if (mode === PLAY_TTS) {
        var note = $(this).data('note');
        playBackward(note);
    } else {
        playRegion(start, end, mode);
    }
});

// ======================================================================================================== //
// LISTENERS END
// ======================================================================================================== //


// ======================================================================================================== //
// PLAY METHODS
// ======================================================================================================== //

function playRegion(start, end, mode) {
    if (!commonVars.playing) {
        commonVars.htmlAudioPlayer.src = commonVars.audioData + '#t=' + start + ',' + end;
        switch (mode) {
            case PLAY_NORMAL:
                commonVars.htmlAudioPlayer.playbackRate = 1;
                commonVars.htmlAudioPlayer.loop = false;
                break;
            case PLAY_LOOP:
                commonVars.htmlAudioPlayer.playbackRate = 1;
                commonVars.htmlAudioPlayer.loop = true;
                break;
            case PLAY_SLOW:
                commonVars.htmlAudioPlayer.playbackRate = 0.8;
                commonVars.htmlAudioPlayer.loop = false;
                break;
        }
        commonVars.htmlAudioPlayer.play();
        commonVars.playing = true;
    } else {
        commonVars.htmlAudioPlayer.pause();
        commonVars.playing = false;
        $('.btn-help-play').prop('disabled', false);
    }
    currentStart = start;
    currentEnd = end;
}

/**
 * Will only work with chrome browser !!
 */
function playBackward(note) {
    // is commonVars.playing for real audio (ie not for TTS)
    if (commonVars.playing && commonVars.htmlAudioPlayer) {
        // stop audio playback before commonVars.playing TTS
        commonVars.htmlAudioPlayer.pause();
        commonVars.playing = false;
    }
    if (window.SpeechSynthesisUtterance === undefined) {
        console.log('not supported!');
    } else {
        var text = commonVars.strUtils.removeHtml(note);
        var array = text.split(' ');
        var start = array.length - 1;
        // check if utterance is already speaking before commonVars.playing (pultiple click on backward button)
        if (!window.speechSynthesis.speaking) {
            handleUtterancePlayback(start, array);
        }
    }
}

function handleUtterancePlayback(index, textArray) {
    var toSay = '';
    var length = textArray.length;
    for (var j = index; j < length; j++) {
        toSay += textArray[j] + ' ';
    }
    if (index >= 0) {
        sayIt(toSay, function() {
            index = index - 1;
            handleUtterancePlayback(index, textArray);
        });
    } else {
      commonVars.playing = false;
      $('.btn-help-play').prop('disabled', false);
    }
}

function sayIt(text, callback) {
    var utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    var lang = $('input[name=tts]').val();
    var voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        // chrome hack...
        window.setTimeout(function() {
            voices = window.speechSynthesis.getVoices();
            continueToSay(utterance, voices, lang, callback);
        }.bind(this), 200);
    } else {
        continueToSay(utterance, voices, lang, callback);
    }
}

function continueToSay(utterance, voices, lang, callback) {
    for (var i = 0; i < voices.length; i++) {
        // voices names are not the same chrome is always code1-code2 while fx is sometimes code1-code2 and sometimes code1
        var lang2 = lang.split('-')[0];
        if (voices[i].lang == lang || voices[i].lang == lang2) {
            utterance.voice = voices[i];
            break;
        }
    }
    window.speechSynthesis.speak(utterance);
    utterance.onend = function(event) {
        return callback();
    };
}

// ======================================================================================================== //
// PLAY METHODS END
// ======================================================================================================== //


// ======================================================================================================== //
// VARIOUS
// ======================================================================================================== //

function findHelpById(searched) {
    var result;
    $.each(helpsObjects, function(index, data) {
        if (data.id === searched) {
            result = data;
        }
    });
    return result;
}
