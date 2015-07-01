define(['app/keyboard', 'io'], function(kb, io) {
    socket = io();

    playerList = [];

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



        socket.on('addNewPlayer', function(msg) {

            console.log(msg);

            var r = parseInt(Math.random() * 254);
            var g = parseInt(Math.random() * 254);
            var b = parseInt(Math.random() * 254);
            //转换为十六进制,使用 int.toString(16)即可.
            //相应的，还可以使用toString(10) , toString(8), toString(2)来转化为十进制，八进制，二进制等。
            r = r.toString(16);
            g = g.toString(16);
            b = b.toString(16);
            //拼接成颜色的RGB值
            var color = '0x' + r + g + b;


            var playerRole = new PIXI.Graphics();
            playerRole.vx = 0;
            playerRole.vy = 0;

            playerRole.beginFill(color);
            playerRole.drawCircle(0, 0, 25);

            playerLayer.addChild(playerRole);

            playerList[msg] = playerRole;

        })


        var playerLayer = new PIXI.Container();

        stage.addChild(playerLayer);




        socket.on('update sprite', function(msg) {
            //console.log(msg);
            playerList[msg.id].vx = msg.x;
            playerList[msg.id].vy = msg.y;
        });



        //Set the game state
        state = play;

        function play() {
            //Use the playerRole's velocity to make it move
            for (var i = 0; i < playerLayer.children.length; i++) {
                var _currentPlayer = playerLayer.children[i];

                _currentPlayer.x += _currentPlayer.vx;
                _currentPlayer.y += _currentPlayer.vy;

                if (_currentPlayer.x > displayWidth) {
                    _currentPlayer.x = displayWidth;
                }

                if (_currentPlayer.x < 0) {
                    _currentPlayer.x = 0;
                }

                if (_currentPlayer.y > displayHeight) {
                    _currentPlayer.y = displayHeight;
                }

                if (_currentPlayer.y < 0) {
                    _currentPlayer.y = 0;
                }
            }
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
