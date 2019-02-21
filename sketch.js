let canvas = document.createElement("canvas");
document.body.appendChild(canvas);
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 19;
canvas.height = window.innerHeight - 19;
const width = canvas.width;
const height = canvas.height;
const FPS = 60;

// var loadJSON = function(path_config_json, callback){

//   /* load json config */
//   var xhr = new XMLHttpRequest();
//   xhr.open('GET', path_config_json);
//   xhr.onreadystatechange = function (data) {
//     if (xhr.readyState == 4){
//       if (xhr.status == 200){
//         settings = JSON.parse(data.currentTarget.response);
//         if (callback) {
//           callback();
//         }
//       }
//     }
//   };
//   xhr.send();
// };

// loadJSON('particleSettings.json', function() {
//   console.log("File loaded succesfully");
// });

function Vector(x, y) {
  this.x = x;
  this.y = y;
  this.magnitude = Math.sqrt(this.x * this.x + this.y * this.y);

  this.add = function(u) {
    this.x += u.x;
    this.y += u.y;
  };
  this.mult = function(u) {
    this.x *= u;
    this.y *= u;
  };
  this.div = function(u) {
    this.x /= u;
    this.y /= u;
  };
  this.mag = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };
  this.magSquare = function() {
    return this.x * this.x + this.y * this.y;
  };
  this.normalize = function() {
    let m = this.mag();
    if (m != 0 && m != 1) {
      this.div(m);
    }
  };
  this.limit = function(max) {
    if (this.magSquare() > max * max) {
      this.normalize();
      this.mult(max);
    }
  };
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

function mapValue(value, start1, stop1, start2, stop2) {
  let outgoing =
    start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));

  return outgoing;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

var particles = [];

var settings = {
  fps: 60,
  number_per_frame: 0,
  size: 0,
  speed: 0,
  lifespan: 0,
  spawn_box: {
    x: width / 2,
    y: height - 200,
    w: 1,
    h: 1
  },
  vel: {
    x: 0,
    y: 0
  },
  acc: {
    x: {
      min: 0,
      max: 0
    },
    y: {
      min: 0,
      max: 0
    }
  },
  color: {
    r: 0,
    g: 0,
    b: 0,
    a: 0,
    get rgb() {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    },
    get rgba() {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
  },
  modifiers: {
    alpha: true
  }
};

var gui = new dat.GUI();

gui.add(settings, "fps", 5, 120);
gui.add(settings, "number_per_frame", 0, 100);
gui.add(settings, "size", 0, 30);
gui.add(settings, "speed", 0, 100);
gui.add(settings, "lifespan", 0, 100);

var spawn_box_folder = gui.addFolder("SpawnBox");
spawn_box_folder.add(settings.spawn_box, "x", 0, width);
spawn_box_folder.add(settings.spawn_box, "y", 0, height);
spawn_box_folder.add(settings.spawn_box, "w", 0, width);
spawn_box_folder.add(settings.spawn_box, "h", 0, height);

var acc_folder = gui.addFolder("Acceleration");
acc_folder.add(settings.acc.x, "min", -100, 100);
acc_folder.add(settings.acc.x, "max", -100, 100);
acc_folder.add(settings.acc.y, "min", -100, 100);
acc_folder.add(settings.acc.y, "max", -100, 100);

var vel_folder = gui.addFolder("Velocity");
vel_folder.add(settings.vel, "x", -100, 100);
vel_folder.add(settings.vel, "y", -100, 100);

var color_folder = gui.addFolder("Color");
color_folder.add(settings.color, "r", 0, 255);
color_folder.add(settings.color, "g", 0, 255);
color_folder.add(settings.color, "b", 0, 255);

function Particle(options) {
  this.options = options;

  this.pos = new Vector(
    random(
      this.options.spawn_box.x,
      this.options.spawn_box.x + this.options.spawn_box.w
    ),
    random(
      this.options.spawn_box.y,
      this.options.spawn_box.y + this.options.spawn_box.h
    )
  );
  this.acc = new Vector(
    random(this.options.acc.x.min, this.options.acc.x.max),
    random(this.options.acc.y.min, this.options.acc.y.max)
  );

  this.vel = new Vector(this.options.vel.x, this.options.vel.y);
  this.speed = this.options.speed * random(1, 1.2);
  this.lifespan = this.options.lifespan;
  this.color = this.options.color;
  this.size = this.options.size;

  this.modifiers = this.options.modifiers;

  this.render = function() {
    ctx.fillStyle = this.color.rgba;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);

    //ctx.fillRect(this.pos.x, this.pos.y, this.size, this.size);
    ctx.fill();
    ctx.closePath();
  };

  this.update = function() {
    this.lifespan -= 1;

    if (this.modifiers.alpha) {
      this.color.a = mapValue(this.lifespan, 0, this.options.lifespan, 0, 0.5);
    }

    this.vel.add(this.acc);
    this.vel.limit(this.speed);
    this.pos.add(this.vel);
  };

  this.dead = function() {
    if (this.lifespan <= 0) {
      return true;
    } else {
      return false;
    }
  };
}

var process = function() {
  //setTimeout(function() {
  requestAnimationFrame(process);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < settings.number_per_frame; i++) {
    let p = new Particle(settings);
    particles.push(p);
  }

  for (let i = particles.length - 1; i > 0; i--) {
    particles[i].update();
    particles[i].render();

    if (particles[i].dead()) {
      particles.splice(i, 1);
    }
  }
  //}, 1000 / FPS);
};

window.addEventListener(
  "load",
  function() {
    process();
  },
  false
);