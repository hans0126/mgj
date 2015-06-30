define(['app/keyboard', 'io'], function(kb, io) {
    socket = io();

    function init() {




        stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.right = '0px';
        stats.domElement.style.top = '0px';

        document.body.appendChild(stats.domElement);

        displayWidth = 750;
        displayHeight = 500;

        stage = new PIXI.Container();

        renderer = PIXI.autoDetectRenderer(displayWidth, displayHeight, {
            backgroundColor: 0x333333
        });

        document.getElementById("gameView").appendChild(renderer.view);


        var playerLayer = new PIXI.Container();

        stage.addChild(playerLayer);


        var playerRole = new PIXI.Graphics();
        playerRole.vx = 0;
        playerRole.vy = 0;

        playerRole.beginFill(0xFF0000);
        playerRole.drawCircle(50, 50, 25);


        playerLayer.addChild(playerRole);

        socket.on('update sprite', function(msg) {
            console.log(msg);

            playerRole.vx = msg.x;
            playerRole.vy = msg.y;
        });


       
        //Set the game state
        state = play;

        function play() {
            //Use the playerRole's velocity to make it move
            playerRole.x += playerRole.vx;
            playerRole.y += playerRole.vy
        }

        animate();
    }

    function animate() {
        stats.begin();
        renderer.render(stage);
        state();
        stats.end();
        requestAnimFrame(animate);
    }

    /* requestAnimFrame */
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();




    return {
        init: init
    }
})
