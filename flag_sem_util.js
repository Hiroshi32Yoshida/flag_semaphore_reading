const videoWidth = window.innerWidth * 0.9;
const videoHeight = window.innerHeight * 0.9;

const NOSE = 0;
const LEFTEYE = 1;
const RIGHTEYE = 2;
const LEFTEAR = 3;
const RIGHTEAR = 4;
const LEFTSHOULDER = 5;
const RIGHTSHOULDER = 6;
const LEFTELBOW = 7;
const RIGHTELBOW = 8;
const LEFTWRIST = 9;
const RIGHTWRIST = 10;
const LEFTHIP = 11;
const RIGHTHIP = 12;
const LEFTKNEE = 13;
const RIGHTKNEE = 14;
const LEFTANKLE = 15;
const RIGHTANKLE = 16;

const distance = (x0, y0, x1, y1) => Math.hypot(x1 - x0, y1 - y0);

function pose_normalize(keypoints){
  inputs = [];

  let x0, y0 = keypoints[NOSE].position;
  let x1, y1 = getCenterCoord(keypoints);
  basedist = distance(x0, y0, x1, y1);
  str = x0.toString() + ', ' + y0.toString() + ', ' + x1.toString() + ', ' + y1.toString() + ', ' + baseline.toString();
  logMsg(str);
  if(basedist == 0) return inputs;

  for (let i = 0; i <= RIGHTHIP; i++) {
    let l0 = distance(x0, y0, keypoints[i].position.x, keypoints[i].position.y) / basedist;
    let l1 = distance(x1, y1, keypoints[i].position.x, keypoints[i].position.y) / basedist;
    inputs.push(l0);
    inputs.push(l1);
  }
  return inputs;
}

function getCenterCoord(keypoints){
  let center_x, center_y;
  if(keypoints.length > RIGHTHIP){
    // *正規化準備 -> 上半身の中央点を算出
    let x0 = keypoints[RIGHTSHOULDER].position.x, y0 = keypoints[RIGHTSHOULDER].position.y;
    let x1 = keypoints[LEFTHIP].position.x, y1 = keypoints[LEFTHIP].position.y;
    let x2 = keypoints[RIGHTHIP].position.x, y2 = keypoints[RIGHTHIP].position.y;
    let x3 = keypoints[LEFTSHOULDER].position.x, y3 = keypoints[LEFTSHOULDER].position.y;

    let a0 = (y1 - y0) / (x1 - x0), a1 = (y3 - y2) / (x3 -x2);

    center_x = (a0 * x0 - y0 - a1 * x2 + y2) / (a0 - a1);
    center_y = (y1 - y0) / (x1 - x0) * (center_x - x0) + y0;
    
    if(Math.abs(a0) === Math.abs(a1)) return false;

    if(center_x > Math.max(x0, x1) || center_x > Math.max(x2, x3) ||
    center_y > Math.max(y0, y1) || center_x > Math.max(y2, y3) ||
    center_x < Math.min(x0, x1) || center_x < Math.min(x2, x3) ||
    center_y < Math.min(y0, y1) || center_y < Math.min(y2, y3)) return false;
  }
  return {x : center_x, y : center_y};
}

function logMsg(text){
  document.getElementById('msglabel').textContent = text;
}

const UP = 1;
const DOWN = 2;
const LEFT = 3;
const RIGHT = 4;

const EXTENDED = 0;
const FOLDED = 1;
const UNKNOWN = -1;

const ANG_LELBOW = 0;
const ANG_RELBOW = 1;
const ANG_LSHOULDER = 2;
const ANG_RSHOULDER = 3
const ANG_LSHOULDERW = 4;
const ANG_RSHOULDERW = 5;
const ANG_LSHOULDERWN = 6;
const ANG_RSHOULDERWN = 7;

const LEFTHAND_UPDOWN = 0;
const RIGHTHAND_UPDOWN = 1;
const LEFTHAND_LR = 2;
const RIGHTHAND_LR = 3;
