
let walkSpeed = 300;
let runSpeed = 600;
let enemySpeed = 50
let isJumping = true;
let jumpForce = 500;
const fallDeath = 2000;

layers(['obj', 'ui'], 'obj');


const map = [
  '                                                                                                                        ',
  '                                                                             $  $                                       ',
  '     @                                                                  * $ * %        |                                ',
  '                                                                                                                        ',
  '==                 $    #                                                                                               ',
  '=                                                                 =                                                     ',
  '=         %       = * = % =                                     =                                                       ',
  '=                                                              =                                                        ',
  '=       #   |                 -+                             =                                                          ',
  '=                             ()                           =                       "                        =           ',
  '=====   =========================  ========================                                                             ',
  '                                                                                        "     "        "                ',
  '                                   $                                                                                    ',
  '        ===                        #                                                                                    ',
  '   ===             !                   !                      ==========================                                ',
  '                   =====================                                                                                ',
  '=                                                                                                                       ',
  '=                                       ^ ^ ^ ^ ^ ^                                                                     ',
  '=============================================================                                                           ',
  '                                                                                                                        ',
  '                                                                                                              "         ',
  '        @                                     $  $  $  $  $                                                           # ',
  '                                                                                                     ^           =      ',
  '                                                                                                                 =      ',
  '                  &                                                  ^                                           =      ',
  '======================================================================================    ========================      ',
  '                                                                                                                        ',
  '                                                                                                           "            ',
  '                                                                                                                        ',
  '                                                                    ^                    | !                            ',
  '@   @   @   @                                                                                                           ',
  '                                                                    ========================                            ',
  '                                                                                                                        ',
  '                                                         %  %                                                           ',
  '                                                                                                                        ',
  '                                                                                                                        ',
  '                                                                                                                        ',
  '                                                            ^                                             *             ',
  '                                                                                                                        ',
  '                                                     = % = % = * * *                                                    ',
  '                                                                                                                        ',
  '    .                                                                                                     %             ',
  '           $ $ $ $ $ $ $ $ $ $ $ $ $ $ $ $ $ $ $                                                                        ',
  '           $ $ $ $ $ $ $ $ $ $ $ $ $ $ $ $ $ $ $                                           -+                           ',
  '=                                                                                          ()                           ',
  '======================================================================================    ====================          '
]

const levelCfg = {
  width: 20,
  height: 20,
  '=': [sprite('block'), solid(), 'solid'],
  '!': [sprite('block'), solid(), 'solid',  'sideBlock'],
  '$': [sprite('coin'), 'coin'],
  '%': [sprite('question'), 'coin-surprise', solid()],
  '*': [sprite('question'), 'mushroom-surprise', solid()],
  '}': [sprite('unboxed'), solid()],

  '(': [sprite('pipe-left'), solid(),'pipe', 'solid'],

  ')': [sprite('pipe-right'), solid(),'pipe', 'solid'],
  '-': [sprite('pipe-top-left-side'), 'pipe', solid()],
  '+': [sprite('pipe-top-right-side', 'pipe', solid())],
  '^': [sprite('evil-shroom'), 'dangerousL', scale(1.2), body()],
  '&': [sprite('evil-shroom'), 'dangerousR', scale(1.2), body()],
  '#': [sprite('dollar'), 'dollar'],
  '@': [sprite('dollar'), 'dollar', 'slippery'],
  '"': [sprite('dollar'), 'dollar', 'slidey'],
  '|': [sprite('coffee'), 'coffee'],
  '.': [sprite('Joes'), 'joes', scale(3.0)]


}
const gameLevel = addLevel(map, levelCfg)

const scoreLabel = add([
  text('0'),
  pos(30, 15),
  layer('ui'),
  {
    value: 0
  }
])

add([text('level ' + '0'), pos(30, 0)]);

function big() {
  let timer = 0;
  let isBig = false
  return {
    update() {
      //console.log(new Date().getTime());
      if (isBig) {
        timer -= dt()
        if (timer <= 0) {
          this.smallify()
        }
      }
    },
    isBig() {
      return isBig;
    },
    smallify() {
      walkSpeed = 300;
      jumpForce = 500;
      timer = 0;
      isBig = false;
    },
    biggify() {
      walkSpeed = runSpeed;
      jumpForce = 650;
      //console.log(walkSpeed);
      timer = 10;
      isBig = true;
    }
  }
}

const player = add([sprite('pete-face'), pos(45, 0), scale(0.2), body(), big(), origin('bot')]);
//console.log(player);


const evilShroom1 = add([sprite('evil-shroom'), pos(300, 0), body(), 'dangerousL'])
const evilShroom2 = add([sprite('evil-shroom'), pos(600, 200), body(), 'dangerousR'])



player.action(() => {
  camPos(player.pos);
  if (player.pos.y >= fallDeath) {
    go('lose', { score: scoreLabel.value })
  }
})

keyDown('left', () => {
  player.move(-walkSpeed, 0);
})

keyDown('right', () => {
  player.move(walkSpeed, 0);
})

player.action(() => {
  if (player.grounded()) {
    isJumping = false

  }
})

keyPress('space', () => {
  if (player.grounded())
    player.jump(jumpForce)
})



player.on('headbump', (obj) => {
  if (obj.is('coin-surprise')) {
    gameLevel.spawn('$', obj.gridPos.sub(0, 1.5))
    destroy(obj);
    gameLevel.spawn('}', obj.gridPos.sub(0, 0));
  }
  if (obj.is('mushroom-surprise')) {
    gameLevel.spawn('@', obj.gridPos.sub(0, 1.5))
    destroy(obj);
    gameLevel.spawn('}', obj.gridPos.sub(0, 0));
  }
})

action('slippery', (d) => {
  d.move((Math.floor(Math.random() * 200) + 1), 0)
})
action('slidey', (d) => {
  d.move(-(Math.floor(Math.random() * 200) + 1), 0)
})
//COLLISIONS
player.collides('coffee', (c) => {
  player.biggify(8);
  camShake(4)
  //player.update(); 
  destroy(c);
})

player.collides('joes', (j) => {
  if (scoreLabel.value > 1200) {
  go('win', { score: scoreLabel.value })
  }
  else {
    camShake(4);
  }
})

player.collides('coin', (c) => {
  scoreLabel.value = scoreLabel.value + 10;
  scoreLabel.text = scoreLabel.value;
  destroy(c);
})

player.collides('dollar', (d) => {
  scoreLabel.value = scoreLabel.value + 100;
  scoreLabel.text = scoreLabel.value;
  destroy(d);
})



action('dangerousL', (d) => {
  d.move(-enemySpeed, 0);
})

action('dangerousR', (d) => {
  d.move(enemySpeed, 0);
})


evilShroom1.collides('sideBlock', (shroom) => {
  console.log(enemySpeed);
  enemySpeed = enemySpeed*-1;
  console.log(enemySpeed);
})

evilShroom1.collides('pipe', () => {
  console.log(enemySpeed);
  enemySpeed = enemySpeed*-1;
  console.log(enemySpeed);
})

evilShroom2.collides('sideBlock', (shroom) => {
  console.log(enemySpeed);
  enemySpeed = enemySpeed*-1;
  console.log(enemySpeed);
})

evilShroom2.collides('pipe', () => {
  console.log(enemySpeed);
  enemySpeed = enemySpeed*-1;
  console.log(enemySpeed);
})

// evilShroom1.collides('solid', () => {
//   evilShroom1.move[x,y] = evilShroom1.move[-x,y]
// })

player.collides('dangerousL', (d) => {
  if (isJumping) {
    destroy(d)
  } else {
    go('lose', { score: scoreLabel.value })

  }
})
player.collides('dangerousR', (d) => {
  if (isJumping) {
    destroy(d)
  } else {
    go('lose', { score: scoreLabel.value })

  }
})
// 

// playter.collides('joes', () => {
//   keyPress('down', () => {
//     go('game', {
//       level: (level + 1)
//       score:
//     })
//   })
// })



function addButton(txt, p, f) {

	const bg = add([
		pos(p),
		rect(60, 30),
		origin("center"),
		color(1, 1, 1),
	]);

	add([
		text(txt, 8),
		pos(p),
		origin("center"),
		color(0, 0, 0),
	]);

	bg.action(() => {
		if (bg.isHovered()) {
			bg.color = rgb(0.8, 0.8, 0.8);
			if (mouseIsClicked()) {
				f();
			}
		} else {
			bg.color = rgb(1, 1, 1);
		}
	});

}

addButton("CLICK", vec2(-100, 100), () => {
	debug.log("Du must geld fuer Reparaturen sammeln.  Mindestens $1200. Bring es zu Joe.");
});

addButton("FOR", vec2(-100, 150), () => {
	debug.log("Kaffee trinken macht dich schneller und schlauer!");
});

addButton("TIPS", vec2(-100, 200), () => {
	debug.log("Roboter sind gefaehrlich!");
});
