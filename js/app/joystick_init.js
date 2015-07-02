define(['app/keyboard', 'io'], function(kb, io) {
    var socket = io();

    function init() {

        stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.right = '0px';
        stats.domElement.style.top = '0px';

        document.body.appendChild(stats.domElement);

        displayWidth = window.innerWidth;
        displayHeight = window.innerHeight;

        stage = new PIXI.Container();

        var joyStickLayer = new PIXI.Container();
        var buttonLayer = new PIXI.Container();

        buttonLayer.x = displayWidth / 2;


        var shoot = createButton();
        shoot.interactive = true;
        shoot.buttonMode = true;

        shoot.on('mousedown', _shooting)
            .on('touchstart', _shooting);

        shoot.x = displayWidth / 4;
        shoot.y = displayHeight / 2;

        //需要劃一個area 做touch area
        joyStickLayer.hitArea = new PIXI.Rectangle(0, 0, displayWidth / 2, displayHeight);

        joyStickLayer.interactive = true;
        joyStickLayer.buttonMode = true;


        renderer = PIXI.autoDetectRenderer(displayWidth, displayHeight, {
            backgroundColor: 0xFFFFFF
        });

        document.getElementById("gameView").appendChild(renderer.view);

        var joystick = new PIXI.Sprite.fromFrame('joystick_base.png');

        var stick = new PIXI.Sprite.fromFrame('joystick.png');

        var score = createScore();





        /*stick.anchor.x = 0.5;
        stick.anchor.y = 0.5;*/

        joystick.anchor.x = 0.5;
        joystick.anchor.y = 0.5;
        stick.anchor.x = 0.5;
        stick.anchor.y = 0.5;

        joystick.addChild(stick);
        joyStickLayer.addChild(joystick)
        stage.addChild(joyStickLayer);
        stage.addChild(buttonLayer);


        joystick.x = joystick.width / 2 + 100;
        joystick.y = joystick.height / 2 + 100;

        /*stick.x = joystick.width / 2 - stick.width / 2;
        stick.y = joystick.height / 2 - stick.height / 2;*/
        joystick.visible = false
        stick.interactive = true;
        stick.buttonMode = true;


        joyStickLayer.on('mousedown', showJoystick)
            .on('touchstart', showJoystick)
            .on('mouseup', hideJoystick)
            .on('mouseupoutside', hideJoystick)
            .on('touchend', hideJoystick)
            .on('touchendoutside', hideJoystick)
            .on('mousemove', joystickMove)
            .on('touchmove', joystickMove);




        function showJoystick(event) {
            var _tp = event.data.getLocalPosition(this);
            joystick.visible = true;
            joystick.x = _tp.x;
            joystick.y = _tp.y;

            //onDragStart.call(stick, event);
            stick.data = event.data;
            //this.alpha = 0.5;
            stick.dragging = true;
            stick.sx = stick.data.getLocalPosition(this).x * stick.scale.x;
            stick.sy = stick.data.getLocalPosition(this).y * stick.scale.y;
            stick.lastMove = {
                x: 0,
                y: 0
            };
        }

        function hideJoystick() {
            joystick.visible = false;
            stick.dragging = false;
            // set the interaction data to null
            stick.data = null;
            stick.x = 0;
            stick.y = 0;
            stick.lastMove = {
                x: 0,
                y: 0
            };
            socketEmit(0, 0);
        }

        function joystickMove() {
            if (stick.dragging) {
                var newPosition = stick.data.getLocalPosition(this),
                    _px = newPosition.x - stick.sx,
                    _py = newPosition.y - stick.sy,
                    _returnPostion = {
                        x: 0,
                        y: 0
                    };


                if (newPosition.x - joystick.x < stick.parent.width / 2 &&
                    newPosition.x - joystick.x > (stick.parent.width / 2) * -1) {
                    stick.position.x = _px;
                }

                if (newPosition.y - joystick.y < stick.parent.height / 2 &&
                    newPosition.y - joystick.y > (stick.parent.height / 2) * -1) {
                    stick.position.y = _py;
                }

                // console.log("x:%s,y:%s", stick.position.x, stick.position.y);

                if (Math.abs(stick.position.x) > 10) {
                    if (stick.position.x > 0) {
                        _returnPostion.x = 5;
                    } else {
                        _returnPostion.x = -5;
                    }
                }

                if (Math.abs(stick.position.y) > 10) {
                    if (stick.position.y > 0) {
                        _returnPostion.y = 5;
                    } else {
                        _returnPostion.y = -5;
                    }
                }

                if (stick.lastMove != _returnPostion) {
                    socketEmit(_returnPostion.x, _returnPostion.y);
                }

                stick.lastMove = {
                    x: _returnPostion.x,
                    y: _returnPostion.y
                };
            }
        }

        function _shooting() {
            socket.emit('shooting',currentId);
        }

        var socket = io();

        socket.on('get score', function(msg) {
            if (msg.id == currentId) {
                score.text = msg.score;
            }
        })

        var left = kb.keyboard(37),
            up = kb.keyboard(38),
            right = kb.keyboard(39),
            down = kb.keyboard(40);

        //Left arrow key `press` method
        left.press = function() {
            socketEmit(-5, 0);
        };

        //Left arrow key `release` method
        left.release = function() {
            if (!right.isDown) {
                socketEmit(0, 0);
            }
        };

        //Up
        up.press = function() {
            socketEmit(0, -5);
        };
        up.release = function() {
            if (!down.isDown) {
                socketEmit(0, 0);
            }
        };

        //Right
        right.press = function() {
            socketEmit(5, 0);
        };
        right.release = function() {
            if (!left.isDown) {
                socketEmit(0, 0);
            }
        };

        //Down
        down.press = function() {
            socketEmit(0, 5);
        };
        down.release = function() {
            if (!up.isDown) {
                socketEmit(0, 0);
            }
        };

        //Set the game state

        animate();

        function createButton() {
            var _btn = new PIXI.Graphics();
            _btn.beginFill(0x999999);
            _btn.drawCircle(0, 0, 100);

            buttonLayer.addChild(_btn);
            return _btn;
        }

        function createScore() {
            var _scoreLayer = new PIXI.Container();
            var _sTitle = new PIXI.Text("score:", {
                font: '50px Arial',
                fill: 0xaaaaaa
            });
            var _score = new PIXI.Text("0", {
                font: '50px Arial',
                fill: 0x333333
            });
            _scoreLayer.addChild(_sTitle);
            _scoreLayer.addChild(_score);
            _score.x = _sTitle.width + 10;
            stage.addChild(_scoreLayer);

            _scoreLayer.x = displayWidth / 2;

            return _score;
        }

    }

    function animate() {
        stats.begin();
        renderer.render(stage);
        // state();
        stats.end();
        requestAnimFrame(animate);
    }

    function socketEmit(_x, _y) {

        socket.emit('update', {
            x: _x,
            y: _y,
            id: currentId
        });
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
