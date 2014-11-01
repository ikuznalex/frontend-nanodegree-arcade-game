var Engine = (function (global) {
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        patterns = {},
        lastTime;

    canvas.width = X_CANVAS;
    canvas.height = Y_CANVAS;
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
        allItems.forEach(function (item) {
            item.update(dt);
            if (item.destroyed) {
                removeElement(item, allItems);
            }
        })
        allAttacks.forEach(function (attack) {
            attack.update(dt);
            if (attack.speed === 0) {
                removeElement(attack, allAttacks);
            }
        });
        player.update();
    }

    function checkLevelCompletion() {
        if (player.x === map.end.x && player.y === map.end.y) {
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
        if (gamestate.level < 0) {
            invertCanvas();
        }
    }

    function renderBackground() {
        ctx.fillStyle = 'white';
        ctx.fillRect(-20, -20, 1000, 1000);
    }

    function renderMap() {
        map.tiles.forEach(function (tile) {
            tile.render();
        });
        map.start.render();
        map.end.render();
        map.rocks.forEach(function (rock) {
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
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        if (gamestate.score > 10000) {
            ctx.fillText('SCORE: A LOT!', 400, 40);
        } else if (gamestate.level < 0) {
            ctx.fillText('SCORE: -' + gamestate.score, 400, 40);
        } else {
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

    function invertCanvas() {
        var imgData = ctx.getImageData(0, 0, X_CANVAS, Y_CANVAS);
        for (var i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = 255 - imgData.data[i];
            imgData.data[i + 1] = 255 - imgData.data[i + 1];
            imgData.data[i + 2] = 255 - imgData.data[i + 2];
            imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    function checkAllCollisions() {
        allEnemies.forEach(function (enemy) {
            if (checkCollision(player, enemy)) {
                if (player.isInvincible || player.isUdacious) {
                    removeElement(enemy, allEnemies);
                } else if (player.lives - 1 === 0) {
                    resetGame();
                } else {
                    resetLevel();
                }
            }
            allAttacks.forEach(function (attack) {
                if (checkCollision(enemy, attack)) {
                    removeElement(enemy, allEnemies);
                }
            })
        })
        map.tiles.forEach(function (tile) {
            if (tile instanceof Water && player.x === tile.x &&
                player.y === tile.y && !player.isUdacious) {
                if (player.lives - 1 === 0) {
                    resetGame();
                } else {
                    resetLevel();
                }
            }
        })
    }

    function checkCollision(entity1, entity2) {
        if (inRange(entity1.right(), entity2.left(), entity2.right()) ||
            inRange(entity1.left(), entity2.left(), entity2.right())) {
            if (inRange(entity1.top(), entity2.top(), entity2.bottom()) ||
                inRange(entity1.bottom(), entity2.top(), entity2.bottom())) {
                return true;
            }
        }
        return false;
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
        var secsToFinish = Math.floor(levelFinishTime - levelStartTime) / 1000;
        gamestate.score += Math.floor(100 - 4 * secsToFinish);
        levelStartTime = Date.now();
        if (!gamestate.activeCheats.time) {
            gamestate.level += 1;
            $("#level").html(gamestate.level);
        } else {
            gamestate.level -= 1;
            $("#level").html('?');
        }
        if (gamestate.level > 25 && gamestate.speed < 2.5) {
            gamestate.speed += 0.05;
        }
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
        $('#title').html('Frogger (Clone): The Buggening!');
        var levelAchieved = gamestate.level;
        var pointsEarned = gamestate.score;
        gamestate = new GameState();
        map = generateMap();
        player = new Player();
        player.x = -100;
        player.y = -100;
        gamestate.paused = true;
        bootbox.alert(gameOverMessage, function () {
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
        player.lives -= 1;
        pauseAlert(deathMessage);
        player.startX().startY();
        allEnemies.forEach(function (enemy) {
            enemy.startX().startY().setSpeed();
            if (enemy instanceof Backtracker) {
                enemy.sprite = 'images/backtracker.png';
                if (gamestate.activeCheats.cow) {
                    enemy.sprite = 'images/Cow.png';
                }
            }
        });
    }

    function collectItems() {
        allItems.forEach(function (item) {
            if (player.x === item.x && player.y === item.y) {
                if (item instanceof Key) {
                    player.hasKey = true;
                } else if (item instanceof Heart &&
                    player.lives < player.maxLives) {
                    player.lives++;
                } else if (item instanceof Gem) {
                    gamestate.score += 50;
                }
                removeElement(item, allItems);
            }
        });
    }

    function generateMap() {
        var map = {
            'tiles': [],
            'start': null,
            'end': null,
            'rocks': []
        };
        var mapStart = randInt(1, 4) * X_STEP;
        var mapEnd = randInt(1, 4) * X_STEP;
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
        map.start = new StartPoint(mapStart, 5 * Y_STEP);
        map.end = new Door(mapEnd, Y_TOP);
        if (gamestate.level > 15) {
            var rockNumber = randInt(1, 3);
            var allRockCoords = [];
            map.tiles.forEach(function (tile) {
                if ((!(tile instanceof Water)) && tile.x !== map.start.x &&
                    tile.x !== map.end.x) {
                    allRockCoords.push([tile.x, tile.y]);
                }
            });
            for (var i = 0; i < rockNumber; i++) {
                var rockCoords = choice(allRockCoords);
                map.rocks.push(new Rock(rockCoords[0], rockCoords[1]));
                removeElement(rockCoords, allRockCoords);
            }
        }
        return map;
    }

    function createEnemies() {
        var enemies = [];
        var enemyObject = calcEnemyWeights();
        var enemyNames = Object.keys(enemyObject);
        var enemyWeights = [];
        enemyNames.forEach(function (enemy) {
            enemyWeights.push(enemyObject[enemy]);
        });

        var weightedEnemyList = generateWeighedList(enemyNames, enemyWeights);

        var newEnemy;
        var newSelection;
        var enemyCount = 2 + Math.abs(Math.floor(gamestate.level / 5));
        if (gamestate.level > 25) {
            enemyCount = 8;
        }
        for (var i = 0; i < enemyCount; i++) {
            newSelection = choice(weightedEnemyList);
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

    function calcEnemyWeights() {
        var enemyWeights = {
            'enemy': 1,
            'charger': 0,
            'backtracker': 0,
            'sidestepper': 0,
            'slowpoke': 0,
            'centipede': 0
        };
        if (gamestate.level > 5) {
            for (var i = 0; i < gamestate.level - 2; i++) {
                if (enemyWeights.enemy > 0) {
                    enemyWeights.enemy -= 0.05;
                    enemyWeights.charger += 0.01;
                    enemyWeights.backtracker += 0.01;
                    enemyWeights.sidestepper += 0.01;
                    enemyWeights.slowpoke += 0.01;
                    enemyWeights.centipede += 0.01;
                }
            }
        }
        return enemyWeights;
    }

    function createItems() {
        var items = [];
        var itemCoords = [];
        var onRock;
        map.tiles.forEach(function (tile) {
            onRock = false;
            if ((!(tile instanceof Water)) && (tile.x !== map.start.x ||
                tile.y !== map.start.y) && (tile.x !== map.end.x || 
                                            tile.y !== map.end.y)) {
                map.rocks.forEach(function (rock) {
                    if (tile.x === rock.x && tile.y === rock.y) {
                        onRock = true;
                    }
                });
                if (!onRock) {
                    itemCoords.push([tile.x, tile.y]);
                }
            }
        });
        var keyCoords = choice(itemCoords);
        removeElement(keyCoords, itemCoords);
        var key = new Key(keyCoords[0], keyCoords[1]);
        items.push(key);

        var gemCoords = choice(itemCoords);
        removeElement(gemCoords, itemCoords);
        var gem = new Gem(gemCoords[0], gemCoords[1]);;
        items.push(gem);

        if (gamestate.level % 5 === 0) {
            if (Math.random() > 0.5) {
                var heartCoords = choice(itemCoords);
                removeElement(heartCoords, itemCoords);
                var heart = new Heart(heartCoords[0], heartCoords[1]);
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