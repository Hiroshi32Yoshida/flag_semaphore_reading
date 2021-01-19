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

  // 肩幅を単位距離とする
  let x0 = keypoints[LEFTSHOULDER].position.x, y0 = keypoints[LEFTSHOULDER].position.y;
  let x1 = keypoints[RIGHTSHOULDER].position.x, y1 = keypoints[RIGHTSHOULDER].position.y;
  if(x0 == undefined || y0 == undefined || x1 == undefined || y1 == undefined){
    logMsg('****************************************************');
    return null;
  }
  let basedist = distance(x0, y0, x1, y1);
  if(basedist == float.NaN || basedist == 0){
    logMsg('****************************************************');
    return null;
  }

  // 両肩を除く9ポイントの正規化距離を登録
  for (let i = 0; i < LEFTHIP; i++) {
    if(i != LEFTSHOULDER && i != RIGHTSHOULDER){
        let l0 = distance(x0, y0, keypoints[i].position.x, keypoints[i].position.y) / basedist;
        let l1 = distance(x1, y1, keypoints[i].position.x, keypoints[i].position.y) / basedist;
        inputs.push(l0);
        inputs.push(l1);
    }
  }

  // 肩と肘の内角を登録
    // left elbow
    deg = calculateInternalAngle(keypoints, LEFTELBOW, LEFTWRIST, LEFTSHOULDER);
    inputs.push(deg);

    // right elbow
    deg = calculateInternalAngle(keypoints, RIGHTELBOW, RIGHTWRIST, RIGHTSHOULDER);
    inputs.push(deg);
    
    // left shoulder - elbow
    deg = calculateInternalAngle(keypoints, LEFTSHOULDER, LEFTELBOW, RIGHTSHOULDER);
    inputs.push(deg);
    
    // right shoulder - elbow
    deg = calculateInternalAngle(keypoints, RIGHTSHOULDER, RIGHTELBOW, LEFTSHOULDER);
    inputs.push(deg);
  
  return inputs;
}

/*
 * calculate internal angle
 */
function calculateInternalAngle(keypoints, point0, point1, point2) {
    var a = {x:keypoints[point1].position.x-keypoints[point0].position.x, y:keypoints[point1].position.y-keypoints[point0].position.y};
    var b = {x:keypoints[point2].position.x-keypoints[point0].position.x, y:keypoints[point2].position.y-keypoints[point0].position.y};
     
    var dot = a.x * b.x + a.y * b.y;
     
    var absA = Math.sqrt(a.x*a.x + a.y*a.y);
    var absB = Math.sqrt(b.x*b.x + b.y*b.y);

    //dot = |a||b|cosθ
    var cosTheta = dot/(absA*absB);
     
    //acosθ
    var theta = Math.acos(cosTheta) * 180 / Math.PI;

    return theta;
}

function logMsg(text){
  document.getElementById('msglabel').textContent = text;
}

function getGenkaku(text){
  switch(text){
    case 'a': return 0;
    case 'b': return 1;
    case 'c': return 2;
    case 'd': return -2;
    case 'e': return 3;
    case 'f': return 4;
    case 'g': return 5;
    case 'h': return 6;
    case 'i': return 7;
    case 'j': return 8;
    case 'k': return 9;
    case 'l': return 10;
    case 'm': return -11;
    case 'n': return 11;
    case 'o': return 12;
    case 'p': return 13;
    case 'q': return 14;
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