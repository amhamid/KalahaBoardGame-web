package controllers;

import com.ammar.kalahacorelibrary.board.KalahaBoard;
import com.ammar.kalahacorelibrary.event.Event;
import com.ammar.kalahacorelibrary.event.EventType;
import com.ammar.kalahacorelibrary.pubsub.Observable;
import com.ammar.kalahacorelibrary.pubsub.Observer;
import com.ammar.kalahacorelibrary.pubsub.pit.Pit;
import com.fasterxml.jackson.databind.JsonNode;
import play.libs.F;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.WebSocket;
import views.html.index;

import java.util.*;

public class Application extends Controller {

    public Result index() {
        return ok(index.render());
    }

    public WebSocket<JsonNode> socket() {
        final KalahaBoard kalahaBoard = new KalahaBoard(6);

        return WebSocket.whenReady((in, out) -> {

            // set up observers
            final GameEventObserver gameEventObserver = new GameEventObserver();
            final Set<EventType> eventTypes = new LinkedHashSet<>(Arrays.asList(EventType.values()));
            kalahaBoard.getReplayableEventPublisher().addObserver(eventTypes, gameEventObserver);

            // For each event received on the socket,
            in.onMessage(handleInput(out, kalahaBoard, gameEventObserver));

            // When the socket is closed.
            in.onClose(() -> System.out.println("Disconnected"));

            // Send a single 'Hello!' message
//            out.write(Json.toJson("Welcome To Kalaha Board Game"));
        });
    }

    private F.Callback<JsonNode> handleInput(WebSocket.Out<JsonNode> out, KalahaBoard kalahaBoard, GameEventObserver gameEventObserver) {
        return input -> {
            final String action = input.findPath("eventType").textValue();
            final String originPitIdentifier = input.findPath("originPitIdentifier").textValue();
            final EventType eventType = EventType.valueOf(action);

            switch (eventType) {
                case INITIAL_MOVE:
                    final Pit pit = kalahaBoard.getAllPits().get(originPitIdentifier);
                    if (Objects.nonNull(pit)) {
                        pit.initialMove();
                    }
                    break;
                default:
                    break;
            }

            // flush events to client
            out.write(Json.toJson(gameEventObserver.getEvents()));
            gameEventObserver.flushEvents();
        };
    }

    private class GameEventObserver implements Observer {

        private final List<Event> events;

        private GameEventObserver() {
            this.events = new ArrayList<>();
        }

        @Override
        public void update(Observable observable, Event event) {
            events.add(event);
        }

        public void flushEvents() {
            events.clear();
        }

        public List<Event> getEvents() {
            return Collections.unmodifiableList(events);
        }
    }

}
