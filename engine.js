var Engine = (function (global) {
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        patterns = {},
        lastTime;

    canvas.width = 707;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    function main() {
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;
        update(dt);
        render();
        lastTime = now;
        win.requestAnimationFrame(main);
    };

    function init() {
        bootbox.alert(openingMessage, function () {
            bootbox.alert(instructionMessage, function () {
                setupNewGame();
                lastTime = Date.now();
                main();
            })
        });
    }

    function update(dt) {
        updateEntities(dt);
        checkAllCollisions();
        collectItems();
        checkLevelCompletion();
    }

    function updateEntities(dt) {
        allEnemies.forEach(function (enemy) {
            enemy.update(dt);
        });
        allItems.forEach(function (item, i) {
            item.update(dt);
            if (item.destroyed) {
                allItems.splice(i, 1);
            }
        })
        allAttacks.forEach(function (attack, i) {
            attack.update(dt);
            if (attack.speed === 0) {
                allAttacks.splice(i, 1);
            }
        });
        player.update();
    }

    function checkLevelCompletion() {
        if (player.x === map.objects.end.x && player.y === map.objects.end.y) {
            levelFinishTime = Date.now();
            setupNewLevel();
        }
    }

    function render() {
        renderBackground();
        renderMap();
        renderEntities();
        renderLives();
        renderScore();
        renderHadouken();
    }

    function renderBackground() {
        ctx.drawImage(Resources.get('images/background.png'), 0, 0);
    }

    function renderMap() {
        map.tiles.forEach(function (tile) {
            tile.render();
        });
        map.objects.start.render();
        map.objects.end.render();
        map.objects.rocks.forEach(function (rock) {
            rock.render();
        });
    }

    function renderEntities() {
        allEnemies.forEach(function (enemy) {
            enemy.render();
        });
        allItems.forEach(function (item) {
            item.render();
        });
        allAttacks.forEach(function (attack) {
            attack.render();
        });
        player.render();
    }

    function renderLives() {
        var heartX = 0;
        var life = player.lives
        for (var i = 0; i < life; i++) {
            ctx.drawImage(Resources.get('images/Heart-small.png'), heartX, -10);
            heartX += 50;
        }
    }

    function renderScore() {
        ctx.font = "20px 'Press Start 2P'";
        if (gamestate.score > 10000) {
            ctx.fillText('SCORE: A LOT!', 400, 40);
        }
        else {
            ctx.fillText('SCORE: ' + gamestate.score, 400, 40);
        }
        
    }

    function renderHadouken() {
        if (gamestate.hadouken) {
            console.log('hadouken');
            ctx.font = "60px bold Arial";
            ctx.fillStyle = '#00a7ff';
            ctx.textAlign = 'center';
            ctx.fillText("HADOUKEN!!!", player.x + 40, player.y + 30);
        }
    }

    function checkAllCollisions() {
        allEnemies.forEach(function (enemy, i) {
            if (checkCollision(player, enemy)) {
                if (player.isInvincible || player.isUdacious) {
                    allEnemies.splice(i, 1);
                } else if (player.lives - 1 === 0) {
                    resetGame();
                } else {
                    resetLevel();
                }
            }
            allAttacks.forEach(function (attack) {
                if (checkCollision(enemy, attack)) {
                    allEnemies.splice(i, 1);
                }
            })
        })
        map.tiles.forEach(function (tile) {
            if (tile instanceof Water && player.x === tile.x && player.y === tile.y && !player.isUdacious) {
                if (player.lives - 1 === 0) {
                    resetGame();
                } else {
                    console.log('heyo');
                    resetLevel();
                }
            }
        })
    }

    function checkCollision(entity1, entity2) {
        if (inRange(entity1.right(), entity2.left(), entity2.right()) || inRange(entity1.left(), entity2.left(), entity2.right()) || (inRange(entity2.left(), entity1.left(), entity1.right())) || (inRange(entity2.right(), entity1.left(), entity1.right()))) {
            if (entity1.y === entity2.y) {
                return true;
            }
        }
        return false;
    }

    function reset() {
        player.startX().startY();
        allEnemies.forEach(function (enemy) {
            enemy.startX().startY().setSpeed();
            if (enemy instanceof Backtracker) {
                enemy.sprite = 'images/backtracker.png';
                if (gamestate.activeCheats.indexOf('cow') !== -1) {
                    enemy.sprite = 'images/Cow.png';
                }
            }
        })
    }

    function setupNewGame() {
        levelStartTime = Date.now();
        gamestate = new GameState();
        map = generateMap();
        allEnemies = createEnemies();
        player = new Player();
        allItems = createItems();
        allAttacks = [];
    }

    function setupNewLevel() {
        var secondsToFinish = Math.floor(levelFinishTime - levelStartTime) / 1000;
        gamestate.score += Math.floor(100 - secondsToFinish);
        levelStartTime = Date.now();
        gamestate.level += 1;
        if (gamestate.level > 25 === 0) {
            gamestate.speed += 0.05;
        }
        $("#level").html(gamestate.level);
        map = generateMap();
        player.startX().startY();
        allEnemies = createEnemies();
        allItems = createItems();
        allAttacks = [];
        if (!player.isUdacious) {
            player.hasKey = false;
        }
    }

    function resetGame() {
        var levelAchieved = gamestate.level;
        var pointsEarned = gamestate.score;
        gamestate = new GameState();
        map = generateMap();
        player = new Player();
        player.x = -100;
        player.y = -100;
        gamestate.paused = true;
        bootbox.alert(gameOverMessage, function() {
            player.startX().startY();
            allEnemies = createEnemies();
            allItems = createItems();
            $("#level").html(gamestate.level);
            gamestate.paused = false;
        });
        $('#finalLevel').html(levelAchieved);
        $('#score').html(pointsEarned);
    }

    function resetLevel() {
        console.log('resetting');
        player.lives -= 1;
        pauseAlert(deathMessage);
        reset();
    }

    function collectItems() {
        allItems.forEach(function (item, i) {
            if (player.x === item.x && player.y === item.y) {
                if (item instanceof Key) {
                    player.hasKey = true;
                } else if (item instanceof Heart) {
                    player.lives++;
                } else if (item instanceof Gem) {
                    gamestate.score += 50;
                }
                allItems.splice(i, 1);
            }
        })
    }

    function generateMap() {
        var map = {
            'tiles': [],
            'objects': {
                'start': null,
                'end': null,
                'rocks': []
            }
        };
        var mapStart = (Math.floor(Math.random() * 4) + 1) * X_STEP;
        var mapEnd = (Math.floor(Math.random() * 4) + 1) * X_STEP;
        for (var j = 0; j < Y_BOTTOM; j += Y_STEP) {
            for (var i = 0; i < X_RIGHT; i += X_STEP) {
                if (j === 0) {
                    if (i === mapEnd) {
                        map.tiles.push(new Stone(i, j));
                    } else {
                        map.tiles.push(new Water(i, j));
                    }
                } else if (j === Y_STEP || j === 4 * Y_STEP) {
                    map.tiles.push(new Grass(i, j));
                } else if (j === 2 * Y_STEP || j === 3 * Y_STEP) {
                    map.tiles.push(new Stone(i, j));
                } else if (j === 5 * Y_STEP) {
                    if (i === mapStart) {
                        map.tiles.push(new Stone(i, j));
                    } else {
                        map.tiles.push(new Water(i, j));
                    }
                }

            }
        }
        map.objects.start = new StartPoint(mapStart, 5 * Y_STEP);
        map.objects.end = new Door(mapEnd, Y_TOP);
        //map.objects.rocks.push(new Rock(mapEnd, Y_TOP + Y_STEP));
        return map;
    }

    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function createEnemies() {
        var enemies = [];
        var enemyOptions = ['enemy', 'charger', 'backtracker', 'sidestepper', 'slowpoke', 'centipede'];
        var enemyWeights;
        if (gamestate.level <= 3) {
            enemyWeights = [1, 0, 0, 0, 0, 0];
        } else if (gamestate.level <= 10) {
            enemyWeights = [0.7, 0.1, 0.1, 0, 0.1, 0];
        } else if (gamestate.level <= 15) {
            enemyWeights = [0.5, 0.15, 0.15, 0.1, 0.1, 0];
        } else if (gamestate.level <= 20) {
            enemyWeights = [0.3, 0.2, 0.2, 0.1, 0.1, 0.1];
        } else if (gamestate.level <= 25) {
            enemyWeights = [0.1, 0.2, 0.2, 0.1, 0.3, 0.1];
        } else {
            enemyWeights = [0, 0.2, 0.2, 0.2, 0.2, 0.2];
        }

        var weightedEnemyList = generateWeighedList(enemyOptions, enemyWeights);

        var newEnemy;
        var newSelection;
        var enemyCount = 2 + Math.floor(gamestate.level / 5);
        if (gamestate.level > 25) {
            enemyCount = 8;
        }
        for (var i = 0; i < enemyCount; i++) {
            newSelection = weightedEnemyList[Math.floor(Math.random() * (weightedEnemyList.length))];
            if (newSelection === 'enemy') {
                newEnemy = new Enemy();
            } else if (newSelection === 'charger') {
                newEnemy = new Charger();
            } else if (newSelection === 'backtracker') {
                newEnemy = new Backtracker();
            } else if (newSelection === 'sidestepper') {
                newEnemy = new Sidestepper();
            } else if (newSelection === 'slowpoke') {
                newEnemy = new Slowpoke();
            } else {
                newEnemy = new Centipede();
            }
            enemies.push(newEnemy);
        }
        return enemies;
    }

    function createItems() {
        var items = [];
        var xCoords = [0, 1, 2, 3, 4, 5, 6];
        var yCoords = [1, 2, 3, 4];
        var keyX = Math.floor(Math.random() * xCoords.length);
        var keyY = Math.floor(Math.random() * yCoords.length);
        var x = xCoords[keyX] * X_STEP;
        var y = yCoords[keyY] * Y_STEP;

        var key = new Key(x, y);
        items.push(key);
        xCoords.splice(keyX, 1);
        yCoords.splice(keyY, 1);

        var gemX = Math.floor(Math.random() * xCoords.length);
        var gemY = Math.floor(Math.random() * yCoords.length);
        var gem = new Gem(xCoords[gemX] * X_STEP, yCoords[gemY] * Y_STEP);
        items.push(gem);
        xCoords.splice(gemX, 1);
        yCoords.splice(gemY, 1);


        if (gamestate.level % 5 === 0) {
            if (Math.random() > 0.5) {
                var heartX = Math.floor(Math.random() * xCoords.length);
                var heartY = Math.floor(Math.random() * yCoords.length);
                var heart = new Heart(xCoords[heartX] * X_STEP, yCoords[heartY] * Y_STEP);
                items.push(heart);
            }
        }
        return items;
    }

    Resources.load([
        'images/stone-block.png',
        'images/dark-stone-block.png',
        'images/water-block.png',
        'images/lava-block.png',
        'images/grass-block.png',
        'images/dead-grass-block.png',
        'images/frozen-grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/Heart.png',
        'images/Cow.png',
        'images/Cow-reverse.png',
        'images/Cow-centipede.png',
        'images/charger.png',
        'images/charger-charging.png',
        'images/sidestepper.png',
        'images/backtracker.png',
        'images/backtracker-reverse.png',
        'images/slowpoke.png',
        'images/centipede.png',
        'images/Heart.png',
        'images/Heart-small.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png',
        'images/background.png',
        'images/Rock.png',
        'images/Key.png',
        'images/Door.png',
        'images/char-boy-blink1.png',
        'images/char-boy-blink2.png',
        'images/char-boy-blink3.png',
        'images/Hadouken-right.png',
        'images/Hadouken-left.png',
        'images/Selector.png',
        'images/nothing.png',
        'images/Udacity.png',
        'images/html.png',
        'images/css.png',
        'images/js.png'
    ]);
    Resources.onReady(init);

    global.ctx = ctx;
})(this);