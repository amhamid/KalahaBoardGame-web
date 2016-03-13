// with assumption that Play runs on port 9000
//var wsUri = "ws://localhost:9000/websocket";
var wsUri = "ws://37.139.20.196:9000/websocket"; // deployed to digital ocean
var output;

// initialize websocket connection
// register event handlers
function init() {
  output = document.getElementById("output");
  connectWebSocket();
  registerMoveButtonClickHandler();
  registerEventHandlers();

  // player 1 has the first move, therefore disabling move buttons for player 2
  _.each([7,8,9,10,11,12], function(i) {
    $('[data-id="pit-'+i+'-move"]').prop('disabled', true);
  });

}

// websocket connection and handlers
function connectWebSocket() {
  websocket = new WebSocket(wsUri);

  websocket.onopen = function(evt) {
    writeToScreen("READY...");
  };

  websocket.onclose = function(evt) {
    writeToScreen("DISCONNECTED");
  };

  websocket.onmessage = function(evt) {
    var jsonData = JSON.parse(evt.data);

    writeToScreen('<div>Events: </div>');
    _.each(jsonData, function(e) {
      writeToScreen('<div style="color: grey;">' + JSON.stringify(e) + '</span>');
    });

    propagateEvents(jsonData);
  };

  websocket.onerror = function(evt) {
    writeToScreen('<span style="color: red;">Error:</span> ' + evt.data);
  };
}

// send json message to websocket connection
function doSend(jsonObject) {
  writeToScreen("Action: " + jsonObject.eventType + " - " +jsonObject.originPitIdentifier);
  websocket.send(JSON.stringify(jsonObject));
}

function writeToScreen(message) {
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  output.appendChild(pre);
}

function registerMoveButtonClickHandler() {
  // 12 pits
  _.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(i) {

  })
}

function registerEventHandlers() {
  // for normal pits (1..12)
  _.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(i) {
    // reacting on 'click' event
    $('[data-id="pit-'+i+'-move"]').on('click', function(e) {
      doSend(createInitialMoveEvent('Pit '+i));
    });

    // reacting on 'notification' event
    $('[data-id="pit-'+i+'-value"]').on('notification', function(event, data) {
        var eventType = data.eventType;
        if("EMPTY" === eventType || "NOT_EMPTY" === eventType) {
          $(this).text(data.numberOfSeeds);
          moveAnimation($('[data-id="pit-'+i+'"]'), i);
        }

        if("CAPTURE_SEEDS" === eventType) {
            moveAnimation($('[data-id="pit-'+i+'"]'), i);
        }
    });
  });

  // for kalaha pit 1 and 2
  _.each([1, 2], function(i) {
    $('[data-id="kalaha-pit-'+i+'-value"]').on('notification', function(event, data) {
        var eventType = data.eventType;
        var playerType = data.playerType;
        var originPitIdentifier = data.originPitIdentifier;

        if(("PLAYER_1" === playerType && "KalahaPit 1" === originPitIdentifier)
          || ("PLAYER_2" === playerType && "KalahaPit 2" === originPitIdentifier)) {

            if("STORED" === eventType) {
              var $el = $(this);
                $el.text(data.numberOfSeeds);
                moveAnimation($('[data-id="kalaha-pit-'+i+'"]'));
            } else {
              var originalValue = $(this).text();
              $(this).text(parseInt(originalValue) + 1);
              moveAnimation($('[data-id="kalaha-pit-'+i+'"]'));
            }
        }
    });
  });

  // for CHANGE_TURN event player 1
  $('[data-id="player-1"]').on('notification', function(event, data) {
    var eventType = data.eventType;
    var playerType = data.playerType;
    if("PLAYER_1" === playerType && "CHANGE_TURN" === eventType) {
      // make change turn visible
      $('[data-id="player-1"]').removeClass("btn-default");
      $('[data-id="player-1"]').addClass("btn-warning");
      $('[data-id="player-2"]').removeClass("btn-warning");
      $('[data-id="player-2"]').addClass("btn-default");

      // enabling player 1 move buttons
      _.each([1,2,3,4,5,6], function(i) {
        $('[data-id="pit-'+i+'-move"]').prop('disabled', false);
        $('[data-id="pit-'+i+'-move"]').removeClass("btn-default");
        $('[data-id="pit-'+i+'-move"]').addClass("btn-success");
      });

      // disabling player 2 move buttons
      _.each([7,8,9,10,11,12], function(i) {
        $('[data-id="pit-'+i+'-move"]').prop('disabled', true);
        $('[data-id="pit-'+i+'-move"]').removeClass("btn-success");
        $('[data-id="pit-'+i+'-move"]').addClass("btn-default");
      });

    }
  });

  // for CHANGE_TURN event player 2
  $('[data-id="player-2"]').on('notification', function(event, data) {
    var eventType = data.eventType;
    var playerType = data.playerType;
    if("PLAYER_2" === playerType && "CHANGE_TURN" === eventType) {
      // make change turn visible
      $('[data-id="player-2"]').removeClass("btn-default");
      $('[data-id="player-2"]').addClass("btn-warning");
      $('[data-id="player-1"]').removeClass("btn-warning");
      $('[data-id="player-1"]').addClass("btn-default");

      // disabling player 1 move buttons
      _.each([1,2,3,4,5,6], function(i) {
        $('[data-id="pit-'+i+'-move"]').prop('disabled', true);
        $('[data-id="pit-'+i+'-move"]').removeClass("btn-success");
        $('[data-id="pit-'+i+'-move"]').addClass("btn-default");
      });

      // enabling player 2 move buttons
      _.each([7,8,9,10,11,12], function(i) {
        $('[data-id="pit-'+i+'-move"]').prop('disabled', false);
        $('[data-id="pit-'+i+'-move"]').removeClass("btn-default");
        $('[data-id="pit-'+i+'-move"]').addClass("btn-success");
      });
    }
  });

  // reacting on WINS event
  $('[data-id="referee"]').on('WINS', function(event, data) {
    // disable all move buttons
    _.each([1,2,3,4,5,6,7,8,9,10,11,12], function(i) {
      $('[data-id="pit-'+i+'-move"]').prop('disabled', true);
    });

    var playerType = data.playerType;
    alert("Congratulation "+playerType+" Wins !!");

    // reload page to start a new game
    location.reload();
  });

  // reacting on TIE_GAME event
  $('[data-id="referee"]').on('TIE_GAME', function(event, data) {
      // disable all move buttons
      _.each([1,2,3,4,5,6,7,8,9,10,11,12], function(i) {
        $('[data-id="pit-'+i+'-move"]').prop('disabled', true);
      });

      var playerType = data.playerType;
      alert("TIE GAME !!");

      // reload page to start a new game
      location.reload();
    });
}

// make move animation so that user can track changes on the board
function moveAnimation($el) {
  var rgbColor = $el.css('backgroundColor');
  var originalHexColor = rgb2hex(rgbColor);

  // animate moving
  $el.animate({
    backgroundColor: "red",
    opacity: 0.8,
    color: "#fff",
  }, 500 );

  // animate to original state
  $el.animate({
    backgroundColor: originalHexColor,
    opacity: 1,
    color: "black",
  }, 500);
}

// propagate events received from websocket to DOMs
// basically here we propagate all events to our listeners
// the listener will decide whether they want to handle it or not
// NOTE: add setTimeout() on events propagation so that events are sent in the order the events were received !
function propagateEvents(events) {

  // disable all move buttons
    _.each([1,2,3,4,5,6,7,8,9,10,11,12], function(i) {
    $('[data-id="pit-'+i+'-move"]').prop('disabled', true);
  });

  _.each(events, function(event, index) {
    var originPitIdentifier = event.originPitIdentifier;
    var eventType = event.eventType;

    // events for normal pits
    _.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(i) {
      if(originPitIdentifier === "Pit "+i) {
        setTimeout(function() {
          $('[data-id="pit-'+i+'-value"]').trigger('notification', event);
          $('[data-id="pit-'+i+'-move"]').trigger('notification', event);
          $('[data-id="pit-'+i+'"]').trigger('notification', event);
        }, index * 200);
      }
    });

    // events for kalaha pit 1 and 2
    _.each([1, 2], function(i) {
        setTimeout(function() {
          if(originPitIdentifier === "KalahaPit "+i) {
            $('[data-id="kalaha-pit-'+i+'-value"]').trigger('notification', event);
            $('[data-id="kalaha-pit-'+i+'-move"]').trigger('notification', event);
            $('[data-id="kalaha-pit-'+i+'"]').trigger('notification', event);
          }
        }, index * 200);
    });

    setTimeout(function() {
        // events for player 1 and 2
        $('[data-id="player-1"]').trigger('notification', event);
        $('[data-id="player-2"]').trigger('notification', event);
    }, index * 250); // give a bit more delay before send notification to player

    setTimeout(function() {
        // WINS event
        if("WINS" == eventType || "TIE_GAME" == eventType) {
          $('[data-id="referee"]').trigger(eventType, event);
        }
    }, index * 300); // give a bit more delay before notify the end result of the game

  });
}

// create INITIAL_MOVE event
var createInitialMoveEvent = function(originPitIdentifier) {
  return {
    eventType: "INITIAL_MOVE",
    originPitIdentifier: originPitIdentifier
  };
}

// convert rgb color value to hex code
var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

//Function to convert hex format to a rgb color
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

// call init function on window load event
window.addEventListener("load", init, false);
