const canvas = document.getElementById('golden-canvas');
const ctx = canvas.getContext('2d');

// vertices:
// {
//   x:
//   y:
//   right: { index, angle }   pointing to right neighbour; alpha is angle from 0-9 (i.e., in increments of 36˚)
//   left:  {   "      "   }                left
//                             The counterclockwise arc from right to left is taken by one or more triangles; the rest, if any, is available.
// }

const PI = Math.PI;
const PHI = (1 + Math.sqrt(5)) / 2;
const THIRTY_SIX_DEGREES = PI / 5;

const initialSize = 100;
let availableVertices = new Set([0, 1, 2]);
let vertices = [
  {
    index: 0,
    x: 300 - initialSize,
    y: 300 + initialSize,
    right: {
      index: 1,
      angle: 0,
    },
    left: {
      index: 2,
      angle: 2,
    },
  },
  {
    index: 1,
    x: 300 + initialSize,
    y: 300 + initialSize,
    right: {
      index: 2,
      angle: 3,
    },
    left: {
      index: 0,
      angle: 5,
    },
  },
  {
    index: 2,
    x: 300,
    y: 300 + initialSize - initialSize * Math.tan(2 * THIRTY_SIX_DEGREES),
    right: {
      index: 0,
      angle: 7,
    },
    left: {
      index: 1,
      angle: 8,
    },
  },
];

let triangles = [
  {
    vertices: [0, 1, 2],
    strokeColour: [200, 90, 30], 
    fillColour: [200, 140, 50],
  }
];

function draw() {
  for (let triangle of triangles) {
    drawTriangle(triangle);
  }
}

function drawTriangle(triangle) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgb(${triangle.strokeColour.join(',')})`;
  ctx.moveTo(vertices[triangle.vertices[0]].x, vertices[triangle.vertices[0]].y);
  ctx.lineTo(vertices[triangle.vertices[1]].x, vertices[triangle.vertices[1]].y);
  ctx.lineTo(vertices[triangle.vertices[2]].x, vertices[triangle.vertices[2]].y);
  ctx.lineTo(vertices[triangle.vertices[0]].x, vertices[triangle.vertices[0]].y);
  ctx.closePath();
  ctx.fillStyle = `rgb(${triangle.fillColour.join(',')})`;
  ctx.stroke();
  ctx.fill();
}

function addTriangle() {
  let u = chooseVertex();
  let v = vertices[u.left.index];
  let w = createThirdVertex(u, v);

  // console.log(`choosing ${u.index} (${maxAvailableAngle(u)}) and ${v.index} (${maxAvailableAngle(v)})`)

  triangles.push({
    vertices: [u.index, v.index, w.index],
    strokeColour: [200, 90, 30], 
    fillColour: [200 + Math.random() * 50, 140 + Math.random() * 50, 50 + Math.random() * 50],
  })
}

function chooseVertex() {
  let r = Math.floor(Math.random() * availableVertices.size);
  return vertices[Array.from(availableVertices)[r]];
}

function createThirdVertex(u, v) {
  let uwAngle = (u.left.angle + 1) % 10;
  let uwLength = dist(u, v) / PHI;
  let vwAngle = (v.right.angle + 9) % 10;
  let w = {
    index: vertices.length,
    x: u.x + uwLength * Math.cos(uwAngle * THIRTY_SIX_DEGREES),
    y: u.y + uwLength * -Math.sin(uwAngle * THIRTY_SIX_DEGREES),
    right: {
      index: u.index,
      angle: reverseAngle(uwAngle),
    },
    left: {
      index: v.index,
      angle: reverseAngle(vwAngle),
    },
  }

  vertices.push(w);
  availableVertices.add(w.index);

  u.left = {
    index: w.index,
    angle: uwAngle,
  }
  if (maxAvailableAngle(u) === 0) {
    availableVertices.delete(u.index);
  }
  v.right = {
    index: w.index,
    angle: vwAngle,
  }
  if (maxAvailableAngle(v) === 0) {
    availableVertices.delete(v.index);
  }

  return w;
}

// See how much space is available (in increments of 36˚); if max angle is 1, then we must choose a thin triangle.
function maxAvailableAngle(u) {
  return (u.right.angle - u.left.angle + 10) % 10;
}

function dist(u, v) {
  return Math.sqrt((u.x - v.x)**2 + (u.y - v.y)**2);
}

// Flip angle n, where n is in units of 36˚
function reverseAngle(n) {
  return (n + 5) % 10;
}

function main() {
  draw();
  addTriangle();
  setTimeout(() => main(), 10);
}

main();

// ctx.fillRect(10, 10, 55, 50);