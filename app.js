// Constants
var X_LEFT = 0,
    X_RIGHT = 707,
    Y_TOP = 0,
    Y_BOTTOM = 498,
    X_STEP = 101,
    Y_STEP = 83,
    X_CANVAS = 707,
    Y_CANVAS = 606;

// General Utility Functions
var inRange = function (value, min, max) {
    if (value <= max && value >= min) {
        return true;
    }
    return false;
};

var randInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

var choice = function(array) {
    return array[Math.floor(Math.random() * array.length)];
};

var removeElement = function(element, array) {
    var index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1); 
    }
};

var pauseAlert = function (text) {
    gamestate.paused = true;
    bootbox.alert(text, function () {
        gamestate.paused = false
    });
};

var generateWeighedList = function (list, weight) {
    var weighed_list = [];
    // Loop over weights
    for (var i = 0; i < weight.length; i++) {
        var multiples = weight[i] * 100;
        // Loop over the list of items
        for (var j = 0; j < multiples; j++) {
            weighed_list.push(list[i]);
        }
    }
    return weighed_list;
};

// Array where keystroke codes will be sent.
// If variable keys contains secretCode, player
// god mode will be activated.  This unlocks
// ability to enter cheats.
var keys = [];
var secretCode = '38,38,40,40,37,39,37,39,66,65';

// Variables Relating to Game Cheats
var cheats = {
    'there is no cow level': function () {
        gamestate.activeCheats.cow = true;
        allEnemies.forEach(function (enemy) {
            enemy.sprite = 'images/Cow.png';
        })
    },
    'I AM INVINCIBLE!!!': function () {
        gamestate.activeCheats.invincible = true;
        player.blink();
        player.isInvincible = true;
    },
    'Street fighter is cool': function () {
        gamestate.activeCheats.hadouken = true;
    },
    'This game is completely Udacious!!!': function () {
        gamestate.activeCheats.udacity = true;
        player.isUdacious = true;
        player.hasKey = true;
    },
    'Hot tub time machine': function() {
        bootbox.alert(timeMachineMessage1,function() {
            $('#title').html('HUH???');
            gamestate.activeCheats.time = true;
            gamestate.level = -1;
            $('#level').html('?');
        });
    }
};

// Constructors
/**
 * An Object containing data about the current game.
 * @constructor
 */
var GameState = function () {
    this.paused = false;
    this.level = 1;
    this.speed = 1;
    this.score = 0;
    this.activeCheats = {
        'cow': false,
        'hadouken': false,
        'time': false,
        'udacity': false,
        'invincible': false
    };
};

/**
 * Enemies our player must avoid
 * @constructor
 */
var Enemy = function () {
    this.width = 90;
    this.height = 80;
    this.maxSpeed = 200;
    this.minSpeed = 50;
    this.xStartOptions = [];
    this.yStartOptions = [];
    for (var i = -3; i < 5; i++) {
        this.xStartOptions.push(i * X_STEP);
    }
    for (var j = 1; j < 5; j++) {
        this.yStartOptions.push(j * Y_STEP);
    }
    this.startX();
    this.startY();
    this.setSpeed();
    this.sprite = 'images/enemy-bug.png';
    if (gamestate.activeCheats.cow) {
        this.sprite = 'images/Cow.png';
    }
};

Enemy.prototype.update = function (dt) {
    if (!gamestate.paused) {
        this.x += dt * this.speed * gamestate.speed;
    }
    if (this.x > X_RIGHT) {
        this.x = -3 * X_STEP;
        this.startY();
    }
};

Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y - 20);
};

Enemy.prototype.left = function () {
    return this.x;
};

Enemy.prototype.right = function () {
    return this.x + this.width;
};

Enemy.prototype.top = function () {
    return this.y;
};

Enemy.prototype.bottom = function () {
    return this.y + this.height;
};

Enemy.prototype.startX = function () {
    this.x = choice(this.xStartOptions);
    return this;
};

Enemy.prototype.startY = function () {
    this.y = choice(this.yStartOptions);
    return this;
};

Enemy.prototype.setSpeed = function () {
    this.speed = randInt(this.minSpeed, this.maxSpeed);
    return this;
};

/**
 * @constructor
 * @extends Enemy
 */
var Charger = function () {
    Enemy.call(this);
    this.sprite = 'images/charger.png';
    if (gamestate.activeCheats.cow) {
        this.sprite = 'images/Cow.png';
    }
    this.charging();
};

Charger.prototype = Object.create(Enemy.prototype);
Charger.prototype.constructor = Charger;
Charger.prototype.charging = function () {
    var thisCharger = this;
    var originalSpeed = thisCharger.speed;
    var chargingInterval = randInt(2000, 5000);
    setInterval(function () {
        var willCharge = Math.random();
        if (willCharge > 0.5) {
            if (!gamestate.activeCheats.cow) {
                thisCharger.sprite = 'images/charger-charging.png';
            }
            thisCharger.speed = 700;
            setTimeout(function () {
                thisCharger.speed = originalSpeed;
                if (!gamestate.activeCheats.cow) {
                    thisCharger.sprite = 'images/charger.png';
                }
            }, 500);
        }
    }, chargingInterval)
};

/**
 * @constructor
 * @extends Enemy
 */
var Sidestepper = function () {
    Enemy.call(this);
    this.sprite = 'images/sidestepper.png';
    if (gamestate.activeCheats.cow) {
        this.sprite = 'images/Cow.png';
    }
    this.sidestep();
};
Sidestepper.prototype = Object.create(Enemy.prototype);
Sidestepper.prototype.constructor = Sidestepper;
Sidestepper.prototype.sidestep = function () {
    var thisSidestepper = this;
    var steppingInterval = randInt(1000, 3000);
    setInterval(function () {
        var willStep = Math.random();
        if (willStep > 0.3) {
            var upOrDown = Math.random();
            if (upOrDown >= 0.5 && thisSidestepper.y < Y_BOTTOM - 2 * Y_STEP) {
                thisSidestepper.y += Y_STEP;
            } else if (upOrDown < 0.5 && thisSidestepper.y > Y_TOP + Y_STEP) {
                thisSidestepper.y -= Y_STEP;
            }
        }
    }, steppingInterval)
};

/**
 * @constructor
 * @extends Enemy
 */
var Backtracker = function () {
    Enemy.call(this);
    this.sprite = 'images/backtracker.png';
    if (gamestate.activeCheats.cow) {
        this.sprite = 'images/Cow.png';
    }
    this.backtrack();
};
Backtracker.prototype = Object.create(Enemy.prototype);
Backtracker.prototype.constructor = Backtracker;
Backtracker.prototype.update = function (dt) {
    if (!gamestate.paused) {
        this.x += dt * this.speed * gamestate.speed;
    }
    if (this.left() > X_RIGHT + 2*X_STEP && this.speed > 0) {
        this.speed *= -1;
        if (gamestate.activeCheats.cow){
            this.sprite = 'images/Cow-reverse.png';
        }
        else {
            this.sprite = 'images/backtracker-reverse.png';
        } 
    }
    if (this.right() < X_LEFT - 2*X_STEP && this.speed < 0) {
        this.speed *= -1;
        if (gamestate.activeCheats.cow) {
            this.sprite = 'images/Cow.png';
        }
        else {
            this.sprite = 'images/backtracker.png';
        }
    }
};

Backtracker.prototype.backtrack = function () {
    var thisBacktracker = this;
    var backtrackInterval = randInt(5000, 10000);
    setInterval(function () {
        var willBacktrack = Math.random();
        if (willBacktrack > 0.15) {
            thisBacktracker.speed *= -1;
            if (!gamestate.activeCheats.cow) {
                if (thisBacktracker.speed > 0) {
                    thisBacktracker.sprite = 'images/backtracker.png';
                } else {
                    thisBacktracker.sprite = 'images/backtracker-reverse.png';
                }
            } else {
                if (thisBacktracker.speed > 0) {
                    thisBacktracker.sprite = 'images/Cow.png';
                } else {
                    thisBacktracker.sprite = 'images/Cow-reverse.png';
                }
            }
        }
    }, backtrackInterval);
};

/**
 * @constructor
 * @extends Enemy
 */
var Slowpoke = function () {
    Enemy.call(this);
    this.sprite = 'images/slowpoke.png';
    if (gamestate.activeCheats.cow) {
        this.sprite = 'images/Cow.png';
    }
    this.minSpeed = 15;
    this.maxSpeed = 25;
};

Slowpoke.prototype = Object.create(Enemy.prototype);
Slowpoke.prototype.constructor = Slowpoke;

/**
 * @constructor
 * @extends Enemy
 */
var Centipede = function () {
    Enemy.call(this);
    this.sprite = 'images/centipede.png';
    if (gamestate.activeCheats.cow) {
        this.sprite = 'images/Cow-centipede.png';
    }
    this.width = 270;
};

Centipede.prototype = Object.create(Enemy.prototype);
Centipede.prototype.constructor = Centipede;


/**
 * A player class for the user to control.
 * @constructor
 */
var Player = function () {
    this.width = 60;
    this.height = 80;
    this.maxLives = 5;
    this.lives = 3;
    this.isInvincible = false;
    this.hasKey = false;
    this.startX();
    this.startY();
    this.sprite = 'images/char-boy.png';
};
Player.prototype.update = function () {};
Player.prototype.render = function () {
    if (gamestate.activeCheats.udacity) {
        ctx.drawImage(Resources.get('images/Udacity.png'), this.x, this.y + 20);
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y - 20);
    }
};
Player.prototype.startX = function () {
    this.x = map.start.x;
    return this;
};
Player.prototype.startY = function () {
    this.y = map.start.y;
    return this;
};
Player.prototype.left = function () {
    return this.x + 20;
};
Player.prototype.right = function () {
    return this.x + this.width;
};
Player.prototype.top = function () {
    return this.y;
};
Player.prototype.bottom = function () {
    return this.y + this.height;
};
Player.prototype.move = function (direction) {
    var newX;
    var newY;
    if (direction === 'left') {
        newX = this.x - X_STEP;
        newY = this.y;
    }
    if (direction === 'right') {
        newX = this.x + X_STEP;
        newY = this.y;
    }
    if (direction === 'up') {
        newX = this.x;
        newY = this.y - Y_STEP;
    }
    if (direction === 'down') {
        newX = this.x;
        newY = this.y + Y_STEP;
    }
    if (gamestate.activeCheats.time) {
        if (direction === 'left') {
            newX += 2 * X_STEP;
        }
        if (direction === 'right') {
            newX -= 2 * X_STEP;
        }
        if (direction === 'up') {
            newY += 2 * Y_STEP;
        }
        if (direction === 'down') {
            newY -= 2 * Y_STEP;
        }
    }
    var onMap = false;
    map.tiles.forEach(function (tile) {
        if (newX === tile.x && newY === tile.y) {
            onMap = true;
        }
    });

    if (onMap) {
        if (newX === map.end.x && newY === map.end.y && !this.hasKey) {
            return;
        }
        var hitRock = false;
        map.rocks.forEach(function (rock) {
            if (newX === rock.x && newY === rock.y) {
                hitRock = true;

            }
        });
        if (!hitRock) {
            this.x = newX;
            this.y = newY;
        }
    }
};
Player.prototype.enterCommand = function () {
    gamestate.paused = true;
    bootbox.prompt(commandMessage, function (command) {
        if (command !== null) {
            if (cheats[command]) {
                bootbox.alert(cheatMessages[command], function () {
                    gamestate.paused = false;
                });
                cheats[command]();
            } else {
                gamestate.paused = false;
            }
        } else {
            gamestate.paused = false;
        }
    });
};
Player.prototype.handleInput = function (input) {
    if (!gamestate.paused) {
        if (input === 'left' || 'right' || 'up' || 'down') {
            this.move(input);
        }
        if (input === 'pause') {
            pauseAlert(pauseMessage);
        }
        if (this.godMode) {
            if (input === 'command') {
                this.enterCommand();
            }
            if (gamestate.activeCheats.hadouken) {
                if (input === 'leftAttack' || input === 'rightAttack') {
                    gamestate.hadouken = true;
                    setTimeout(function () {
                        gamestate.hadouken = false;
                    }, 500);
                    allAttacks.push(new Hadouken(input));
                }
            }
            if (gamestate.activeCheats.udacity) {
                if (input === 'leftUdacity' || input === 'rightUdacity') {
                    allAttacks.push(new HTML(input));
                    allAttacks.push(new CSS(input));
                    allAttacks.push(new JS(input));
                }
            }
        }
    }
};
Player.prototype.blink = function () {
    var thisPlayer = this;
    setInterval(function () {
        thisPlayer.sprite = 'images/char-boy-blink1.png';
        setTimeout(function () {
            thisPlayer.sprite = 'images/char-boy-blink2.png';
        }, 100);
        setTimeout(function () {
            thisPlayer.sprite = 'images/char-boy-blink3.png';
        }, 200);
    }, 300);
};

var Attack = function () {
    this.x = player.x;
    this.y = player.y;
    this.width = 80;
    this.height = 80;
};

Attack.prototype.update = function (dt) {
    if (!gamestate.paused) {
        this.x += dt * this.speed * gamestate.speed;
    }
    if (this.x > X_RIGHT || this.x < X_LEFT - X_STEP) {
        this.speed = 0;
    }
};

Attack.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y + 40);
};

Attack.prototype.update = function (dt) {
    if (!gamestate.paused) {
        this.x += dt * this.speed * gamestate.speed;
    }
    if (this.x > X_RIGHT || this.x < X_LEFT - X_STEP) {
        this.speed = 0;
    }
};

Attack.prototype.left = function () {
    return this.x + 20;
};
Attack.prototype.right = function () {
    return this.x + this.width;
};
Attack.prototype.top = function () {
    return this.y;
};
Attack.prototype.bottom = function () {
    return this.y + this.height;
};

var Hadouken = function (direction) {
    Attack.call(this);
    if (direction === 'leftAttack') {
        this.speed = -300;
        this.sprite = 'images/Hadouken-left.png';
    } else if (direction === 'rightAttack') {
        this.speed = 300;
        this.sprite = 'images/Hadouken-right.png';
    }
};

Hadouken.prototype = Object.create(Attack.prototype);
Hadouken.prototype.constructor = Hadouken;

var HTML = function (direction) {
    Attack.call(this);
    this.y = player.y - Y_STEP;

    if (direction === 'leftUdacity') {
        this.speed = -300;
    } else if (direction === 'rightUdacity') {
        this.speed = 300;
    }
    this.sprite = 'images/html.png';
};

HTML.prototype = Object.create(Attack.prototype);
HTML.prototype.constructor = HTML;
HTML.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y - 20);
};

var CSS = function (direction) {
    Attack.call(this);
    this.y = player.y;

    if (direction === 'leftUdacity') {
        this.speed = -300;
    } else if (direction === 'rightUdacity') {
        this.speed = 300;
    }
    this.sprite = 'images/css.png';
};

CSS.prototype = Object.create(Attack.prototype);
CSS.prototype.constructor = CSS;
CSS.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var JS = function (direction) {
    Attack.call(this);
    this.y = player.y + Y_STEP;

    if (direction === 'leftUdacity') {
        this.speed = -300;
    } else if (direction === 'rightUdacity') {
        this.speed = 300;
    }
    this.sprite = 'images/js.png';
};

JS.prototype = Object.create(Attack.prototype);
JS.prototype.constructor = JS;
JS.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var Item = function (x, y) {
    this.x = x;
    this.y = y;
    this.destroyed = false;
};

Item.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y - 20);
};

Item.prototype.update = function () {
};

var Heart = function (x, y) {
    Item.call(this, x, y);
    this.sprite = 'images/Heart.png';
};

Heart.prototype = Object.create(Item.prototype);
Heart.prototype.constructor = Heart;

var Key = function (x, y) {
    Item.call(this, x, y);
    this.sprite = 'images/Key.png';
};

Key.prototype = Object.create(Item.prototype);
Key.prototype.constructor = Key;

var Gem = function (x, y) {
    Item.call(this, x, y);
    this.spriteOptions = ['images/Gem Blue.png', 'images/Gem Green.png', 
                          'images/Gem Orange.png'];
    this.sprite = choice(this.spriteOptions);
    this.fading = false;
    this.disappear();
};

Gem.prototype = Object.create(Item.prototype);
Gem.prototype.constructor = Gem;
Gem.prototype.render = function () {
    if (this.fading) {
        ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y - 20);
    ctx.globalAlpha = 1;
};
Gem.prototype.disappear = function () {
    var thisGem = this;
    setTimeout(function() {
        thisGem.fading = true;
    }, 2500);
    setTimeout(function() {
        thisGem.destroyed = true;
    }, 4000);
};

var MapTile = function (x, y) {
    this.x = x;
    this.y = y;
};

MapTile.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var Grass = function (x, y) {
    MapTile.call(this, x, y);
    this.sprite = 'images/grass-block.png';
    if (gamestate.level > 25) {
        this.sprite = 'images/dead-grass-block.png';
    }
};

Grass.prototype = Object.create(MapTile.prototype);
Grass.prototype.constructor = Grass;

var Stone = function (x, y) {
    MapTile.call(this, x, y);
    this.sprite = 'images/stone-block.png';
    if (gamestate.level > 25) {
        this.sprite = 'images/dark-stone-block.png';
    }
};

Stone.prototype = Object.create(MapTile.prototype);
Stone.prototype.constructor = Stone;

var Water = function (x, y) {
    MapTile.call(this, x, y);
    this.sprite = 'images/water-block.png';
    if (gamestate.level > 25) {
        this.sprite = 'images/lava-block.png';
    }
};

Water.prototype = Object.create(MapTile.prototype);
Water.prototype.constructor = Water;


var MapObject = function (x, y) {
    this.x = x;
    this.y = y;
};

MapObject.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y - 20);
};

var StartPoint = function (x, y) {
    MapObject.call(this, x, y);
    this.sprite = 'images/nothing.png';
};

StartPoint.prototype = Object.create(MapObject.prototype);
StartPoint.prototype.constructor = StartPoint;

var Door = function (x, y) {
    MapObject.call(this, x, y);
    this.sprite = 'images/Door.png';
};

Door.prototype = Object.create(MapObject.prototype);
Door.prototype.constructor = Door;

var Rock = function (x, y) {
    MapObject.call(this, x, y);
    this.sprite = 'images/Rock.png';
};

Rock.prototype = Object.create(MapObject.prototype);
Rock.prototype.constructor = Rock;

// Declare Entities
var gamestate;
var map;
var player;
var allEnemies;
var allItems;
var allAttacks;
var levelStartTime;
var levelFinishTime;

// Prevent arrow keys from scrolling window
window.addEventListener("keydown", function (e) {
    // space and arrow keys
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        80: 'pause',
        67: 'command',
        65: 'leftAttack',
        68: 'rightAttack',
        81: 'leftUdacity',
        69: 'rightUdacity'
    };
    if (!player.godMode) {
        keys.push(e.keyCode);
        if (keys.toString().indexOf(secretCode) >= 0) {
            player.godMode = true;
            pauseAlert(unlockCheatsMessage);
            keys = [];
        }
    }
    player.handleInput(allowedKeys[e.keyCode]);
});

// Game Dialog/Messages
var deathMessage = "<h2>Crushed Like a Bug...</h2><hr><div class='text-left'>" +
    "<p>...by a bug.  Wait, what!?</p><p>How does that even happen?  I " +
    "thought you were supposed to be the chosen one!</p>" +
    "<p>And you're taken down by a bug?  Ok, we're doomed...'</p><br>" +
    "<p><em>(Actually for all I know you drowned, because I'm lazy and " + 
    "didn't write more than one death dialog.  Heck, you could've even been " +
    "run over by a <strong>Cow</strong>! " +
    "Wouldn't that be something?)</em></p></div>";

var gameOverMessage = "<h2>The Prophecies Were Wrong...</h2><hr><p>...or " +
    "I misinterpreted them...but never mind that.</p><p>Either way, not " +
    "too great to be you right now, Steve.  Well...if you want to try again " +
    "and be not-terrible this time, feel free.</p><br><h5 " +
    "style='text-style:underline'>Your Stats</h5><p style=" +
    "'text-align:center'>Level: <span id='finalLevel'></span>" +
    "</p><p style='text-align:center'>Score: <span id='score'></span></p>";

var openingMessage = "<h2>Greetings Traveler!</h2><div class='text-left'>" +
    "<hr><p>What's your name, son?</p><p>What was that?  Speak up, boy!  " +
    "Eh, it doesn't matter.  It's entirely irrelevant to this game.</p>" +
    "<p>Anywho, the prophecies foretold an inexcplicably silent boy " +
    "named...uhhhh...I don't know?  Steve?  <em>Steve?</em>  Yeah let's go " +
    "with that.</p><p>Like I was saying, this kid Steve was going to save " +
    "our land from all these bugs running around all over the place, moving " +
    "left to right...over and over.  It's maddening!!</p><p>Huh, what's " +
    "that!?  You want to know how you're supposed to save us?  Sorry " +
    "Steve-o, prophecy wasn't so specific.  Though I'm thinkin' if you keep " +
    "on grabbin' these keys...</p><img src='images/Key.png' alt='Key'>" +
    "<p>And heading through these door...errr...rock...uhhhhh...rock-door " +
    "dealies...</p><img src='images/Door.png' alt='Door'><p>Everything's " +
    "going to turn out ALLLLLLLRIGHT!!</p><p>Now get going you fool!  " +
    "We're all counting on you!</p></div>";

var instructionMessage = "<h2>Game: How to Play It</h2><hr><div " +
    "class='text-left'><p>Now to move ole Stevie here, use these:</p>" +
    "<img src='images/arrow_keys.png' alt='Arrow Keys'>" +
    "<p>Move him to the key like I showed you before, then get him to that " +
    "there rock-door.  (And stay away from water.  Our friend Steve here " +
    "can't swim.)</p><p>The faster you complete a level, the more points " +
    "you get! And you'll get even more points if you collect a " +
    "<strong>Gem</strong> along the way!</p><p>Keep on going as long as " +
    "you can!</p><p>Also you can press <strong>P</strong> at any time to " +
    "<strong>Pause</strong> the game.  Press <strong>Enter</strong> to " +
    "resume play.</p></div>";

var pauseMessage = "<h2>Game Paused</h2><hr><p style='text-align:center'>" +
    "Press <strong>Enter</strong> to resume.</p>";

var unlockCheatsMessage = "<h4>You Have Pleased the Gods...</h4><hr>" +
    "<p>...with your little 'up,up,down,down' dance!  They've bestowed their " +
    "powers upon you!</p><p>Now press </strong>C</strong> and your bidding " +
    "will be done!</p><p><em>(...or nothing will happen at all and you'll " +
    "just look like a fool)</em></p>";

var commandMessage = "<h5>What is your bidding oh Great One?</h5>";

var invincibleMessage = "<h2>Hey you're all blinky!  That's pretty cool!" +
    "</h2><hr><p style='text-align: center'>(PS. You're invincible now)</p>" +
    "<p style='text-align: center'>(PSS. You still don't know " +
    "how to swim...)</p>";

var cowMessage = "<h2><em>Mooooooooooooooooooooooooooo...</em></h2>";

var udaciousMessage = "<h4>Hey, I think so too!  Glad you're enjoying it!" +
    "</h4><hr><p style='text-align:center'>Try pressing <strong>Q</strong> " +
    "or <strong>E</strong>!";

var hadoukenMessage = "<h2>HADOUKEN!!!</h2><hr><p style='text-align:center'>" +
    "I'd recommend pressing <strong>A</strong> or <strong>D</strong></p>";

var timeMachineMessage1 = "<h2>You Step Into The Time Machine...</h2><hr>" +
    "<p>...hoping to go back in time and tell your past self to avoid this " +
    "place so you'll never get roped into running around getting crushed by " +
    "giant bugs repeatedly...</p>";

var timeMachineMessage2 = "<p>...but something went very wrong. " +
    "Where (when??) are you?</p>";

var cheatMessages = {
    'there is no cow level': cowMessage,
    'I AM INVINCIBLE!!!': invincibleMessage,
    'This game is completely Udacious!!!': udaciousMessage,
    'Street fighter is cool': hadoukenMessage,
    'Hot tub time machine': timeMachineMessage2
};