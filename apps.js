///////////////////// LEVELS

let levels = [
//level one
  {
    startX: 124,
    startY: 408,
    blocks: [
      {
        x: 0,
        y: 470,
        startX: 0,
        startY: 470,
        width: 800,
        height: 30,
        color: "green",
        sprite: blockPlaceHolder,
        onCollision: normalBlock,
      },
      {
        x: -400,
        y: 0,
        startX: -400,
        startY: 0,
        width: 1800,
        height: 66,
        color: "black",
        sprite: blockPlaceHolder,
        onCollision: normalBlock,
      },
      {
        x: 950,
        y: 400,
        startX: 950,
        startY: 400,
        width: 300,
        height: 46,
        color: "green",
        sprite: blockPlaceHolder,
        onCollision: normalBlock,
      },
      {
        x: 1370,
        y: 290,
        startX: 1370,
        startY: 290,
        width: 300,
        height: 46,
        color: "green",
        sprite: blockPlaceHolder,
        onCollision: normalBlock,
      },
      {
        x: 1720,
        y: 235,
        startX: 1720,
        startY: 235,
        width: 300,
        height: 46,
        color: "green",
        sprite: blockPlaceHolder,
        onCollision: normalBlock,
      },
      {
        x: 2120,
        y: 435,
        startX: 2120,
        startY: 435,
        width: 46,
        height: 46,
        color: "green",
        sprite: blockPlaceHolder,
        onCollision: teleporter,
        deltaX: -1850,
        deltaY: -300,
      },
    ],
  },
]

///////////////////// OBJECTS

let user = {
  x: null,
  y: null,
  width: 28,
  height: 62,
  facing: 1,
  speed: 0,
  speedCap: 10,
  speedCounter: 0,
  isJumping: false,
  jumpSpeed: 0,
  baseJumpSpeed: 20,
  jumpStart: null,
  jumpHeight: 166,
  hangTime: 10,
  hangCounter: 0,
  offGround: false,
  isCrouching: false,
  sprite: null,
};

///////////////////// ELEMENTS

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

///////////////////// VARIABLES

let currentLevel = 0;
let mobile = [user];
let onScreenThings = [];
let tickCount = 0;
let gforce = 6;
let leftScrollMargin = 120;
let rightScrollMargin = 284;

//////Sprite Animation Counters

let sprUserWalkingFrame = 1;

///////////////////// EVENT LISTENERS

canvas.onclick = runTicks;
// document.getElementsByClassName("inactive").onclick = startGame;
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

///////////////////// ENGINE

function runTicks() {
  if (canvas.className === "inactive") {
    user.x = levels[currentLevel].startX;
    user.y = levels[currentLevel].startY;
    canvas.className = "active";
    window.requestAnimationFrame(perTick);
  };
};

function perTick() {
  tickCount = (tickCount >= 100000000) ? 0 : tickCount + 1;
  resetAttributes();
  adjustCamera();
  loadEntities();
  move();
  mobile.forEach((d) => {
    collision(d);
  });
  gravity();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateSprites();
  drawThings();
  window.requestAnimationFrame(perTick);
};

function resetAttributes() {
  mobile.forEach((c) => {
    c.offGround = true
  });
}

function adjustCamera() {
  if (user.x >= rightScrollMargin || user.x <= leftScrollMargin) {
    add = (user.speed === 0 && user.x >= rightScrollMargin) ? -user.speedCap : (user.speed === 0 && user.x <= leftScrollMargin) ? user.speedCap : -user.speed;
    user.x += add;
    levels[currentLevel].blocks.forEach((block) => {
      block.x += add;
    });
  }
}

function loadEntities() {
  onScreenThings = mobile.concat();

  levels[currentLevel].blocks.forEach((block) => {
    if (block.x + block.width > 0 && block.x < canvas.width) {
      onScreenThings.push(block);
    }
  });
};

function collision(e) {
  onScreenThings.forEach((thing) => {
    if (e.x < thing.x + thing.width &&           ///
        e.x + e.width > thing.x &&               ///
        e.y < thing.y + thing.height &&          ///https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection November 4 2019
        e.y + e.height > thing.y - 1 &&          /// -1 added to fix a gravity/collision detection bug
        thing != user) {
      thing.onCollision(e);
    }
  });
}

function move() {
  mobile.forEach((c) => {
    c.x += c.speed;

    if (c.isJumping) {
      c.y -= c.jumpSpeed
      if (c.jumpSpeed === 0) {
        c.hangCounter++
      }

      if (c.hangTime === c.hangCounter) {
        c.isJumping = false;
        c.hangCounter === 0;
      }

      if (c.y <= c.jumpStart - c.jumpHeight) {
        c.jumpSpeed = 0;
      }
    };
  });
};

function gravity() {
  mobile.forEach((c) => {
    if (c.offGround && !c.isJumping && c.x >= 0 && c.x <= canvas.width) {
      c.y += gforce;
    }
  });
};

function userDeath() {
  console.log("dead");
}

function drawThings() {
  onScreenThings.forEach((thing) => {
    thing.sprite()
  });

}

function keyDown(a) {
  if (canvas.className === "active") {
    switch (a.code) {
      case "KeyD":
        user.speed = user.speedCap
        user.facing = 1;
        break;

      case "KeyA":
        user.speed = -user.speedCap;
        user.facing = -1;
        break;

      case "KeyW":
        break;

      case "KeyS":
        user.isCrouching = true;
        break;

      case "Space":
        if (!user.isJumping && !user.offGround){
          user.jumpStart = user.y;
          user.isJumping = true;
          user.jumpSpeed = user.baseJumpSpeed;
          user.hangCounter = 0;
        };
        break;
    }
  }
};

function keyUp(b) {
  switch (b.code) {
    case "KeyD":
      user.speed = 0;
      user.speedCounter = 1;
      break;
    case "KeyA":
        user.speed = 0;
      break;
    case "KeyW":
      break;
    case "KeyS":
      user.isCrouching = false;
      break;
    case "Space":
      user.jumpSpeed = 0;
      break;
  }
}

///////////////////// COLLISION

function normalBlock(e) {
  /////// underneath /this/
  if (e.y <= this.y + this.height && e.y >= this.y + this.height - e.jumpSpeed) {
    e.isJumping = false;
    e.y -= this.y + this.height + 3;
  } else if (e.y + e.height >= this.y && e.y + e.height <= this.y + gforce) { /////// above /this/
    e.y = this.y - e.height;
    if (e.offGround) {
      e.offGround = false;
    }
  } else/* if (!user.isJumping && user.speed === 0)*/ {
    e.x -= e.speed;
  }
}

function teleporter(e) {
  /////// underneath /this/
  if (e.y <= this.y + this.height && e.y >= this.y + this.height - e.jumpSpeed) {
    e.isJumping = false;
    e.y = this.y + this.height + 1;
  } else if (e.y + e.height >= this.y && e.y + e.height <= this.y + gforce) { /////// above /this/
      e.x += this.deltaX
      e.y += this.deltaY
  } else {
    e.x -= e.speed;
  }
}

///////////////////// SPRITES

function updateSprites() {
  user.sprite = (user.speed !== 0) ? sprUserWalking : sprUserStanding;
}

function sprUserStanding() {
  ctx.beginPath();
  ctx.rect(user.x, user.y, user.width, user.height);
  ctx.fillStyle = "black";
  ctx.fill()
  ctx.closePath();
  if (user.facing === -1) {
    ctx.beginPath();
    ctx.rect(user.x, user.y, user.width /4, user.height);
    ctx.fillStyle = "gray";
    ctx.fill()
    ctx.closePath();
  } else {
    ctx.beginPath();
    ctx.rect(user.x + user.width, user.y, -1 * user.width /4, user.height);
    ctx.fillStyle = "gray";
    ctx.fill()
    ctx.closePath();
  }
}

function sprUserWalking() {

  if (tickCount % 200 === 0) {
    sprUserWalkingFrame = (sprUserWalkingFrame === 1) ? 2 : 1
  }

  if (sprUserWalkingFrame === 1) {
    ctx.beginPath();
    ctx.rect(user.x, user.y, user.width, user.height);
    ctx.fillStyle = "red";
    ctx.fill()
    ctx.closePath();
    if (user.facing === -1) {
      ctx.beginPath();
      ctx.rect(user.x, user.y, user.width /4, user.height);
      ctx.fillStyle = "blue";
      ctx.fill()
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.rect(user.x + user.width, user.y, -1 * user.width /4, user.height);
      ctx.fillStyle = "blue";
      ctx.fill()
      ctx.closePath();
    }
  } else {
    ctx.beginPath();
    ctx.rect(user.x, user.y, user.width, user.height);
    ctx.fillStyle = "blue";
    ctx.fill()
    ctx.closePath();
    if (user.facing -1) {
      ctx.beginPath();
      ctx.rect(user.x, user.y, user.width /4, user.height);
      ctx.fillStyle = "red";
      ctx.fill()
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.rect(user.x + user.width, user.y, -1 * user.width /4, user.height);
      ctx.fillStyle = "red";
      ctx.fill()
      ctx.closePath();
    }
  }
}

function sprEnemyOne() {
  ctx.beginPath();
  ctx.rect(user.x, user.y, 25, 30);
  ctx.fillStyle = "blue";
  ctx.fill()
  ctx.closePath();
}

function blockPlaceHolder() {
  ctx.beginPath();
  ctx.rect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = this.color;
  ctx.fill()
  ctx.closePath();
}

function bluePellet() {
  ctx.beginPath();
  ctx.rect(this.x, this.y, 6, 2);
  ctx.fillStyle = "blue";
  ctx.fill()
  ctx.closePath();
}

///////////////////// AIs
