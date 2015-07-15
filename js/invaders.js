var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function preload() {

    game.load.image('bullet', 'images/invaders/bullet.png');
    game.load.image('enemyBullet', 'images/invaders/enemy-bullet.png');
    game.load.spritesheet('invader', 'images/invaders/invader32x32x4.png', 32, 32);
    //spritesheet(key, url, frameWidth, frameHeight, frameMax, margin, spacing)
    game.load.image('ship', 'images/invaders/player.png');
    game.load.spritesheet('kaboom', 'images/invaders/explode.png', 128, 128);
    game.load.image('starfield', 'images/invaders/starfield.png');
    game.load.image('background', 'images/starstruck/background2.png');

}

var player;
var players;
var playerList = [];
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];
var socket;
var result;
var de = 35;
//彈道偏移
var tt = [1, -1];

var angle = 0;

function create() {
    socket = io.connect();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // 切換分頁還會繼續執行    
    this.stage.disableVisibilityChange = true;
    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(300, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('pivot.x', 0.5);
    bullets.setAll('pivot.y', 0.5);


    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(130, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!

    players = game.add.group();
    /*
    for (var i = 0; i < 2; i++) {
        var playerss = game.add.sprite(400 + i * 40, 500, 'ship');
        playerss.anchor.setTo(0.5, 0.5);
        game.physics.enable(playerss, Phaser.Physics.ARCADE);
        players.push(playerss);
    }
    */

    var hero = players.create(400, 500, 'ship');
    hero.anchor.setTo(0.5, 0.5);
    game.physics.enable(hero, Phaser.Physics.ARCADE);
    hero.vx = 0;
    hero.vy = 0;
    hero.life = 2;
    hero.bulletTime = 0;

    graphics2 = game.add.graphics(0, 0);
    graphics2.clear();
    //graphics2.lineStyle(1, 0xffffff);
    graphics2.beginFill(0xa000f3, 0.5);
    graphics2.arc(0, 0, 160, 0, game.math.degToRad(de) * -1, 1);
    // graphics2.drawRect(-10, -100, 20, 100);
    //   graphics2.rotation =game.math.degToRad(Math.abs(90-(de/2)))*-1;
    graphics2.endFill();

    hero.addChild(graphics2);
    graphics2.y = -10;

    console.log(graphics2);


    game.input.mouse.onMouseMove = function(pointer, x, y) {
        // pointer returns the active pointer, x and y return the position on the canvas
        // result = (pointer.x - hero.x) + "," + (pointer.y - hero.y);
        var _x = pointer.x - hero.x;
        var _y = pointer.y - hero.y;
        //  graphics2.rotation = Math.atan2(_y, _x) + graphics2.directRevise;
        //console.log(pointer)
    }

    game.input.mouse.onMouseDown = function(pointer, x, y) {
        // result = "A";
        // result= graphics2.rotation;
        var _x = pointer.x - hero.x;
        var _y = pointer.y - hero.y;

        fireBullet(hero, _x, _y);

        //graphics2.clear()
        //  graphics2.arc(0, 0, 160, 0, game.math.degToRad(90) * -1, 1);
        //graphics2.endFill();

        de++;
    }

    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens();

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, {
        font: '34px Arial',
        fill: '#fff'
    });

    //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives : ', {
        font: '34px Arial',
        fill: '#fff'
    });

    //  Text
    stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', {
        font: '84px Arial',
        fill: '#fff'
    });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++) {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0.4;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    socket.on('addNewPlayer', function(msg) {

        var hero = players.create(400, 500, 'ship');
        hero.anchor.setTo(0.5, 0.5);
        game.physics.enable(hero, Phaser.Physics.ARCADE);
        hero.vx = 0;
        hero.vy = 0;
        hero.life = 2;
        hero.bulletTime = 0;
        hero.id = msg;
        hero.score = 0;
        playerList[msg] = hero;

        socket.on('update sprite', function(msg) {
            playerList[msg.id].vx = msg.x;
            playerList[msg.id].vy = msg.y;

        });

        socket.on('shooting', function(msg) {
            fireBullet(playerList[msg]);
        });


    })

    socket.on('disconnect', function(msg) {

        //playerList[msg].kill();
        players.removeChild(playerList[msg]);
    })






}

function createAliens() {

    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 10; x++) {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [0, 1, 2, 3], 20, true);
            //add(name, frames, frameRate, loop, useNumericIndex)
            alien.play('fly');
            alien.body.moves = false;
        }
    }



    aliens.x = 100;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to({
        x: 200
    }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    //to(properties, duration, ease, autoStart, delay, repeat, yoyo) 
    //  When the tween loops it calls descend
    tween.onLoop.add(descend);
}

function setupInvader(invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    // aliens.y += 10;

}

function update() {
    // graphics2.rotation += 0.01;
    //  Scroll the background

    // result = graphics2.rotation;
    starfield.tilePosition.y += 2;
    for (var i = 0; i < players.countLiving(); i++) {
        var _player = players.getChildAt(i);


        if (_player.alive) {
            //  Reset the player, then check for movement keys

            _player.body.velocity.setTo(0, 0);
            _player.body.velocity.x = _player.vx;

            if (game.time.now > firingTimer) {
                // enemyFires();
            }

            //  Run collision
            game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
            game.physics.arcade.overlap(enemyBullets, _player, enemyHitsPlayer, null, this);
        }
    }


    if (cursors.left.isDown) {
        // graphics2.rotation -= 0.1;
        angle -= 5;
    } else if (cursors.right.isDown) {
        // graphics2.rotation += 0.1;
        angle += 5;
    }

    if (cursors.up.isDown) {
        // graphics2.rotation -= 0.1;
        if (de < 180) {
            de += 5;
        }
    } else if (cursors.down.isDown) {
        // graphics2.rotation += 0.1;

        if (de > 10) {
            de -= 5;
        } 
    }


    if (fireButton.isDown) {
        fireBullet(players.children[0]);

    }

    graphics2.clear();
    //graphics2.lineStyle(1, 0xffffff);
    graphics2.beginFill(0xa000f3, 0.5);
    graphics2.arc(0, 0, 160, 0, game.math.degToRad(de) * -1, 1);
    // graphics2.drawRect(-10, -100, 20, 100);
    //   graphics2.rotation =game.math.degToRad(Math.abs(90-(de/2)))*-1;
    graphics2.endFill();

    graphics2.rotation = game.math.degToRad(angle) + game.math.degToRad(Math.abs(90 - (de / 2))) * -1;


    //graphics2.endAngle += 0.1;
    // result = graphics2.rotation + "/" + Math.PI;
}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }
    //  game.debug.inputInfo(32, 32);
    game.debug.text(result, 10, 20);

}

function collisionHandler(bullet, alien) {

    //  When a bullet hits an alien we kill them both

    //  playerList[bullet.heroId].score += 20;
    // console.log(playerList[bullet.heroId].score);
    /* socket.emit('get score', {
         id: bullet.heroId,
         score: playerList[bullet.heroId].score
     });*/
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);



    /* if (aliens.countLiving() == 0) {
         score += 1000;
         scoreText.text = scoreString + score;

         enemyBullets.callAll('kill', this);
         stateText.text = " You Won, \n Click to restart";
         stateText.visible = true;

         //the "click to restart" handler
         game.input.onTap.addOnce(restart, this);
     }*/

}

function enemyHitsPlayer(player, bullet) {

    bullet.kill();
    /*
    live = lives.getFirstAlive();

    if (live) {
        live.kill();
    }*/

    player.life--;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies

    if (player.life < 1) {

        player.kill();
        /*enemyBullets.callAll('kill');

        stateText.text = " GAME OVER \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart, this);*/
    }

}

function enemyFires() {

    //  Grab the first bullet we can from the pool
    if (players.length == 0) {
        return false;
    }

    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length = 0;

    aliens.forEachAlive(function(alien) {

        // put every living enemy in an array
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0) {

        var random = game.rnd.integerInRange(0, livingEnemies.length - 1);

        // randomly select one of them
        var shooter = livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        var pRandom = game.rnd.integerInRange(0, players.countLiving() - 1);

        game.physics.arcade.moveToObject(enemyBullet, players.getChildAt(pRandom), 120);
        firingTimer = game.time.now + 2000;
    }

}

function fireBullet(_player, _x, _y) {

    if (_player.alive) {
        if (game.time.now > _player.bulletTime) {
            bullet = bullets.getFirstExists(false);
            if (bullet) {

                bullet.heroId = _player.id;
                bullet.reset(_player.x, _player.y - 10);
                var a = angle + (Math.floor(Math.random() * de / 2) * tt[Math.floor(Math.random() * 2)]);
                var _dgre = game.math.degToRad(a);

                bullet.rotation = _dgre;
                var _xx = _player.x + Math.sin(_dgre) * 160;
                var _yy = _player.y + Math.cos(_dgre) * -160;
                game.physics.arcade.moveToXY(bullet, _xx, _yy, 500)


            }
            _player.bulletTime = game.time.now + 5;
        }

    }
}

function resetBullet(bullet) {
    //  Called if the bullet goes out of the screen
    bullet.kill();

}




function restart() {
    //  A new level starts

    //resets the life count
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;

}
