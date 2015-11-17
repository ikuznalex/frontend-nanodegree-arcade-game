var Enemy = function(speedOfMovement /*pixels*/) {
    this.x = this.startXPosition;
    this.y = this.startYPosition;
    this.sprite = 'images/enemy-bug.png';
    this.speedOfMovement = speedOfMovement || 0;
};

Enemy.prototype.startXPosition = 0;
Enemy.prototype.startYPosition = 83;
Enemy.prototype.maxX = 404;
Enemy.prototype.minY = 83;
Enemy.prototype.maxY = 332;
Enemy.prototype.xStep = 101;
Enemy.prototype.yStep = 83;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt, newX, newY) {
    // TODO: You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    var xToSet = typeof newX === "undefined" ? this.x + this.speedOfMovement : newX;
    var yToSet = typeof newY === "undefined" ? this.y : newY;
    var canChangePosition = this.canUnitChangePosition(xToSet, yToSet);
    this.x = !canChangePosition ? this.startXPosition : xToSet;
    this.y = !canChangePosition ? this.startYPosition : yToSet;
};

//Draws the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


//Indicates whether the unit can change position
Enemy.prototype.canUnitChangePosition = function(x, y) {
    if (x <= this.maxX) {
        return true;
    } else {
        return false;
    }
};

//Constructs player object. 
var Player = function(speedOfMovement) {
    Enemy.call(this, speedOfMovement);
    this.sprite = 'images/char-boy.png';
};

Function.prototype.inheritsFrom = function(superClass) {
   this.prototype = Object.create(superClass.prototype);
   this.prototype.constructor = this;
};

Player.inheritsFrom(Enemy);

Player.prototype.startXPosition = 202;
Player.prototype.startYPosition = 405; 
Player.prototype.maxX = 404;
Player.prototype.maxY = 405;

Player.prototype.canUnitChangePosition = function(x, y) {
    if (x <= this.maxX && x >= 0 && y <= this.maxY && y >= -10) {
        return true;
    } else {
        return false;
    }
};

Player.prototype.handleInput = function(key) {
  switch (key) {
      case "left":
           this.update(undefined,  this.x - this.xStep);
          break;
      case "up": 
            this.update(undefined, undefined, this.y - this.yStep);
          break;
      case "right": 
            this.update(undefined, this.x + this.xStep);
          break;
      case "down":
           this.update(undefined, undefined, this.y + this.yStep);
          break;
  }
  this.render();
};

var player = new Player();

var enemy1 = new Enemy(5);
var enemy2 = new Enemy(10);
var enemy3 = new Enemy(1);

enemy2.startYPosition = 83*2;
enemy3.startYPosition = 83*3;

var allEnemies = [ enemy1,
                   enemy2,
                   enemy3 ];

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
