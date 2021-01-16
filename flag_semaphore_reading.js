let video;
let poseNet;
let pose;
let skeleton;

let brain;

let genkaku = -1;
let count = 0;
let seq_genkaku = [];
let curText = '';

function setup() {
  let canvas = createCanvas(videoWidth, videoHeight);
  canvas.parent("canvas");

  video = createCapture({
    audio: false,
    video: {
        width: videoWidth,
        height: videoHeight
    }
  }, function() {
    console.log('capture ready.')
  });
  video.elt.setAttribute('playsinline', false);
  video.muted = "true";
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 22,
    outputs: 17,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model2/model.json',
    metadata: 'model2/model_meta.json',
    weights: 'model2/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready!');
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
  if(error){
    console.error(error);
    genkaku = '';
  }else{
    if (results[0].confidence > 0.5) {
      let result = getGenkaku(results[0].label.toUpperCase());
      if(result != -1){
        if(genkaku == result){
          count++;
          if(count == 2){
              seq_genkaku.push(genkaku);
          }
        }else{
            genkaku = result;
            count = 0;
        }

        if(result == 0){
            curText = judge_kana(curText, seq_genkaku);
            seq_genkaku.splice(0);
        }
      }
    }else{
      genkaku = '';
    }
  }
  classifyPose();
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  //translate(video.width, 0);
  //scale(-1, 1);
  image(video, 0, 0, videoWidth, videoHeight);

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
      ellipse(x, y, 6, 6);
    }
  }
  pop();

  fill(255, 0, 0);
  noStroke();
  textSize(videoWidth/20);
  textFont('sans-serif');
  textAlign(LEFT);
  text(curText, 10, videoWidth/20+2);

  if(1 < count){
    fill(255, 255, 255);
    noStroke();
    textSize(videoWidth/3);
    textFont('sans-serif');
    textAlign(CENTER, CENTER);
    text(genkaku, videoWidth/2, videoHeight/2);
  }
}