let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = "";

let state = 'waiting';
let targetLabel;

function keyPressed() {
  if (key == 't') {
    brain.normalizeData();
    brain.train({epochs: 50}, finished); 
  } else if (key == 's') {
    brain.saveData();
  } else {
    targetLabel = key;
    console.log(targetLabel);
    setTimeout(function() {
      console.log('collecting');
      logMsg('collecting');
      state = 'collecting';
      setTimeout(function() {
        console.log('not collecting');
        logMsg('not collecting');
        state = 'waiting';
      }, 15000);
    }, 5000);
  }
}

function setup() {
  createCanvas(videoWidth, videoHeight);
  video = createCapture({
    audio: false,
    video: {
        width: videoWidth,
        height: videoHeight
    }
  }, function() {
    console.log('capture ready.');
    logMsg('capture ready.');
  });
  video.elt.setAttribute('playsinline', false);
  video.muted = "true";
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 28,
    outputs: 18,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  
  // LOAD PRETRAINED MODEL
  // const modelInfo = {
  //   model: 'model2/model.json',
  //   metadata: 'model2/model_meta.json',
  //   weights: 'model2/model.weights.bin',
  // };
  // brain.load(modelInfo, brainLoaded);

  // LOAD TRAINING DATA
  // brain.loadData('ymca.json', dataReady);
}

function brainLoaded() {
  console.log('pose classification ready!');
  logMsg('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = pose_normalize(pose.keypoints);
    if(inputs == null){
      poseLabel = '';
      setTimeout(classifyPose, 100);
    }else{
      brain.classify(inputs, gotResult);
    }
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {  
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();
  }
  classifyPose();
}

function dataReady() {
  brain.normalizeData();
  brain.train({
    epochs: 50
  }, finished);
}

function finished() {
  console.log('model trained');
  logMsg('model trained');
  brain.save();
  classifyPose();
}

function gotPoses(poses) {
  // console.log(poses); 
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == 'collecting') {
      let target = [targetLabel];
      //brain.addData(inputs, target);
      let inputs = pose_normalize(pose.keypoints);
      if(inputs != null){
        brain.addData(inputs, target);
      }
    }
  }
}

function modelLoaded() {
  console.log('poseNet ready');
  logMsg('poseNet ready');
}

function draw() {
  push();
  //translate(video.width, 0);
  //scale(1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 10, 10);
    }
  }
  pop();

  fill(255, 0, 255);
  noStroke();
  textSize(512);
  textAlign(CENTER, CENTER);
  text(poseLabel, width / 2, height / 2);
}