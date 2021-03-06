```
     _         _       _                                        
    | | ____ _| | __ _| |__   __ _    __ _  __ _ _ __ ___   ___ 
    | |/ / _` | |/ _` | '_ \ / _` |  / _` |/ _` | '_ ` _ \ / _ \
    |   < (_| | | (_| | | | | (_| | | (_| | (_| | | | | | |  __/
    |_|\_\__,_|_|\__,_|_| |_|\__,_|  \__, |\__,_|_| |_| |_|\___|
                                     |___/                                                                                
```                            

This is a simple [Kalaha board game](https://en.wikipedia.org/wiki/Kalah) web UI that makes use of my event-driven [Kalaha Core Library](https://github.com/amhamid/KalahaCoreLibrary). 
This project makes use of Play framework 2.4.2 using Java 8. It starts a WebSocket where client can play Kalaha with 2 players (currently from the same computer).

This web UI is a simple UI that propagates all events emitted by Kalaha core library based on user actions.
This UI contains no logic on Kalaha game rules, only event handling and animations.

To run in you need TypeSafe Activator 1.3.5+, it will be run on default port 9000:
**Note:** For this version 1.1, you need to run it on port 9000 as currently I use that port to connect to the WebSocket connection.

```
activator run
```

For demo purposes, I uploaded a YouTube video of this application (no sound) [See demo](http://www.youtube.com/watch?v=Y9IRkOyos5s)

Here is also a screenshot, where I just start the first move from player 1 on pit number 2.
In the bottom of the page, you see the events being emitted by KalahaCoreLibrary that are handled by this UI.
![alt Kalaha Board Game version 1.1](KalahaBoardGame-web-version-1.1.png)
