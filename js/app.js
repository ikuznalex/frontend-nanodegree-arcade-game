// Enemies our player must avoid
var Enemy = function(x, y) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
        
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.x = x;
    this.y = y;
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt, newX, newY) {
    //TODO Use dt parameter
    this.x = newX != undefined ? newX : this.x;
    this.y = newY != undefined ? newY : this.y;
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.canUnitChangePosition = function() {
    //TODO Make playerMxX pototype variables.
    if (this.x <= playerMaxX && this.y <= playerMaxY) 
        return true;
    else {
        return false;
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(x, y) {
    Enemy.call(this, x, y);
    this.sprite = 'images/char-boy.png';
};

Function.prototype.inheritsFrom = function(superClass) {
   this.prototype = Object.create(superClass.prototype);
   this.prototype.constructor = this;
};

//Inherits update() and render() methods from superclass
Player.inheritsFrom(Enemy);


Player.prototype.handleInput = function(key) {
    //invokes even if not reqiure
  var canChangePosition = this.canUnitChangePosition();
  switch (key) {
      case "left":
          //TODO Bug palyer disappears when mroe then max value.
             this.update(undefined, canChangePosition ? this.x - xStep : playerStartXPosition);
          break;
      case "up":
            this.update(undefined, undefined, canChangePosition ? this.y - yStep : playerStartYPosition);
          break;
      case "right":
            this.update(undefined, canChangePosition ? this.x + xStep : playerStartXPosition);
          break;
      case "down":
           this.update(undefined, undefined, canChangePosition ? this.y + yStep : playerStartYPosition);
          break;
  }
  this.render();
  
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

//Global variables for player.
var playerStartXPosition = 202;
var playerStartYPosition = 415;
var playerMaxX = 404;
var playerMaxY = 415;
var enemyMaxX = 404;
var enemyMinY = 83;
var enemyMaxY = 332;

var xStep = 101;
var yStep = 83;

var player = new Player(playerStartXPosition, playerStartYPosition);

console.log(player.x);
console.log(player.y);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
