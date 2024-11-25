// To do:
  // make radius and mass of circles adjustable


let WIDTH = 900;
let HEIGHT = 490;
let gravity = 8; //8, 35
let radius = 8;
let friction = 0.9;
let subStep = 10; //10, 4
let minCellSize = WIDTH;
let numBalls = 0;
let maxSpeed;
let currColor;
let currLineColor;
let lastSubStep = false;
let currStrokeWeight = 0;
let damping;
let k;


let mouseDown = false;
let ballSelected = false;
let generatingNewPoint = false;
let pause = false;
let pauseSelect = false;
let viewSH = false;
let rigidConstraints = false;
let softConstraints = true;
let fixedPoint = false;
let rope = false;
let connectingToBall = false;
let applyGravity = true;
let connectSelecting = false;
let takeOutSelecting = false;
let ropeStillGoing = false;
let circleDrawing = false;
let circleEnding = false;
let kSliderChosen = false;
let dampingSliderChosen = false;
let area = false;
let drag = true;
let selecting = false;
let buttonJustClicked = false;
let buttonPressed = false;
let ropeDrawing = false;
let validCircle = false;


let wheelNodeNum = 15;
let widthX = 0;
let heightY = 0;
let newPointX = 0, newPointY = 0;
let newLineDist = 0;
let selectX = 0, selectY = 0
let maxBallConnections = 20;
let ropeX = 0, ropeY = 0;
let connectingBallID = 0;
let connectingRopeID = 0;
let selectedCircleX = 0, selectedCircleY = 0;
let circleLength = 0;
let selectedBall = -1;
let kSliderVal;
let dampingSliderVal;
let rectX, rectY, rectWidth, rectHeight;


let pauseButton;
let clearButton;
let fixedPointButton;
let gravityButton;
let viewSHButton;
let rigidButton;
let softButton;


let selectedBalls = [];
let ropeList = [];


let balls;
let lines = new Map();
let spatialHash;
let dt_prev = 0.1


function setup() {
  balls = [];
  
  currColor = color(0, 255, 0);
  currLineColor = color(0, 0, 0);
  
  createCanvas(WIDTH, HEIGHT);
  
  minCellSize = radius * 2;
  
  fill(0, 255, 0);
  
  
  for (let ball of balls) {
    ball.maxSearchDist = ball.radius / (minCellSize / 1.5);
    if (ball.maxSearchDist != int(ball.maxSearchDist)) {
      ball.maxSearchDist++;
    }
    ball.maxSearchDist = int(ball.maxSearchDist);
  }
  spatialHash = new SpatialHash2D(HEIGHT, WIDTH, minCellSize);
  
  pauseButton = createButton('Pause');
  pauseButton.position(10, 10);
  pauseButton.mousePressed(pauseClicked);
  
  clearButton = createButton('Clear');
  clearButton.position(75, 10);
  clearButton.mousePressed(clearClicked);
  
  fixedPointButton = createButton('fixedPoint');
  fixedPointButton.position(340, 10);
  fixedPointButton.mousePressed(fixedPointClicked);
  
  gravityButton = createButton('Gravity');
  gravityButton.position(135, 10);
  gravityButton.mousePressed(gravityClicked)
  gravityButton.style('background-color', color(255, 0, 0));
  
  viewSHButton = createButton('View Spatial Hash');
  viewSHButton.position(205, 10);
  viewSHButton.mousePressed(viewSHClicked);
  
  rigidButton = createButton('Rigid');
  rigidButton.position(490, 10);
  rigidButton.mousePressed(rigidClicked);
  
  softButton = createButton('Soft');
  softButton.position(548, 10);
  softButton.mousePressed(softClicked);
  softButton.style('background-color', color(255, 0, 0));
  
  areaButton = createButton('Area');
  areaButton.position(491, 40);
  areaButton.mousePressed(areadragClicked);
  
  dragButton = createButton('Drag');
  dragButton.position(547, 40);
  dragButton.mousePressed(areadragClicked);
  dragButton.style('background-color', color(255, 0, 0));
  
  selectButton = createButton('Select');
  selectButton.position(425, 10);
  selectButton.mousePressed(selectClicked);
  
  circleButton = createButton('Circle');
  circleButton.position(675, 10);
  circleButton.mousePressed(circleClicked);
  
  ropeButton = createButton('Rope');
  ropeButton.position(735, 10);
  ropeButton.mousePressed(ropeClicked);
  
  uncollideLineButton = createButton('Uncollide Line');
  uncollideLineButton.position(792, 10);
  uncollideLineButton.mousePressed(uncollideLineClicked);
  
  kSlider = createSlider(1, 50, 1); // min, max, start
  kSlider.position(600,10); // x and y
  kSlider.size(60, 20); // width and height
  
  dampingSlider = createSlider(0, 1000, 100); // min, max, start
  dampingSlider.position(600,35); // x and y
  dampingSlider.size(60, 20); // width and height
}


function pauseClicked() {
  if (pause) {
    pauseButton.style('background-color', color(255, 255, 255));
  }
  else {
    pauseButton.style('background-color', color(255, 0, 0));
  }
  pause = !pause;
  buttonJustClicked = true;
  buttonPressed = true;
}

function clearClicked() {
  balls = [];
  buttonJustClicked = true;
  buttonPressed = true;
}

function fixedPointClicked() {
  if (fixedPoint) {
    fixedPointButton.style('background-color', color(255, 255, 255));
  }
  else {
    fixedPointButton.style('background-color', color(255, 0, 0));
  }
  fixedPoint = !fixedPoint;
  buttonJustClicked = true;
  buttonPressed = true;
}

function gravityClicked() {
  if (applyGravity) {
    gravityButton.style('background-color', color(255, 255, 255));
  }
  else {
    gravityButton.style('background-color', color(255, 0, 0));
  }
  applyGravity = !applyGravity;
  buttonJustClicked = true;
  buttonPressed = true;
}

function viewSHClicked() {
  if (viewSH) {
    spatialHash.viewSpatialHash = false;
    viewSHButton.style('background-color', color(255, 255, 255));
  }
  else {
    spatialHash.viewSpatialHash = true;
    viewSHButton.style('background-color', color(255, 0, 0));
  }
  viewSH = !viewSH;
  spatialHash.viewSH = !spatialHash.viewSH;
  buttonJustClicked = true;
  buttonPressed = true;
}

function rigidClicked() {
  if (!rigidConstraints) {
    if (takeOutSelecting) {
      takeOutSelecting = false;
      uncollideLineButton.style('background-color', color(255, 255, 255));
    }
    if (circleDrawing) {
      circleDrawing = false;
      circleButton.style('background-color', color(255, 255, 255));
    }
    rigidConstraints = true;
    softConstraints = false;
    selecting = false;
    if (!area && !drag) {
      drag = true;
      dragButton.style('background-color', color(255, 0, 0));
    }
    rigidButton.style('background-color', color(255, 0, 0));
    softButton.style('background-color', color(255, 255, 255));
    selectButton.style('background-color', color(255, 255, 255));
    buttonJustClicked = true;
    buttonPressed = true;
  }
}

function softClicked() {
  if (!softConstraints) {
    if (takeOutSelecting) {
      takeOutSelecting = false;
      uncollideLineButton.style('background-color', color(255, 255, 255));
    }
    if (circleDrawing) {
      circleDrawing = false;
      circleButton.style('background-color', color(255, 255, 255));
    }
    rigidConstraints = false;
    softConstraints = true;
    selecting = false;
    if (!area && !drag) {
      drag = true;
      dragButton.style('background-color', color(255, 0, 0));
    }
    rigidButton.style('background-color', color(255, 255, 255));
    softButton.style('background-color', color(255, 0, 0));
    selectButton.style('background-color', color(255, 255, 255));
    buttonJustClicked = true;
    buttonPressed = true;
  }
}

function selectClicked() {
  if (!selecting) {
    if (takeOutSelecting) {
      takeOutSelecting = false;
      uncollideLineButton.style('background-color', color(255, 255, 255));
    }
    rigidConstraints = false;
    softConstraints = false;
    rope = false;
    area = false;
    drag = false;
    selecting = true;
    
    ropeButton.style('background-color', color(255, 255, 255));
    rigidButton.style('background-color', color(255, 255, 255));
    softButton.style('background-color', color(255, 255, 255));
    selectButton.style('background-color', color(255, 0, 0));
    areaButton.style('background-color', color(255, 255, 255));
    dragButton.style('background-color', color(255, 255, 255));
    buttonJustClicked = true;
    buttonPressed = true;
  }
}

function areadragClicked() {
  if (!selecting && !rope && !takeOutSelecting) {
    area = !area;
    drag = !drag;
    if (area) {
      areaButton.style('background-color', color(255, 0, 0));
      dragButton.style('background-color', color(255, 255, 255));
      selected = []
    }
    else {
      areaButton.style('background-color', color(255, 255, 255));
      dragButton.style('background-color', color(255, 0, 0));
    }
    buttonJustClicked = true;
    buttonPressed = true;
  }
}

function circleClicked() {
  if (circleDrawing) {
    circleDrawing = false;
    circleButton.style('background-color', color(255, 255, 255));
  }
  else {
    circleDrawing = true;
    circleButton.style('background-color', color(255, 0, 0));
  }
  if (rigidConstraints || softConstraints) {
    selecting = true;
    rigidConstraints = false;
    softConstraints = false;
    area = false;
    drag = false
    rigidButton.style('background-color', color(255, 255, 255));
    softButton.style('background-color', color(255, 255, 255));
    areaButton.style('background-color', color(255, 255, 255));
    dragButton.style('background-color', color(255, 255, 255));
    selectButton.style('background-color', color(255, 0, 0));
  }
  if (takeOutSelecting) {
    takeOutSelecting = false;
    uncollideLineButton.style('background-color', color(255, 255, 255));
  }
  if (rope) {
    rope = false;
    ropeButton.style('background-color', color(255, 255, 255));
  }
  buttonJustClicked = true;
  buttonPressed = true;
}

function ropeClicked() {
  if (rope) {
    rope = false;
    ropeButton.style('background-color', color(255, 255, 255));
  }
  else {
    rope = true;
    ropeButton.style('background-color', color(255, 0, 0));
  }
  if (!rigidConstraints && !softConstraints) {
    rigidConstraints = true;
    rigidButton.style('background-color', color(255, 0, 0));
  }
  if (area || !drag) {
    area = false;
    drag = true;
    areaButton.style('background-color', color(255, 255, 255));
    dragButton.style('background-color', color(255, 0, 0));
  }
  if (selecting) {
    rigidConstraints = true;
    drag = true;
    softConstraints = false;
    selecting = false;
    rigidButton.style('background-color', color(255, 0, 0));
    softButton.style('background-color', color(255, 255, 255));
    selectButton.style('background-color', color(255, 255, 255));
    dragButton.style('background-color', color(255, 0, 0));
  }
  if (takeOutSelecting) {
    takeOutSelecting = false;
    uncollideLineButton.style('background-color', color(255, 255, 255));
  }
  if (circleDrawing) {
    circleDrawing = false;
    circleButton.style('background-color', color(255, 255, 255));
  }
  buttonJustClicked = true;
  buttonPressed = true;
}

function uncollideLineClicked() {
  if (takeOutSelecting) {
    takeOutSelecting = false;
    uncollideLineButton.style('background-color', color(255, 255, 255));
  }
  else {
    takeOutSelecting = true;
    uncollideLineButton.style('background-color', color(255, 0, 0));
  }
  if (rigidConstraints || softConstraints) {
    rigidConstraints = false;
    softConstraints = false;
    drag = false;
    area = false;
    dragButton.style('background-color', color(255, 255, 255));
    areaButton.style('background-color', color(255, 255, 255));
    rigidButton.style('background-color', color(255, 255, 255));
    softButton.style('background-color', color(255, 255, 255));
  }
  if (circleDrawing) {
    circleDrawing = false;
    circleButton.style('background-color', color(255, 255, 255));
  }
  if (rope) {
    rope = false;
    ropeButton.style('background-color', color(255, 255, 255));
  }
  buttonJustClicked = true;
  buttonPressed = true;
}


function mousePressed() {
  if (mouseButton === LEFT && !buttonJustClicked) { 
    mouseDown = true;
    if (selecting) {
      selectedBall = -1;
      min_dist = 10000;
      for (let ballID of spatialHash.mouseQuery()) {
        let ball = balls[ballID];
        let dx = mouseX - ball.x_pos;
        let dy = mouseY - ball.y_pos;
        let distance = sqrt(dx * dx + dy * dy);
        
        if (distance < min_dist) {
          selectedBall = balls[ballID];
          min_dist = distance;
        }
      }
    }
    
    if (circleDrawing) {
      circleEnding = true;
      selectedCircleX = mouseX;
      selectedCircleY = mouseY;
    }
    else if (rope) {
      ballSelected = false;
      ropeDrawing = true;
      for (let ballID of spatialHash.mouseQuery()) {
        if (balls[ballID].checkSelect()) {
          connectingRopeID = ballID;
          ballSelected = true;
          ropeX = balls[ballID].x_pos;
          ropeY = balls[ballID].y_pos;
          ropeList.push(balls[ballID]);
          if (balls[ballID].fixedPoint) {
            balls[ballID].keepFixedPoint = true;
          }
          else {
            balls[ballID].fixedPoint = true;
          }
          break
        }
      }
      if (!ballSelected) {
        connectingRopeID = -1;
        ropeX = mouseX;
        ropeY = mouseY;
        balls.push(new VerletBall(mouseX, mouseY, radius, color(0, 255, 0), 1, 0.1, balls.length, friction, true));
        ropeList.push(balls[balls.length - 1]);
      }
    }
    else if (rigidConstraints || softConstraints) {
      generatingNewPoint = true;
      connectingBallID = -1;
      for (let ballID of spatialHash.mouseQuery()) {
        if (balls[ballID].checkSelect()) {
          connectingBallID = ballID;
          break
        }
      }
      if (connectingBallID >= 0) { //if we're connecting to an existing ball
        updateNewPoint = false;
        newPointX = balls[connectingBallID].x_pos;
        newPointY = balls[connectingBallID].y_pos;
      }
      else {
        newPointX = mouseX;
        newPointY = mouseY;
      }
      if (area) {
        selectX = mouseX;
        selectY = mouseY;
        connectSelecting = true;
      }
    }
    else if (takeOutSelecting) {
      selectX = mouseX;
      selectY = mouseY;
    }
  }
}

function mouseReleased() {
  ballSelected = false;
  mouseDown = false;
  selectedBall = -1;
  for (let i = 0; i < balls.length; i++) {
    balls[i].setSelect(false);
  }
  pauseSelect = false;
  if (!buttonPressed) {
    if (ropeDrawing) {
      ropeDrawing = false;
      let firstPass;
      if (ropeList[0].keepFixedPoint) {
        firstPass = true;
      }
      else {
        firstPass = false;
      }
      if (!fixedPoint) {
        for (let ball of ropeList) {
          if (!firstPass) {
            ball.fixedPoint = false;
          }
          firstPass = false;
        }
      }
      ropeList = [];
    }
    else if (takeOutSelecting) {
      for (let ball of selectedBalls) {
        ball1 = balls[ball[0]];
        ball2 = balls[ball[1]];
        ball1.dontAddLineToSH.add(ball[1]);
        ball2.dontAddLineToSH.add(ball[0]);
        ball1.connections.set(ball2, [color(255, 255, 255), 3]);
        ball2.connections.set(ball1, [color(255, 255, 255), 3]);
      }
      selectedBalls = [];
    }
    else if (connectSelecting) {
      let compare = [];
      for (let ball of selectedBalls) {
        for (let otherBall of selectedBalls) {
          let pair = [ball.id, otherBall.id].sort();
          if (!includesArray(compare, pair) && ball.id !== otherBall.id) {
            if (!ball.alreadyConnected.has(otherBall)) {
              let dx = ball.x_pos - otherBall.x_pos;
              let dy = ball.y_pos - otherBall.y_pos;
              let length = Math.sqrt(dx * dx + dy * dy);
              if (rigidConstraints) {
                addBackToSH(ball, otherBall);
                unconstrainRigid(ball, otherBall);
                ball.connectionsRigid.add(otherBall);
                otherBall.connectionsRigid.add(ball);
                unconstrainSoft(ball, otherBall);
              }
              else {
                addBackToSH(ball, otherBall);
                unconstrainSoft(ball, otherBall);
                ball.connectionsSoft.add(otherBall);
                otherBall.connectionsSoft.add(ball);
                unconstrainRigid(ball, otherBall);
              }
              ball.connections.set(otherBall, [color(255, 255, 255), 10]);
              otherBall.connections.set(ball, [color(255, 255, 255), 10]);
              ball.connectionLengths.set(otherBall, length);
              otherBall.connectionLengths.set(ball, length);
              compare.push([ball.id, otherBall.id].sort());
            }
          }
        }  
      }
      selectedBalls = [];
      connectSelecting = false;
    }
    else if ((rigidConstraints || softConstraints) && area) {
      return;
    }
    else if ((rigidConstraints || softConstraints) && drag) {
      generatingNewPoint = false;
      connectingToBall = false;
      for (let ballID of spatialHash.mouseQuery()) {
        if (balls[ballID].checkSelect()) {
          connectingToID = ballID;
          connectingToBall = true;
          break;
        }
      }
      if (connectingBallID >= 0) { //if the user selected a ball with the mouseDown
        if (!connectingToBall) { //if the user is not connecting the selected ball with another ball
          balls.push(new VerletBall(mouseX, mouseY, radius, color(0, 255, 0), 1, 0.3, balls.length, friction, false));
          if (fixedPoint) {
            balls[balls.length - 1].fixedPoint = true;
          }
          adjustConstraints(balls[balls.length - 1], balls[connectingBallID]);
        }
        else { 
          adjustConstraints(balls[connectingToID], balls[connectingBallID]);
        }
      }
      else { //if the user did not select a ball with the mouseDown
        balls.push(new VerletBall(newPointX, newPointY, radius, color(0, 255, 0), 1, 0.3, balls.length, friction, false));
        if (fixedPoint) {
          balls[balls.length - 1].fixedPoint = true;
        }
        if (!connectingToBall) {
          let dx = mouseX - newPointX;
          let dy = mouseY - newPointY;
          if (Math.sqrt(dx * dx + dy * dy) > radius * 2) {
            balls.push(new VerletBall(mouseX, mouseY, radius, color(0, 255, 0), 1, 0.3, balls.length, friction, false))
            if (fixedPoint) {
              balls[balls.length - 1].fixedPoint = true;
            }
            adjustConstraints(balls[balls.length - 1], balls[balls.length - 2]);
          }
        }
        else {
          adjustConstraints(balls[balls.length - 1], balls[connectingToID]);
        }
      }
    }
    else if (circleDrawing && validCircle) {
      for (let i = 0; i < wheelNodeNum; i++) {
        balls.push(new VerletBall(selectedCircleX + sign(widthX - selectedCircleX) * circleLength * Math.cos(2 * PI * (i / wheelNodeNum)), selectedCircleY + sign(heightY - selectedCircleY) * circleLength *Math.sin(2 * PI * (i / wheelNodeNum)), radius, color(0, 255, 0), 1, 0.3, balls.length, friction, false));
      }
      balls.push(new VerletBall(selectedCircleX, selectedCircleY, radius, color(0, 255, 0), 1, 0.3, balls.length, friction, false));
      
      // connecting the wheel
      let lowBound = balls.length - wheelNodeNum - 1;
      let compare = [];
      for (let i = lowBound; i < balls.length; ++i) {
        for (let k = lowBound + 1; k < balls.length; ++k) {
          if (i != k && !includesArray(compare, [i, k].sort())) {
            balls[i].connectionsSoft.add(balls[k]);
            balls[k].connectionsSoft.add(balls[i]);
            balls[i].dontAddLineToSH.add(k);
            balls[k].dontAddLineToSH.add(i);
            
            let thickness = 3;
            if ((abs(i - k) === 1 && i < balls.length - 1 && k < balls.length - 1) || i === lowBound && k === balls.length - 2) {
              thickness = 10;
              addBackToSH(balls[k], balls[i]);
            }
            balls[i].connections.set(balls[k], [color(255, 255, 255), thickness]);
            balls[k].connections.set(balls[i], [color(255, 255, 255), thickness]);
            let dx = balls[i].x_pos - balls[k].x_pos;
            let dy = balls[i].y_pos - balls[k].y_pos;
            let length = Math.sqrt(dx * dx + dy * dy);
            balls[i].connectionLengths.set(balls[k], length);
            balls[k].connectionLengths.set(balls[i], length);
            compare.push([i, k].sort());
          }
        }
      }
    }
  }
  buttonPressed = false;
}
    
function mouseWheel() {
  balls.push(new VerletBall(mouseX, mouseY, radius, color(0, 255, 0), 1, 0.3, balls.length, friction, false));
  if (fixedPoint) {
    balls[balls.length - 1].fixedPoint = true;
  }
}
    

function unconstrainRigid(ball, otherBall) {
  if (otherBall.connectionsRigid.has(ball)) {
    otherBall.connectionsRigid.delete(ball);
  }
  if (ball.connectionsRigid.has(otherBall)) {
    ball.connectionsRigid.delete(otherBall);
  }
}


function unconstrainSoft(ball, otherBall) {
  if (otherBall.connectionsSoft.has(ball)) {
    otherBall.connectionsSoft.delete(ball);
  }
  if (ball.connectionsSoft.has(otherBall)) {
    ball.connectionsSoft.delete(otherBall);
  }
}


function addBackToSH(ball, otherBall) {
  if (ball.dontAddLineToSH.has(otherBall.id)) {
    ball.dontAddLineToSH.delete(otherBall.id);
  }
  if (otherBall.dontAddLineToSH.has(ball.id)) {
    otherBall.dontAddLineToSH.delete(ball.id);
  }
}
  

function adjustConstraints(ball, otherBall) {
  if (rigidConstraints) {
    addBackToSH(ball, otherBall);
    unconstrainRigid(ball, otherBall);
    ball.connectionsRigid.add(otherBall);
    otherBall.connectionsRigid.add(ball);
    unconstrainSoft(ball, otherBall);
  }
  else {
    addBackToSH(ball, otherBall);
    unconstrainSoft(ball, otherBall);
    ball.connectionsSoft.add(otherBall);
    otherBall.connectionsSoft.add(ball);
    unconstrainRigid(ball, otherBall);
  }
  otherBall.connections.set(ball, [color(255, 255, 255), 10]);
  ball.connections.set(otherBall, [color(255, 255, 255), 10]);
  if (!rope) {
    otherBall.connectionLengths.set(ball, newLineDist);
    ball.connectionLengths.set(otherBall, newLineDist);
  }
  else {
    otherBall.connectionLengths.set(ball, radius * 2 + 1);
    ball.connectionLengths.set(otherBall, radius * 2 + 1);
  }
}
    
    
function collidePoint(rectX, rectY, rectWidth, rectHeight, pointX, pointY) {
  return (pointX <= rectX + rectWidth && pointX >= rectX && pointY <= rectY + rectHeight && pointY >= rectY);
}
    
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  if (arr1[0] !== arr2[0] || arr1[1] !== arr2[1]) return false;
  return true;
}

function includesArray(arr, target) {
  for (let subArr of arr) {
    if (arraysEqual(subArr, target)) {
      return true;
    }
  }
  return false;
}
    
function removeFromArray(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arraysEqual(arr[i], target)) {
      arr.splice(i, 1);
      break;
    }
  }
}
    
function sign(x) {
  if (x < 0) {
    return -1;
  }
  return 1;
}


function draw() {
  if (!area && !takeOutSelecting) {
    if (mouseY > HEIGHT - radius) {
      mouseY = HEIGHT - radius;
    }
    else if (mouseY < radius) {
      mouseY = radius;
    }
  
    if (mouseX > WIDTH - radius) {
      mouseX = WIDTH - radius;
    }
    else if (mouseX < radius) {
      mouseX = radius;
    }
  }
  
  
  background(40);
  
  
  let dt = deltaTime / 1000;
  if (dt > 2 * dt_prev && dt_prev != 0.1) {
    dt = dt_prev;
  }
  
  
  dt_prev = dt; 
  //stroke(0, 255, 0);
  if (pause && selecting && !connectSelecting && !takeOutSelecting) {
    pauseSelect = true;
  }
  lastSubStep = false;
  collisionsFromSH = 0;
  if (!pause) {
    for (let _ = 0; _ < subStep; _++) {
      lines = new Map();
      compare = [];
      for (let ball of balls) {
        for (let [connectedBall, info] of ball.connections) {
          if (!includesArray(compare, [ball.id, connectedBall.id].sort()) && !ball.dontAddLineToSH.has(connectedBall.id)) {
            let dx = ball.x_pos - connectedBall.x_pos;
            let dy = ball.y_pos - connectedBall.y_pos;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > radius * 2 + 2) {
              compare.push([ball.id, connectedBall.id].sort());
              lines.set([[ball.x_pos, ball.y_pos], [connectedBall.x_pos, connectedBall.y_pos]], [ball, connectedBall, []]);
            }
          }
        }
      }
      for (let j = 0; j < balls.length; j++) {
        if (!balls[j].fixedPoint && !balls[j].fixedPointWhileRope) {
          balls[j].update(dt);
          balls[j].collisionCount = 0;
        }
        if (selecting) {
          if (selectedBall != -1) {
            selectedBall.Select(dt);
          }
        }
      }
      spatialHash.fillSH(balls, lines);
      spatialHash.calcPartialSum();
      spatialHash.fillParticleArray(balls, lines);
      compare = [];
      
      for (let ball of balls) {
        let cell = int(spatialHash.getCell(ball.getX(), ball.getY()));
        if (cell > -1 && cell < spatialHash.cellCount.length) {
          let queryList = spatialHash.ballQuery(ball);
          
          for (let otherBallID of queryList) {
            
            if (typeof otherBallID == 'number') {
              let check = [otherBallID, ball.getID()].sort();
              if (otherBallID != ball.getID() && !compare.includes(check)) {
                if (ball.checkSeperate(balls[otherBallID])) {
                  compare.push(check);
                  ball.collide(balls[otherBallID]);
                  ball.collisionCount++;
                  balls[otherBallID].collisionCount++;
                }
              } 
            }
            
            else {
              check = [ball.id, otherBallID[0], otherBallID[1]].sort();
              // check if this works
              if (!otherBallID.includes(ball.id)) {
                let ball1 = balls[otherBallID[0]];
                let ball2 = balls[otherBallID[1]];
                let list = ball.detect_line_circle([ball1, ball2]);
                if (list[0] !== null) {
                  compare.push(check);
                  ball.collide_line_circle(list[0], list[1], list[2], list[3], list[4], list[5], list[6]);
                }
              }
            }
          }
        }
      }
      
      
      for (let ball of balls) {
        ball.alreadyConnected = new Set();
      }
      
      k = kSlider.value();
      damping = dampingSlider.value();
      for (let ball of balls) {
        for (let otherBall of ball.connectionsSoft) {
          if (!ball.alreadyConnected.has(otherBall)) {
            ball.connectSoft(otherBall, ball.connectionLengths.get(otherBall), k, damping, dt);
            otherBall.alreadyConnected.add(ball);
          }
        }
      }
      
      for (let ball of balls) {
        ball.alreadyConnected = new Set();
      }
      
      for (let ball of balls) {
        for (let otherBall of ball.connectionsRigid) {
          if (!ball.alreadyConnected.has(otherBall)) {
            ball.connectRigid(otherBall, ball.connectionLengths.get(otherBall));
            otherBall.alreadyConnected.add(ball);
          }
        }
      }
        
      for (let ball of balls) {
        ball.environment();
      }
      
      if (_ == subStep - 2) {
        lastSubStep = true;
      }
    }
  }
  else {
    spatialHash.fillSH(balls, lines);
    spatialHash.calcPartialSum();
    spatialHash.fillParticleArray(balls, lines);
    if (pauseSelect) {
      if (selectedBall != -1) {
        selectedBall.Select(dt);
      }
    }
    lines = new Map();
    compare = [];
    for (let ball of balls) {
      for (let [connectedBall, info] of ball.connections) {
        if (!includesArray(compare, [ball.id, connectedBall.id].sort()) && !ball.dontAddLineToSH.has(connectedBall.id)) {
          let dx = ball.x_pos - connectedBall.x_pos;
          let dy = ball.y_pos - connectedBall.y_pos;
          let distance = Math.sqrt(dx * dx + dy * dy);
          compare.push([ball.id, connectedBall.id].sort());
          lines.set([[ball.x_pos, ball.y_pos], [connectedBall.x_pos, connectedBall.y_pos]], [ball, connectedBall, []]);
        }
      }
    }
  }
  
  connecting = (generatingNewPoint && area && mouseDown && !buttonJustClicked);
  takeOut = (takeOutSelecting && mouseDown && !buttonJustClicked);
  if (connecting || takeOut) {
    let dx = Math.abs(mouseX - selectX);
    let dy = Math.abs(mouseY - selectY);
    
    if (takeOut) { 
      fill(color(0, 180, 255));
    }
    else {
      fill(color(255, 150, 0));
    }
    rectWidth = dx;
    rectHeight = dy;
    if (mouseX <= selectX && mouseY <= selectY) {
      rect(mouseX, mouseY, dx, dy);
      rectX = mouseX;
      rectY = mouseY;
    }
    else if (mouseX <= selectX && mouseY > selectY) {
      rect(mouseX, selectY, dx, dy);
      rectX = mouseX;
      rectY = selectY;
    }
    else if (mouseX > selectX && mouseY <= selectY) {
      rect(selectX, mouseY, dx, dy);
      rectX = selectX;
      rectY = mouseY;
    }
    else {
      rect(selectX, selectY, dx, dy);
      rectX = selectX;
      rectY = selectY;
    }

    fill(0, 255, 0);
    
    if (connecting) {
      selectedBalls = [];
      for (let ball of balls) {
        const index = selectedBalls.indexOf(ball);
        
        if (collidePoint(rectX, rectY, rectWidth, rectHeight, ball.x_pos, ball.y_pos) && !selectedBalls.includes(ball)) {
          selectedBalls.push(ball);
        }
        else if (index !== -1) {
          selectedBalls.splice(index, 1);
        }
      }
    }
    else if (takeOutSelecting) {
      for (let [connection, info] of lines) {
        let ball1 = info[0];
        let ball2 = info[1];
        let check = [ball1.id, ball2.id].sort();
        let x = (ball1.x_pos + ball2.x_pos) / 2;
        let y = (ball1.y_pos + ball2.y_pos) / 2;
        
    
        if (collidePoint(rectX, rectY, rectWidth, rectHeight, x, y)) {
          // these two if statements are here to fix a bug, so ignore them because they're not really part of the logic of what should be going on here
          if (!ball2.connections.has(ball1)) {
            const dx = ball1.x_pos - ball2.x_pos;
            const dy = ball1.y_pos - ball2.y_pos;
            const length = Math.sqrt(dx * dx + dy * dy);
            ball2.connectionLengths.set(ball1, length);
          }
          if (!ball1.connections.has(ball2)) {
            const dx = ball1.x_pos - ball2.x_pos;
            const dy = ball1.y_pos - ball2.y_pos;
            const length = Math.sqrt(dx * dx + dy * dy);
            ball1.connectionLengths.set(ball2, length);
          }
          
          // look at this
          ball1.connections.set(ball2, [color(255, 0, 0), 10]);
          ball2.connections.set(ball1, [color(255, 0, 0), 10]);
          if (!includesArray(selectedBalls, check)) {
            selectedBalls.push(check);
          }
        }
        else {
          // same with these
          if (!ball2.connections.has(ball1)) {
            const dx = ball1.x_pos - ball2.x_pos;
            const dy = ball1.y_pos - ball2.y_pos;
            const length = math.sqrt(dx * dx + dy * dy);
            ball2.connectionLengths.set(ball1, length);
          }
          if (!ball1.connections.has(ball2)) {
            const dx = ball1.x_pos - ball2.x_pos;
            const dy = ball1.y_pos - ball2.y_pos;
            const length = math.sqrt(dx * dx + dy * dy);
            ball1.connectionLengths.set(ball2, length);
          }
          
          // and this
          ball1.connections.set(ball2, [color(255, 255, 255), 10]);
          ball2.connections.set(ball1, [color(255, 255, 255), 10]);
          if (includesArray(selectedBalls, check)) {
            removeFromArray(selectedBalls, check);
          }
        }
      }
    }
  }
  
  if (circleDrawing) {
    text('Number of Nodes:', 680, 50);
    if (mouseDown) {
      widthX = mouseX;
      heightY = mouseY;
      let dx = widthX - selectedCircleX;
      let dy = heightY - selectedCircleY;
      circleLength = Math.sqrt(dx * dx + dy * dy);
      for (let i = 0; i < wheelNodeNum; i++) {
        if (circleLength > wheelNodeNum * 2.7) {
          fill(0, 255, 0);
          validCircle = true;
        }
        else {
          fill(255, 0, 0);
          validCircle = false;
        }
        circle(selectedCircleX + sign(dx) * circleLength * Math.cos(2 * PI * (i / wheelNodeNum)), selectedCircleY + sign(dy) * circleLength * Math.sin(2 * PI * (i / wheelNodeNum)), radius * 2);
      }
      circle(selectedCircleX, selectedCircleY, radius * 2);
    }
  }
  
  stroke(255, 255, 255);
  currStrokeWeight = 1;
  for (let ball of balls) {
    for (let [otherBall, info] of ball.connections) {
      if (!ball.alreadyDrawnLine.has(otherBall)) {
        ball.drawLine(otherBall);
        otherBall.alreadyDrawnLine.add(ball);
      }
    }
  }
  stroke(0, 0, 0);
  
  strokeWeight(1);
  if (connectSelecting) {
    for (let ball of selectedBalls) {
      ball.ballColor = color(255, 0, 0);
    }
  }
  for (let ball of balls) {
    ball.displayCircle();
    ball.ballColor = color(0, 255, 0);
  }
  
  stroke(0);
  
  for (let ball of balls) {
    ball.alreadyDrawnLine = new Set();
  }
  
  if (generatingNewPoint && drag) {
    if (connectingBallID >= 0) {
      newPointX = balls[connectingBallID].x_pos;
      newPointY = balls[connectingBallID].y_pos;
    }
    strokeWeight(10);
    stroke(255, 255, 255);
    line(newPointX, newPointY, mouseX, mouseY);
    strokeWeight(1);
    stroke(0, 0, 0);
    fill(0, 255, 0);
    currColor = color(0, 255, 0);
    circle(newPointX, newPointY, radius * 2);
    circle(mouseX, mouseY, radius * 2);
    const dx = newPointX - mouseX;
    const dy = newPointY - mouseY;
    newLineDist = Math.sqrt(dx * dx + dy * dy);
    if (newLineDist <= radius * 2) {
      newLineDist = radius * 2 + 1;
    }
  }
  if (ropeDrawing) {
    if (connectingRopeID >= 0) {
      const dx = mouseX - balls[connectingRopeID].x_pos;
      const dy = mouseY - balls[connectingRopeID].y_pos;
      if (Math.sqrt(dx * dx + dy * dy) > radius * 2) {
        balls.push(new VerletBall(mouseX, mouseY, radius, color(0, 255, 0), 1, 0.1, balls.length, friction, true));
        balls[connectingRopeID].connectWhileRope(balls[balls.length - 1]);
        adjustConstraints(balls[balls.length - 1], balls[connectingRopeID]);
        ropeList.push(balls[balls.length - 1]);
        connectingRopeID = balls.length - 1;
      }
    }
    else if (ropeList.length > 0) {
      const dx = mouseX - balls[balls.length - 1].x_pos;
      const dy = mouseY - balls[balls.length - 1].y_pos;
      if (Math.sqrt(dx * dx + dy * dy) > radius * 2) {
        balls.push(new VerletBall(mouseX, mouseY, radius, color(0, 255, 0), 1, 0.1, balls.length, friction, true));
        balls[balls.length - 2].connectWhileRope(balls[balls.length - 1]);
        adjustConstraints(balls[balls.length - 1], balls[balls.length - 2]);
        ropeList.push(balls[balls.length - 1]);
        connectingRopeID = balls.length - 1;
      }
    }
  }
  buttonJustClicked = false;
  //spatialHash.showParticleArray();
}

class VerletBall {
  constructor(x_pos, y_pos, radius, ballColor, mass, bounce, id, friction, fixedPoint) {
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.radius = radius;
    this.ballColor = ballColor;
    this.mass = mass;
    this.bounce = bounce;
    this.id = id;
    this.friction = friction;
    this.fixedPoint = fixedPoint;
    this.selected = false;
    this.oldX = x_pos;
    this.oldY = y_pos;
    this.connectionsSoft = new Set();
    this.connectionsRigid = new Set();
    this.connections = new Map();
    this.alreadyConnected = new Set();
    this.alreadyDrawnLine = new Set();
    this.connectionLengths = new Map();
    this.frictionX = false;
    this.frictionY = false;
    this.forceX = 0;
    this.forceY = 0;
    this.springFX = 0;
    this.springFY = 0; 
    this.dontAddLineToSH = new Set();
    this.lineColor = color(255, 255, 255);
    this.maxSearchDist = 0;
    this.collisionCount = 0;
    this.keepFixedPoint = false;
    
  }
  
  displayCircle() {
  fill(this.ballColor); 
  currColor = this.ballColor; 
  circle(this.x_pos, this.y_pos, this.radius * 2);
}
  
  drawLine(otherBall) {
    let shade = this.connections.get(otherBall)[0];
    let weight = this.connections.get(otherBall)[1];
    //let r1 = green(currLineColor);
    //let r2 = green(shade);
    stroke(shade);
    strokeWeight(weight);
    /*if (r1 != r2) {
      stroke(shade);
      currLineColor = shade;
    }
    if (currStrokeWeight != weight) {
      strokeWeight(weight);
      currStrokeWeight = weight;
    }*/
    line(this.x_pos, this.y_pos, otherBall.x_pos, otherBall.y_pos);
  }
  
  collide(otherBall) {
    const  dx = this.x_pos - otherBall.x_pos;
    const  dy = this.y_pos - otherBall.y_pos;
    const  distance = Math.sqrt(dx * dx + dy * dy);
    const  depth = this.radius + otherBall.radius - distance;
    if (depth > 0 && distance > 0) {
      const  fac = 1 / distance * depth / 2;
      if (!this.fixedPoint) {
        this.x_pos += dx * fac;
        this.y_pos += dy * fac;
      }
      if (!otherBall.fixedPoint) {
        otherBall.x_pos -= dx * fac;
        otherBall.y_pos -= dy * fac;
      }
    }
  }
  
  update(dt) {
    let xVel = this.x_pos - this.oldX;
    let yVel = this.y_pos - this.oldY;
    
    if (Math.abs(xVel) < 0.0002 && this.y_pos + this.radius >= HEIGHT) {
      xVel = 0;
    }
    if (this.collisionCount >= 1) {
      let vel = Math.sqrt(xVel * xVel + yVel * yVel);
      let maxSpeed = this.radius * (1 / this.collisionCount);
      if (Math.abs(vel) > maxSpeed) {
        xVel = maxSpeed * xVel / vel;
        yVel = maxSpeed * yVel / vel;
      }
    }
    if (Math.abs(xVel) < 0.0002 && this.y_pos + this.radius >= HEIGHT) {
      xVel = 0;
    }
    
    if (this.frictionX) {
      xVel *= 1 / (1 + (dt * this.friction));
    }
    
    if (this.frictionY) {
      yVel *= 1 / (1 + (dt * this.friction));
    }
    
    this.oldX = this.x_pos;
    this.oldY = this.y_pos;
    
    if (this.connectionsSoft.size > maxBallConnections) {
      this.springFX /= 2;
      this.springFY /= 2;
    }
    
    this.forceX += this.springFX;
    this.forceY += this.springFY;
      
    let damping = 1;
    
    this.x_pos += (xVel + (this.forceX - xVel * damping) * (dt * dt));
    this.y_pos += (yVel + (this.forceY - yVel * damping) * (dt * dt));
    
    this.springFX = 0;
    this.springFY = 0;
    this.frictionX = false;
    this.frictionY = false;
    this.forceX = 0;
    this.forceY = 0;
    if (!this.fixedPoint && applyGravity) {
      this.forceY = gravity;
    } 
  }
  
  connectSoft(otherBall, length, k, damping, dt) {
    const  dx = this.x_pos - otherBall.x_pos;
    const  dy = this.y_pos - otherBall.y_pos;
    const  distance = Math.sqrt(dx * dx + dy * dy)
    if (distance != 0) {
      let directionX = dx / distance;
      let directionY = dy / distance;
      let forceX = k * (distance - length) * directionX;
      let forceY = k * (distance - length) * directionY;
      
      if (!this.fixedPoint) {
        this.springFX -= forceX;
        this.springFY -= forceY;
      }
      
      if (!otherBall.fixedPoint) {
        otherBall.springFX += forceX;
        otherBall.springFY += forceY;
      }
      
      // apply damping
      let v0x = (otherBall.x_pos - otherBall.oldX) - forceX * dt;
      let v0y = (otherBall.y_pos - otherBall.oldY) - forceY * dt;
      
      let v1x = (this.x_pos - this.oldX) + forceX * dt;
      let v1y = (this.y_pos - this.oldY) + forceY * dt;
      
      let vrelX = (v0x - v1x) * directionX;
      let vrelY = (v0y - v1y) * directionY;
      let vrel = vrelX + vrelY;
      let vrel_delta = vrel * damping;
      
      let angle = Math.abs(((Math.atan2(dy, dx)) * 180 / PI) % 360 - 180);
      let quadrantAngle = PI / 2 - (angle * (PI / 180)) % (PI / 2);
      
      let vrel_deltaX1;
      let vrel_deltaY1;
      let vrel_deltaX2 = 0;
      let vrel_deltaY2 = 0;
      
      if (angle >= 270) {
        vrel_deltaX2 -= Math.cos(quadrantAngle) * vrel_delta / 2 / subStep;
        vrel_deltaY2 -= Math.sin(quadrantAngle) * vrel_delta / 2 / subStep;
      }
      
      else if (angle >= 180) { //
        vrel_deltaX2 += Math.sin(quadrantAngle) * vrel_delta / 2 / subStep;
        vrel_deltaY2 -= Math.cos(quadrantAngle) * vrel_delta / 2 / subStep;
      }
      
      else if (angle >= 90) {
        vrel_deltaX2 += Math.cos(quadrantAngle) * vrel_delta / 2 / subStep;
        vrel_deltaY2 += Math.sin(quadrantAngle) * vrel_delta / 2 / subStep;
      }
      
      else {
        vrel_deltaX2 -= Math.sin(quadrantAngle) * vrel_delta / 2 / subStep;
        vrel_deltaY2 += Math.cos(quadrantAngle) * vrel_delta / 2 / subStep;
      }
      
      vrel_deltaX1 = -vrel_deltaX2;
      vrel_deltaY1 = -vrel_deltaY2;
      
      this.springFX += vrel_deltaX2;
      this.springFY += vrel_deltaY2;
      otherBall.springFX += vrel_deltaX1;
      otherBall.springFY += vrel_deltaY1;
    }
  }
  
  connectRigid(otherBall, length) {
    let dx = this.x_pos - otherBall.x_pos;
    let dy = this.y_pos - otherBall.y_pos;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      let diff = length - dist;
      let percent = (diff / dist) / 2;
      let offsetX = dx * percent;
      let offsetY = dy * percent;
      
      if (!this.fixedPoint) {
        this.x_pos += offsetX;
        this.y_pos += offsetY;
      }
      
      if (!otherBall.fixedPoint) {
        otherBall.x_pos -= offsetX;
        otherBall.y_pos -= offsetY;
      }
    }
  }
  
  connectWhileRope(otherBall) {
    let dx = this.x_pos - otherBall.x_pos;
    let dy = this.y_pos - otherBall.y_pos;
    let dist = Math.sqrt(dx * dx + dy * dy);
      
    let diff = 2 * radius + 1 - dist;
    let percent = (diff / dist);
    let offsetX = dx * percent;
    let offsetY = dy * percent;
      
    otherBall.x_pos -= offsetX;
    otherBall.y_pos -= offsetY;
  }
  
  environment() {
    let xVel = (this.x_pos - this.oldX) * 0.2;
    let yVel = (this.y_pos - this.oldY) * 0.2;
    if (this.x_pos - this.radius < 0) {
      this.x_pos = this.radius;
      this.oldX = this.radius + xVel;
      this.frictionY = true;
    }
    if (this.x_pos + this.radius > WIDTH) {
      this.x_pos = WIDTH - this.radius;
      this.oldX = WIDTH - this.radius + xVel;
      this.frictionY = true;
    }
    if (this.y_pos - this.radius < 0) {
      this.y_pos = this.radius;
      this.oldY = this.radius + yVel;
      this.frictionX = true;
    }
    if (this.y_pos + this.radius > HEIGHT) {
      this.y_pos = HEIGHT - this.radius;
      this.oldY = HEIGHT - this.radius + yVel;
      this.frictionX = true;
    }
  }
  
  detect_line_circle(connection) {
    let x1 = connection[0].x_pos;
    let y1 = connection[0].y_pos;
    let x2 = connection[1].x_pos;
    let y2 = connection[1].y_pos;
    
    let dx = x2 - x1;
    let dy = y2 - y1;
    
    let stretched_length = Math.sqrt(dx * dx + dy * dy);
    
    let fx = this.x_pos - x1;
    let fy = this.y_pos - y1;
    
    let dot = fx * dx + fy * dy;
     
    let t = 0;
    if (dx * dx + dy * dy > 0) {
      t = Math.max(0, Math.min(1, dot / (dx * dx + dy * dy)));
    }
    
    let closest_point_x = x1 + t * dx;
    let closest_point_y = y1 + t * dy;
    
    let dist1 = Math.sqrt((x1 - closest_point_x) * (x1 - closest_point_x) + (y1 - closest_point_y) * (y1 - closest_point_y));
    let dist2 = Math.sqrt((x2 - closest_point_x) * (x2 - closest_point_x) + (y2 - closest_point_y) * (y2 - closest_point_y));
    
    let closest_ball;
    let closest_dist;
    let furthest_ball;
    let furthest_dist;
    
    if ((this.x_pos - closest_point_x) * (this.x_pos - closest_point_x) + (this.y_pos - closest_point_y) * (this.y_pos - closest_point_y) < (this.radius + 5) * (this.radius + 5)) {
      if (dist1 < dist2) { // substitute for line thickness
        closest_ball = connection[0];
        closest_dist = dist1;
        furthest_ball = connection[1];
        furthest_dist = dist2;
      }
      
      else {
        closest_ball = connection[1];
        closest_dist = dist2;
        furthest_ball = connection[0];
        furthest_dist = dist1;
      }
      
      return [closest_point_x, closest_point_y, stretched_length, closest_ball, closest_dist, furthest_dist, furthest_ball];
    }
    
    else {
      return [null, null, null, null, null, null, null];
    }
  }
  
  collide_line_circle(closest_x, closest_y, stretched_length, closest_ball, closest_dist, furthest_dist, furthest_ball) {
    let dx = this.x_pos - closest_x;
    let dy = this.y_pos - closest_y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let radii = this.radius + 5 // substitute for line thickness
    let normalX;
    let normalY;
    if (distance > 0) {
      normalX = dx / distance;
      normalY = dy / distance;
    }
    else {
      normalX = dx / 0.01;
      normalY = dy / 0.01;
    }
    
    let depth = radii - distance;
    if (!this.fixedPoint) {
      this.x_pos += normalX * depth;
      this.y_pos += normalY * depth;
      
      // calculate friction and friction based on relative velocity
      // ------------------------------------------------
      const friction = Math.pow(0.999, this.connections.size + 1);
      const relFriction = 0.001 + this.connections.size * 0.001;
      const dx = closest_ball.x_pos - furthest_ball.x_pos;
      const dy = closest_ball.y_pos - furthest_ball.y_pos;
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      const tangentX = dx / magnitude;
      const tangentY = dy / magnitude;

      const velocityX = this.x_pos - this.oldX;
      const velocityY = this.y_pos - this.oldY;
      
      const lineVelX = ((closest_ball.x_pos - closest_ball.oldX) + (furthest_ball.x_pos - furthest_ball.oldX)) / 2;
      const lineVelY = ((closest_ball.y_pos - closest_ball.oldY) + (furthest_ball.y_pos - furthest_ball.oldY)) / 2;
      
      this.oldX = this.x_pos;
      this.oldY = this.y_pos;
  
      if (abs(lineVelX) > 0 || abs(lineVelY > 0)) {

        const relativeVelX = lineVelX - velocityX;
        const relativeVelY = lineVelY - velocityY;

      
        const relativeTangentVelocity = (relativeVelX * tangentX) + (relativeVelY * tangentY);
        const reducedRelativeTangentVelocity = relativeTangentVelocity * (relFriction);
        
        this.oldX -= reducedRelativeTangentVelocity * tangentX;
        this.oldY -= reducedRelativeTangentVelocity * tangentY;
      }
    
      const tangentVelocity = (velocityX * tangentX) + (velocityY * tangentY);
      const reducedTangentVelocity = tangentVelocity * (friction);
      

      this.oldX -= reducedTangentVelocity * tangentX;
      this.oldY -= reducedTangentVelocity * tangentY;
      // ---------------------------------------------
      
      const maxDepth = Math.min(0.6, Math.abs(depth));
      this.oldY -= normalY * maxDepth;
      this.oldX -= normalX * maxDepth;
    }
    if (!(closest_ball.fixedPoint)) {
      if (stretched_length > 0) {
        closest_ball.x_pos -= normalX * depth * ((stretched_length - closest_dist) / stretched_length);
        closest_ball.y_pos -= normalY * depth * ((stretched_length - closest_dist) / stretched_length);
      }
      else {
        closest_ball.x_pos -= normalX * depth * ((stretched_length - closest_dist) / 0.01);
        closest_ball.y_pos -= normalY * depth * ((stretched_length - closest_dist) / 0.01);
      }
    }
      
    else if (closest_ball.fixedPoint && !furthest_ball.fixedPoint) {
      if (stretched_length > 0) {
        furthest_ball.x_pos -= normalX * depth * ((stretched_length - furthest_dist) / stretched_length)
        furthest_ball.y_pos -= normalY * depth * ((stretched_length - furthest_dist) / stretched_length)
      }
      else {
        furthest_ball.x_pos -= normalX * depth * ((stretched_length - furthest_dist) / 0.01)
          urthest_ball.y_pos -= normalY * depth * ((stretched_length - furthest_dist) / 0.01)
      }
    }
  }
  
  checkSeperate(nextPoint) {
    let dx = this.x_pos - nextPoint.x_pos;
    let dy = this.y_pos - nextPoint.y_pos;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let radii = this.radius + nextPoint.radius;
    if (distance >= radii) {
      return false;
    }
    return true;
  }
  
  getSelect() {
   return this.selected;
  }
  
  Select(dt) {
    if (this.fixedPoint) {
      this.oldX = this.x_pos;
      this.oldY = this.y_pos;
      this.x_pos = mouseX;
      this.y_pos = mouseY;
    }
    else if (!pause) {
      let dx = mouseX - this.x_pos;
      let dy = mouseY - this.y_pos;
      let xVel = this.x_pos - this.oldX;
      let yVel = this.y_pos - this.oldY;
      let forceX = xVel - dx;
      let forceY = yVel - dy;
      forceX *= 20 * dt;
      forceY *= 20 * dt;
      let maxForce = 80;
      if (abs(forceX) > maxForce) {
        if (forceX < 0) {
          forceX = -maxForce;
        }
        else {
          forceX = maxForce;
        }
      }
      if (abs(forceY) > maxForce) {
        if (forceY < 0) {
          forceY = -maxForce;
        }
        else {
          forceY = maxForce;
        }
      }
      this.forceX -= forceX * dt * 10;
      this.forceY -= forceY * dt * 10;
    }
    else {
      this.x_pos = mouseX;
      this.y_pos = mouseY;
    }
  }
  
  checkSelect() {
    if (this.collideMouse()) {
      return true;
    }
    return false;
  }
  
  setSelect(bool) {
    this.selected = bool;
  }
  
  collideMouse() {
    if (this.x_pos - this.radius < mouseX && this.x_pos + this.radius > mouseX && this.y_pos - this.radius < mouseY && this.y_pos + this.radius > mouseY) {
      return true;
    }
    return false;
  }
  
  getX() {
    return this.x_pos;
  }
  
  getY() {
    return this.y_pos;
  }
  
  getID() {
    return this.id;
  }
  
  getMaxSearchDist() {
    return this.maxSearchDist;
  }
}

class SpatialHash2D {
  constructor(HEIGHT, WIDTH, spacing) {
    this.spacing = spacing;
    this.nY = Math.floor(HEIGHT / spacing);
    this.nX = Math.floor(WIDTH / spacing);
    if (HEIGHT / spacing != this.nY) {
      this.nY++;
    }
    if (WIDTH / spacing != this.nX) {
      this.nX++;
    }
    this.cellCount = new Array(this.nX * this.nY + 1).fill(0);
    this.particleArray = [];
    this.queryIDs = [];
    this.addToParticleArray = 0;
    this.viewSH = false;
  }
  
  fillSH(list, hm) {
    this.addToParticleArray = 0;
    this.cellCount = new Array(this.nX * this.nY + 1).fill(0);
    for (let j = 0; j < list.length; j++) {
      let cell = this.getCell(list[j].getX(), list[j].getY());
      if (cell > -1 && cell < this.cellCount.length) {
        this.cellCount[cell]++;
      }
    }
    for (let [connection, info] of hm) {
      let rayStartX = info[0].getX();
      let rayStartY = info[0].getY();
      
      let dx = info[1].getX() - rayStartX;
      let dy = info[1].getY() - rayStartY;
      let length = Math.sqrt(dx * dx + dy * dy);
      
      let rayDirX = dx / length;
      let rayDirY = dy / length;
      
      let rayUnitStepSizeX = Math.sqrt(1 + (dy / dx) * (dy / dx));
      let rayUnitStepSizeY = Math.sqrt(1 + (dx / dy) * (dx / dy));
      
      let mapCoord = this.getCellCoords(this.getCell(rayStartX, rayStartY));
      let mapCoordX = mapCoord[0];
      let mapCoordY = mapCoord[1];
      
      let rayLength1D_x;
      let rayLength1D_y;
      
      let stepX;
      let stepY;
      
      if (rayDirX < 0) {
        stepX = -1;
        rayLength1D_x = ((rayStartX - mapCoordX) / this.spacing) * rayUnitStepSizeX;
      }
      else {
        stepX = 1;
        rayLength1D_x = ((mapCoordX + this.spacing - rayStartX) / this.spacing) * rayUnitStepSizeX;
      }
      
      if (rayDirY < 0) {
        stepY = -1;
        rayLength1D_y = ((rayStartY - mapCoordY) / this.spacing) * rayUnitStepSizeY;
      }
      else {
        stepY = 1;
        rayLength1D_y = ((mapCoordY + this.spacing - rayStartY) / this.spacing) * rayUnitStepSizeY;
      }
      
      let bTileFound = false;
      let maxDistance = 1000; // take this out when you know that the loop works 
      let distance = 0
      let firstPass = true;
      
      let cell = this.getCell(mapCoordX, mapCoordY);
      info[2].push(cell);
      this.cellCount[cell]++;
      this.addToParticleArray++;
      if (lastSubStep && (this.viewSH || pause)) {
        fill(255, 0, 0);
        let cellCoord = spatialHash.getCellCoords(cell);
        rect(cellCoord[0], cellCoord[1], minCellSize, minCellSize);
      }
      
      while (!bTileFound && distance < maxDistance) {
        if (rayLength1D_x < rayLength1D_y) {
          mapCoordX += stepX * this.spacing;
          distance = rayLength1D_x;
          rayLength1D_x += rayUnitStepSizeX;
        }
        else {
          mapCoordY += stepY * this.spacing;
          distance = rayLength1D_y;
          rayLength1D_y += rayUnitStepSizeY;
        }
        
        let cell = this.getCell(mapCoordX, mapCoordY);
        info[2].push(cell);
        this.cellCount[cell]++;
        this.addToParticleArray++;
        if (lastSubStep && (this.viewSH || pause)) {
          let cellCoord = spatialHash.getCellCoords(cell);
          rect(cellCoord[0], cellCoord[1], minCellSize, minCellSize);
        }
        
        if (this.getCell(mapCoordX, mapCoordY) === this.getCell(info[1].getX(), info[1].getY())) {
          bTileFound = true;
          
        }
      }
      fill(0, 255, 0);
      currColor = color(0, 255, 0);
    }
  }
  
  getCell(x, y) {
    let xi = Math.floor(x / this.spacing);
    let yi = Math.floor(y / this.spacing);
    return xi * this.nY + yi;
  }
  
  calcPartialSum() {
    let sum = 0;
    for (let i = 0; i < this.cellCount.length; i++) {
      let temp = this.cellCount[i];
      this.cellCount[i] = sum;
      sum += temp;
    }
  }
  
  fillParticleArray(list, hm) {
    this.particleArray = new Array(list.length + this.addToParticleArray).fill(0);
    let tempCellCount = [...this.cellCount]; // Copy cellCount to avoid modifying the prefix sums

    for (let j = 0; j < list.length; j++) {
      let cell = this.getCell(list[j].getX(), list[j].getY());
      if (cell > -1 && cell < tempCellCount.length) {
        this.particleArray[tempCellCount[cell]] = list[j].getID();
        tempCellCount[cell]++;
      }
    }
    for (let [connection, info] of hm) {
      for (let cell of info[2]) {
        if (cell > -1 && cell < tempCellCount.length) {
          this.particleArray[tempCellCount[cell]] = [info[0].getID(), info[1].getID()];
          tempCellCount[cell]++;
        }
      }
    }
  }
  
  showParticleArray(drawParticle, drawConnection) {
    fill(255, 0, 0);
    stroke(255, 255, 255);
    for (let i = 0; i < this.cellCount.length - 1; i++) {
      let startIdx = this.cellCount[i];
      let endIdx = this.cellCount[i + 1];
      let display = '';
      let cellCoords = this.getCellCoords(i);
      let cellCoordsX = cellCoords[0];
      let cellCoordsY = cellCoords[1];
      for (let j = startIdx; j < endIdx; j++) {
        let particle = this.particleArray[j];
        display += particle;
        display += ' ';
      }
      text(display, cellCoordsX, cellCoordsY + this.spacing / 2);
    }
    fill(0, 255, 0);
    stroke(0, 0, 0);
  }
  
  ballQuery(ball) {
    this.queryIDs = [];
    for (let i = -1; i < 2; i++) {
      for (let j = Math.max(-1, -int(Math.min(2, int(ball.y_pos / this.spacing)))); j < int(Math.min(2, this.nY - int(ball.y_pos / this.spacing))); j++) {
        let index1 = int(this.getCell(ball.getX() + i * this.spacing, ball.getY() + j * this.spacing));
        let index2 = index1 + 1;
        if (index1 >= 0 && index1 < this.cellCount.length && index2 > 0 && index2 < this.cellCount.length) {
          if (lastSubStep && (this.viewSH || pause)) {
            let cellCoord = spatialHash.getCellCoords(index1);
            rect(cellCoord[0], cellCoord[1], this.spacing, this.spacing);
          }
          if (this.cellCount[index2] - this.cellCount[index1] > 0) {
            let particleIndex = this.cellCount[index1];
            for (let p = 0; p < this.cellCount[index2] - this.cellCount[index1]; p++) {
              this.queryIDs.push(this.particleArray[particleIndex]);
              particleIndex++;
            }
          }
        }
      }
    }
    return this.queryIDs;
  }
  
  mouseQuery() {
    this.queryIDs = [];
    for (let i = -1; i < 2; i++) {
      for (let j = Math.max(-1, -int(Math.min(2, int(mouseY / this.spacing)))); j < int(Math.min(2, this.nY - int(mouseY / this.spacing))); j++) {
        let index1 = int(this.getCell(mouseX + i * this.spacing, mouseY + j * this.spacing));
        let index2 = index1 + 1;
        if (index1 >= 0 && index1 < this.cellCount.length && index2 > 0 && index2 < this.cellCount.length) {
          if (this.cellCount[index2] - this.cellCount[index1] > 0) {
            let particleIndex = this.cellCount[index1];
            for (let p = 0; p < this.cellCount[index2] - this.cellCount[index1]; p++) {
              if (typeof this.particleArray[particleIndex] === "number") {
                this.queryIDs.push(this.particleArray[particleIndex]);
              }
              particleIndex++;
            }
          }
        }
      }
    }
    return this.queryIDs;
  }
  
  getCellCoords(cell) {
    let yi = cell % this.nY;
    let xi = Math.floor((cell - yi) / this.nY);
    let x = xi * this.spacing;
    let y = yi * this.spacing;
    return [x, y];
  }
}
