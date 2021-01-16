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
//const distance = (x0, y0, x1, y1) => Math.sqrt(Math.pow(x1-x0, 2) + Math.pow(y1-y0, 2));

function pose_normalize(keypoints){
  inputs = [];

  let x0 = keypoints[NOSE].position.x, y0 = keypoints[NOSE].position.y;
  let x1 = getCenterCoord(keypoints).x, y1 = getCenterCoord(keypoints).y;
  if(x1 == undefined || y1 == undefined){
    logMsg('****************************************************');
    return null;
  }
  let basedist = distance(x0, y0, x1, y1);
  if(basedist == float.NaN || basedist == 0){
    logMsg('****************************************************');
    return null;
  }

  for (let i = RIGHTEYE; i <= RIGHTHIP; i++) {
    let l0 = distance(x0, y0, keypoints[i].position.x, keypoints[i].position.y) / basedist;
    let l1 = distance(x1, y1, keypoints[i].position.x, keypoints[i].position.y) / basedist;
    inputs.push(l0*100);
    inputs.push(l1*100);
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

function getGenkaku(text){
  switch(text){
    case 'A': return 0;
    case 'B': return 1;
    case 'C': return 2;
    case 'D': return -2;
    case 'E': return 3;
    case 'F': return 4;
    case 'G': return 5;
    case 'H': return 6;
    case 'I': return 7;
    case 'J': return 8;
    case 'K': return 9;
    case 'L': return 10;
    case 'M': return -11;
    case 'N': return 11;
    case 'O': return 12;
    case 'P': return 13;
    case 'Q': return 14;
    default: return -1;
  }
}

function judge_kana(text, genkakus) {
  strGen = genkakus.toString();
  if (strGen == [1, 10, 1])
      return '';

  if (strGen == [13]){
      if (text.length == 0){
          return text;
      }

      switch (text.slice(-1)){
          case 'か': return text.slice(0, -1) + 'が';
          case 'き': return text.slice(0, -1) + 'ぎ';
          case 'く': return text.slice(0, -1) + 'ぐ';
          case 'け': return text.slice(0, -1) + 'げ';
          case 'こ': return text.slice(0, -1) + 'ご';
          case 'さ': return text.slice(0, -1) + 'ざ';
          case 'し': return text.slice(0, -1) + 'じ';
          case 'す': return text.slice(0, -1) + 'ず';
          case 'た': return text.slice(0, -1) + 'だ';
          case 'ち': return text.slice(0, -1) + 'ぢ';
          case 'つ': return text.slice(0, -1) + 'づ';
          case 'て': return text.slice(0, -1) + 'で';
          case 'と': return text.slice(0, -1) + 'ど';
          case 'は': return text.slice(0, -1) + 'ば';
          case 'ひ': return text.slice(0, -1) + 'び';
          case 'ふ': return text.slice(0, -1) + 'ぶ';
          case 'へ': return text.slice(0, -1) + 'べ';
          case 'ほ': return text.slice(0, -1) + 'ぼ';
          default: return text;
      }
  }

  if (strGen == [14]){
      if (text.length == 0){
          return text;
      }

      switch(text.slice(-1)){
          case 'は': return text.slice(0, -1) + 'ぱ';
          case 'ひ': return text.slice(0, -1) + 'ぴ';
          case 'ふ': return text.slice(0, -1) + 'ぷ';
          case 'へ': return text.slice(0, -1) + 'ぺ';
          case 'ほ': return text.slice(0, -1) + 'ぽ';
          default: return text;
      }
  }

  if (strGen == [9, 3])
      return text + 'あ';
  else if (strGen == [3, 2])
      return text + 'い';
  else if (strGen == [6, 9])
      return text + 'う';
  else if (strGen == [1, -2, 1])
      return text + 'え';
  else if (strGen == [1, 2, 3])
      return text + 'お';
  else if (strGen == [8, 3])
      return text + 'か';
  else if (strGen == [6, 2])
      return text + 'き';
  else if (strGen == [-11, 11])
      return text + 'く';
  else if (strGen == [7, 3])
      return text + 'け';
  else if (strGen == [8, 1])
      return text + 'こ';
  else if (strGen == [1, 12])
      return text + 'さ';
  else if (strGen == [5, 7])
      return text + 'し';
  else if (strGen == [1, 2, 5])
      return text + 'す';
  else if (strGen == [9, 7])
      return text + 'せ';
  else if (strGen == [5, 3])
      return text + 'そ';
  else if (strGen == [-11, 11, 5])
      return text + 'た';
  else if (strGen == [7, -2])
      return text + 'ち';
  else if (strGen == [12, 3])
      return text + 'つ';
  else if (strGen == [6, 3])
      return text + 'て';
  else if (strGen == [2, 5])
      return text + 'と';
  else if (strGen == [1, 3])
      return text + 'な';
  else if (strGen == [6])
      return text + 'に';
  else if (strGen == [9, 4])
      return text + 'ぬ';
  else if (strGen == [9, 2, 1])
      return text + 'ね';
  else if (strGen == [3])
      return text + 'の';
  else if (strGen == [10])
      return text + 'は';
  else if (strGen == [1, 7])
      return text + 'ひ';
  else if (strGen == [9])
      return text + 'ふ';
  else if (strGen == [4])
      return text + 'へ';
  else if (strGen == [1, 2, 10])
      return text + 'ほ';
  else if (strGen == [9, 5])
      return text + 'ま';
  else if (strGen == [6, 1])
      return text + 'み';
  else if (strGen == [7, 5])
      return text + 'む';
  else if (strGen == [3, 5])
      return text + 'め';
  else if (strGen == [6, 7])
      return text + 'も';
  else if (strGen == [8, 4])
      return text + 'や';
  else if (strGen == [9, 1])
      return text + 'ゆ';
  else if (strGen == [8, 6])
      return text + 'よ';
  else if (strGen == [5, 9])
      return text + 'ら';
  else if (strGen == [12])
      return text + 'り';
  else if (strGen == [3, 7])
      return text + 'る';
  else if (strGen == [7])
      return text + 'れ';
  else if (strGen == [7, 8])
      return text + 'ろ';
  else if (strGen == [1, 9])
      return text + 'を';
  else if (strGen == [2, 9])
      return text + 'わ';
  else if (strGen == [5, 1])
      return text + 'ん';
  else
      return text;
}