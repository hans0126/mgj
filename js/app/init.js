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

        var playerLayer = new PIXI.Container();
        var bulletLayer = new PIXI.Container();
        var enemyLayer = new PIXI.Container();

        socket.on('addNewPlayer', function(msg) {

            playerRole = createPlayer();
            playerList[msg] = playerRole;
            playerRole.id = msg;

        })

        stage.addChild(playerLayer);
        stage.addChild(bulletLayer);
        stage.addChild(enemyLayer);

        for (i = 0; i < 3; i++) {
            for (j = 0; j < 10; j++) {
                createEnemy.call({
                    y: i,
                    x: j
                });
            }
        }


        socket.on('update sprite', function(msg) {

            playerList[msg.id].vx = msg.x;
            playerList[msg.id].vy = msg.y;
        });

        socket.on('shooting', function(msg) {

            createBullet.call(playerList[msg]);
        });


        var left = kb.keyboard(37),
            up = kb.keyboard(38),
            right = kb.keyboard(39),
            down = kb.keyboard(40),
            space = kb.keyboard(32);

        //Left arrow key `press` method
        left.press = function() {
            //socketEmit(-5, 0);
            playerRole.vx = -5;
        };

        //Left arrow key `release` method
        left.release = function() {
            if (!right.isDown) {
                playerRole.vx = 0;
            }
        };

        //Up
        up.press = function() {
            //socketEmit(0, -5);
            playerRole.vy = -5;
        };
        up.release = function() {
            if (!down.isDown) {
                //socketEmit(0, 0);
                playerRole.vy = 0;
            }
        };

        //Right
        right.press = function() {
            // socketEmit(5, 0);
            playerRole.vx = 5;
        };
        right.release = function() {
            if (!left.isDown) {
                //socketEmit(0, 0);
                playerRole.vx = 0;
            }
        };

        //Down
        down.press = function() {
            //socketEmit(0, 5);
            playerRole.vy = 5;
        };
        down.release = function() {
            if (!up.isDown) {
                // socketEmit(0, 0);
                playerRole.vy = 0;
            }
        };

        space.press = function() {
            createBullet.call(playerRole);
        }

        space.release = function() {

        }


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


            for (var i = 0; i < bulletLayer.children.length; i++) {

                var _bullet = bulletLayer.children[i];
                _bullet.y -= 10;

                if (_bullet.y < 0) {
                    bulletLayer.removeChild(_bullet);
                }

                for (var j = 0; j < enemyLayer.children.length; j++) {
                    var _enemy = enemyLayer.children[j];
                    if (hitTest(_bullet, _enemy)) {
                        var _parentIndex = playerLayer.children.indexOf(_bullet.ownership);
                        playerLayer.children[_parentIndex].score++;
                        var _id = playerLayer.children[_parentIndex].id;

                        socket.emit('get score', {
                            id: _id,
                            score: playerLayer.children[_parentIndex].score
                        });

                        enemyLayer.removeChild(_enemy);
                        bulletLayer.removeChild(_bullet);

                    }
                }
            }
        }

        function createBullet() {
            var _bullet = new PIXI.Graphics();

            _bullet.beginFill(0xFFFFFF);
            _bullet.drawCircle(0, 0, 10);
            bulletLayer.addChild(_bullet);

            _bullet.x = this.x;
            _bullet.y = this.y;
            _bullet.ownership = this;
        }

        function createEnemy() {
            var _enemy = new PIXI.Graphics();
            _enemy.beginFill(0xF00000);
            _enemy.drawRect(0, 0, 30, 10)
            enemyLayer.addChild(_enemy);

            _enemy.x = this.x * _enemy.width + this.x * 10;
            _enemy.y = this.y * _enemy.height + this.y * 10;
        }

        function createPlayer() {
            var _playerRole = new PIXI.Graphics();
            _playerRole.vx = 0;
            _playerRole.vy = 0;
            _playerRole.score = 0;
            _playerRole.beginFill(randomColor());
            _playerRole.drawCircle(0, 0, 25);

            playerLayer.addChild(_playerRole);

            _playerRole.x = displayWidth / 2;
            _playerRole.y = displayHeight - 80;


            return _playerRole;
        }

        animate();
    }


    function hitTest(r1, r2) {

        if (r1.x + r1.width > r2.x &&
            r1.y + r1.height > r2.y &&
            r1.x < r2.x + r2.width &&
            r1.y < r2.y + r2.height) {
            return true;
        } else {
            return false;
        }
    }

    function randomColor() {
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

        return color;
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
