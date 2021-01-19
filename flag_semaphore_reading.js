let video;
let poseNet;
let pose;
let skeleton;

let brain;

let genkaku = '';
let temp_genkaku = -1;
let count = 0;
let seq_genkaku = [];
let curText = '';
let bpface;
let result;

// debug
let strconfidence = '0.000';

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

  bpface = loadImage("bp_face.png");

  let options = {
    inputs: 22,
    outputs: 18,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose && pose.score > 0.5) {
   let inputs = pose_normalize(pose.keypoints);
   if(inputs == null){
     genkaku = '';
     setTimeout(classifyPose, 100);
   }else{
     brain.classify(inputs, gotResult);
   }
  } else {
    //genkaku = '';
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  // if(error){
  //   console.error(error);
  //   genkaku = '';
  // }else{
  //   result = getGenkaku(results[0].label);
  //   strconfidence = results[0].confidence.toFixed(3);
  //   if ((result != 0 && results[0].confidence > 0.5) ||
  //     (result == 0 && results[0].confidence > 0.3)) {
  //     if(result != -1){
  //       if(genkaku == result){
  //         count++;
  //         if(count == 3){
  //           temp_genkaku = genkaku;
  //           seq_genkaku.push(genkaku);
  //         }
  //       }else{
  //         if(result == 11){
  //           if(temp_genkaku == -11){
  //             genkaku = result;
  //           }
  //         }else{
  //           genkaku = result;
  //         }
  //         count = 0;
  //       }

  //       if(result == 0){
  //           curText = judge_kana(curText, seq_genkaku);
  //           seq_genkaku.splice(0);
  //       }
  //     }
  //   }else{
  //     genkaku = '';
  //   }
  // }
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
  // debug ***
  let strscore = '0.000';
  // *********

  push();
  //translate(video.width, 0);
  //scale(-1, 1);
  image(video, 0, 0, videoWidth, videoHeight);
  showbp = document.getElementsByName("bpface");
  showdebug = document.getElementsByName("debug");

  if (pose) {
    // debug ***
    strscore = pose.score.toFixed(3);
    if(showbp[0].checked){
      drawBP(pose.keypoints[RIGHTEAR].position, pose.keypoints[LEFTEAR].position);
    }
    // *********

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

  if(2 < count){
    fill(255, 255, 255);
    noStroke();
    textSize(videoWidth/3);
    textFont('sans-serif');
    textAlign(CENTER, CENTER);
    text(genkaku, videoWidth/2, videoHeight/2);
  }
  if(showdebug[0].checked){
    textSize(videoWidth/24);
    textFont('sans-serif');
    textAlign(LEFT, BOTTOM);
    text('conf: ' + strconfidence + ', score: ' + strscore + ', jg: ' + result, 10, videoHeight - 2);
  }
}

function drawBP(rear, lear){
  let size = (lear.x - rear.x)*2;
  image(bpface, (lear.x + rear.x - size)/2, (lear.y + rear.y - size)/2, size*1.3, size*1.1);
}