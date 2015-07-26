var wsUri = "ws://localhost:9000/websocket";
var output;

var createInitialMoveEvent = function(originPitIdentifier) {
  return {
    eventType: "INITIAL_MOVE",
    originPitIdentifier: originPitIdentifier
  };
}

function init() {
  output = document.getElementById("output");
  testWebSocket();
  registerMoveButtonClickHandler();
  registerEventHandlers();
}

function testWebSocket() {
  websocket = new WebSocket(wsUri);

  websocket.onopen = function(evt) {
      onOpen(evt);
  };

  websocket.onclose = function(evt) {
      onClose(evt);
  };

  websocket.onmessage = function(evt) {
      onMessage(evt);
  };

  websocket.onerror = function(evt) {
      onError(evt);
  };
}

function onOpen(evt) {
  writeToScreen("CONNECTED");
  // doSend(createInitialMoveEvent('Pit 1'));
}

function onClose(evt) {
  writeToScreen("DISCONNECTED");
}

function onMessage(evt) {
  writeToScreen('<span style="color: grey;">Events: ' + evt.data+'</span>');
  propagateEvents(JSON.parse(evt.data));
}

function onError(evt) {
  writeToScreen('<span style="color: red;">Error:</span> ' + evt.data);
}

function doSend(message) {
  writeToScreen("Action: " + message.eventType + " - " +message.originPitIdentifier);
  websocket.send(JSON.stringify(message));
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
    $('[data-id="pit-'+i+'-move"]').on('click', function(e) {
      doSend(createInitialMoveEvent('Pit '+i));
    });
  })
}

function registerEventHandlers() {
  _.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(i) {
    $('[data-id="pit-'+i+'-value"]').on('notification', function(event, data) {
        console.log(data);
        var eventType = data.eventType;
        if("EMPTY" === eventType || "NOT_EMPTY" === eventType) {
          $(this).text(data.numberOfSeeds);
        }
    });
  });

  _.each([1, 2], function(i) {
    $('[data-id="kalaha-pit-'+i+'-value"]').on('notification', function(event, data) {
        console.log(data);
        // var eventType = data.eventType;
        var originalValue = $(this).text();
        $(this).text(parseInt(originalValue) + 1);
    });
  });


}

function propagateEvents(events) {
  _.each(events, function(event) {
    var originPitIdentifier = event.originPitIdentifier;
    var eventType = event.eventType;

    _.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(i) {
      if(originPitIdentifier === "Pit "+i) {
        $('[data-id="pit-'+i+'-value"]').trigger('notification', event);
        $('[data-id="pit-'+i+'-move"]').trigger('notification', event);
        $('[data-id="pit-'+i+'"]').trigger('notification', event);
      }
    });

    _.each([1, 2], function(i) {
      if(originPitIdentifier === "KalahaPit "+i) {
        $('[data-id="kalaha-pit-'+i+'-value"]').trigger('notification', event);
        $('[data-id="kalaha-pit-'+i+'-move"]').trigger('notification', event);
        $('[data-id="kalaha-pit-'+i+'"]').trigger('notification', event);
      }
    });

  });

}

window.addEventListener("load", init, false);
