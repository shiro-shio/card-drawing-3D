

const setFromSphericalCoords = (radius, phi, theta) => {
  const sinPhiRadius = Math.sin(phi) * radius;
  const x = sinPhiRadius * Math.sin(theta);
  const y = Math.cos(phi) * radius;
  const z = sinPhiRadius * Math.cos(theta);
  const lookAtMatrix = computeLookAtMatrix([x, y, z], [0, 0, 0]);
  const transformMatrix = [
    lookAtMatrix[0], lookAtMatrix[1], lookAtMatrix[2], 0,
    lookAtMatrix[4], lookAtMatrix[5], lookAtMatrix[6], 0,
    lookAtMatrix[8], lookAtMatrix[9], lookAtMatrix[10], 0,
    x, y, z, 1
  ];

  return `matrix3d(${transformMatrix.join(',')})`;
};

const setFromCartesianCoords = (x, y, z) => {
  const lookAtMatrix = computeLookAtMatrix([x, 0, z], [0, 0, 0]);
  const transformMatrix = [
    lookAtMatrix[0], lookAtMatrix[1], lookAtMatrix[2], 0,
    lookAtMatrix[4], lookAtMatrix[5], lookAtMatrix[6], 0,
    lookAtMatrix[8], lookAtMatrix[9], lookAtMatrix[10], 0,
    x, y, z, 1
  ];

  return `matrix3d(${transformMatrix.join(',')})`;
};


const setFromCartesianCoords1 = (x, y, z) => {
  const lookAtMatrix = computeLookAtMatrix([x, y, z], [x, y, z + 1]);
  const transformMatrix = [
    lookAtMatrix[0], lookAtMatrix[1], lookAtMatrix[2], 0,
    lookAtMatrix[4], lookAtMatrix[5], lookAtMatrix[6], 0,
    lookAtMatrix[8], lookAtMatrix[9], lookAtMatrix[10], 0,
    x, y, z, 1
  ];

  return `matrix3d(${transformMatrix.join(',')})`;
};



const computeLookAtMatrix = (eye, target) => {
  const zAxis = normalize(subtractVectors(eye, target));
  const xAxis = normalize(cross([0, 1, 0], zAxis));
  const yAxis = cross(zAxis, xAxis);

  return [
    -xAxis[0], -xAxis[1], -xAxis[2], 0,
    -yAxis[0], -yAxis[1], -yAxis[2], 0,
    zAxis[0], zAxis[1], zAxis[2], 0,
    0, 0, 0, 1
  ];
};

const subtractVectors = (a, b) => {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
};

const normalize = (v) => {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
};

const cross = (a, b) => {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
};


async function sphere1(numCubes ,numLayers,t=0) {
  numCubes *= numLayers
  update = false
  cardid = 1
  for (let i = 0; i < numCubes; i++) {
    if (update) { return; }
    const phi = Math.acos(-1 + (2 * i) / numCubes);
    const theta = Math.sqrt(numCubes * Math.PI) * phi;
    const transformMatrix = setFromSphericalCoords(radius, phi, theta);
    createSmallCube(sphere1.name,container,transformMatrix,cardid)
    cardid++
    await sleep(t);
  }
}

async function sphere2(numCubes ,numLayers,t=0) {
  numCubes *= numLayers
  update = false
  let remainingCubes = numCubes;
  let layerCounts = [];
  //const numLayers = Math.min(2 + Math.ceil(numCubes/10),10);
  cardid = 1
  for (let i = 0; i < numLayers; i++) {
    const layerCubes = Math.ceil(remainingCubes / (numLayers - i));
    layerCounts.push(layerCubes);
    remainingCubes -= layerCubes;
  }

  for (let i = 0; i < numLayers; i++) {
    const numCubesInLayer = layerCounts[i];
    const phi = Math.PI * (i + 0.5) / numLayers; // 每層的phi角度

    for (let j = 0; j < numCubesInLayer; j++) {
      if (update) { return; }
      const theta = (2 * Math.PI * j) / numCubesInLayer; // 每層的theta角度
      const transformMatrix = setFromSphericalCoords(radius, phi, theta);
      createSmallCube(sphere2.name,container,transformMatrix,cardid)
      cardid++
      await sleep(t);
    }
  }
}

async function sphere3(numCubes ,numLayers,t=0) {
  numCubes *= numLayers
  update = false
  let layerCounts = [];
  let totalWeight = 0;
  //const numLayers = Math.min(2 + Math.ceil(numCubes/10),10);

  for (let i = 0; i < numLayers; i++) {
    const phi = Math.PI * (i + 0.5) / numLayers;
    const layerWeight = Math.sin(phi); // 使用sin(phi)作為權重
    layerCounts.push(layerWeight);
    totalWeight += layerWeight;
  }

  layerCounts = layerCounts.map(weight => Math.round(weight / totalWeight * numCubes));

  let allocatedCubes = layerCounts.reduce((a, b) => a + b, 0);
  while (allocatedCubes < numCubes) {
    for (let i = 0; i < layerCounts.length; i++) {
      layerCounts[i]++;
      allocatedCubes++;
      if (allocatedCubes >= numCubes) break;
    }
  }
  while (allocatedCubes > numCubes) {
    for (let i = 0; i < layerCounts.length; i++) {
      if (layerCounts[i] > 0) {
        layerCounts[i]--;
        allocatedCubes--;
        if (allocatedCubes <= numCubes) break;
      }
    }
  }

  // 創建並排列小方塊
  cardid = 1
  for (let i = 0; i < numLayers; i++) {
    const numCubesInLayer = layerCounts[i];
    const phi = Math.PI * (i + 0.5) / numLayers; // 每層的phi角度
    for (let j = 0; j < numCubesInLayer; j++) {
      if (update) { return; }
      const theta = (2 * Math.PI * j) / numCubesInLayer; // 每層的theta角度
      const transformMatrix = setFromSphericalCoords(radius, phi, theta);
      createSmallCube(sphere3.name,container,transformMatrix,cardid)
      cardid++
      await sleep(t);
    }
  }

}

async function sphere4(numCubes, numLayers,t=0) {
  numCubes *= numLayers
  update = false
  cardid = 1
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const angleIncrement = Math.PI * 2 * (1 - 1 / goldenRatio);

  for (let i = 1; i <= numCubes; i++) {
    if (update) { return; }
    const l = i / numCubes;
    const phi = Math.acos(1 - 2 * l);
    const theta = angleIncrement * i;
    const transformMatrix = setFromSphericalCoords(radius, phi, theta);
    createSmallCube(sphere4.name,container,transformMatrix,cardid)
    cardid++
    await sleep(t);
  }
}

async function sphere5(numCubes, numLayers,t=0){
  numCubes *= numLayers
  update = false
  cardid=1
  let prizeId
  const prizes = sample_prizes
  const prizeList = prizes_set(prizes,numCubes)
  const goldenRatio = (1 + Math.sqrt(5)) / 2; // 黃金比例
  for (let i = 0; i < numCubes; i++) {
    if (update) { return; }
    const z_n = 1 - (2 * i + 1) / numCubes;
    const theta = Math.acos(z_n);
    const phi = 2 * Math.PI * (i / goldenRatio);
    const transformMatrix = setFromSphericalCoords(radius, theta, phi);

    if(bag){
        prizeId = getRandomlist(prizeList);
    }else{
        prizeId = prizeList[i];
    }
    const prize = prizes.find(prize => prize.id === prizeId);

    createSmallCube(sphere5.name,container,transformMatrix,cardid,prize)
    cardid++
    await sleep(t);
  }
}

async function ring(numCubes,t=0) {
  update = false
  cardid=1
  let prizeId
  const prizes = sample_prizes
  const prizeList = prizes_set(prizes,numCubes)
  for (let i = 0; i < numCubes; i++) {
    if (update) { return; }
    const angle = 2 * Math.PI * i / numCubes; // 計算角度
    const radius = ((numCubes * (cubeSize.w*1.1*cubeSize.s))/Math.PI)/2
    const x = radius * Math.cos(angle)
    const y = cubeSize.w/2; // 環的 y 坐標為0
    const z = radius * Math.sin(angle)
    const transformMatrix = setFromCartesianCoords(x, y, z);
    if(bag){
      prizeId = getRandomlist(prizeList);
  }else{
      prizeId = prizeList[i];
  }
  const prize = prizes.find(prize => prize.id === prizeId);

  createSmallCube(ring.name,container,transformMatrix,cardid,prize)
  cardid++
  await sleep(t);
  }
}

async function rings(numCubes, numLayers ,t=0) {
  update = false
  cardid = 1;
  let prizeId
  const prizes = sample_prizes
  const prizeList = prizes_set(prizes,numCubes)
  const layerHeight = cubeSize.h * 1.1 *cubeSize.s; // 調整每層的高度間距
  const totalHeight = (numLayers - 1) * layerHeight; // 計算總高度
  const centerOffset = totalHeight / 2 - numLayers; // 計算中心偏移量
  const spacing = cubeSize.w > cubeSize.h ? cubeSize.h*0.2 : cubeSize.w*0.2
  const radius = ((numCubes * (cubeSize.w * cubeSize.s + spacing)) / Math.PI) / 2;

  for (let layer = 0; layer < numLayers; layer++) {
    for (let i = 0; i < numCubes; i++) {
      if (update) { return; }
      const angle = 2 * Math.PI * i / numCubes; // 計算角度
      //const radius = ((numCubes * (cubeSize.w * 1.1 * cubeSize.s)) / Math.PI) / 2;
      const x = radius * Math.cos(angle);
      const y = layer * layerHeight - centerOffset; // 調整每層的高度，使其中心對齊
      const z = radius * Math.sin(angle);
      const transformMatrix = setFromCartesianCoords(x, y, z);
      if(bag){
        prizeId = prizeList.pop(getRandomlist(prizeList));        
      }else{
          prizeId = prizeList[i];
      }
    const prize = prizes.find(prize => prize.id === prizeId);

    createSmallCube(rings.name,container,transformMatrix,cardid,prize)
    cardid++;
    await sleep(t);
    }
  }
}

async function plane(numCubes, numLayers, t = 0) {
  //numCubes = Math.floor(numCubes / numLayers);
  update = false;
  let cardid = 1;
  let prizeId;
  const prizes = sample_prizes;
  const prizeList = prizes_set(prizes, numCubes * numLayers);
  
  //const cardWidth = cubeSize.w * 1.1 * cubeSize.s; // 卡片寬度
  //const cardHeight = cubeSize.h * 1.1 * cubeSize.s; // 卡片高度
  const spacing = cubeSize.w > cubeSize.h ? cubeSize.h*0.1 : cubeSize.w*0.1
  const cardWidth = cubeSize.w * cubeSize.s;
  const cardHeight = cubeSize.h * cubeSize.s;
  const spacingX = cardWidth + spacing; // 水平間距
  const spacingY = cardHeight + spacing; // 垂直間距

  // 計算總寬度和總高度
  const totalWidth = (numCubes - 1) * spacingX;
  const totalHeight = (numLayers - 1) * spacingY;
  
  // 計算中心偏移
  const centerX = totalWidth / 2;
  const centerY = totalHeight / 2;

  for (let layer = 0; layer < numLayers; layer++) {
    for (let i = 0; i < numCubes; i++) {
      if (update) { return; }
      
      // 計算每個卡片的水平和垂直位置，並調整中心偏移
      const x = i * spacingX - centerX;
      const y = layer * spacingY - centerY;
      const z = 0; // 平面排列，z 軸位置為 0
      
      const transformMatrix = setFromCartesianCoords1(x, y, z);
      
      if (bag) {
        prizeId = getRandomlist(prizeList);
      } else {
        prizeId = prizeList[i];
      }
      
      const prize = prizes.find(prize => prize.id === prizeId);
      createSmallCube(plane.name,container, transformMatrix, cardid, prize);
      cardid++;
      await sleep(t);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


document.getElementById('input-excel').addEventListener('click',function(){
  document.getElementById('excle-table').style.display='flex';
})
document.getElementById('excel-cancel').addEventListener('click',function(){
  document.getElementById('excle-table').style.display='none';
})
document.getElementById('excel-ok').addEventListener('click',function(){
  const ex = document.getElementById('excel')
  sample_prizes = parseTable(ex.value);
  document.getElementById('excle-table').style.display='none';
})

function parseTable(data) {
  const rows = data.trim().split('\n');
  const headers = ['id','name','quantity','img']
  const result = [];
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].split('\t');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = cells[index];
    });
    obj.id = parseInt(obj.id);
    obj.quantity = parseInt(obj.quantity);

    result.push(obj);
  }
  return result;
}


const sample_prizes_txt = "1\t紅卡1%\t1\timg/2.png\n2\t橘卡5%\t5\timg/3.png\n3\t藍卡20%\t20\timg/4.png\n"
document.getElementById('excel').value=sample_prizes_txt

let sample_prizes = [
  { id: 1, name: '紅卡1%', quantity: 1,   img: 'img/2.png' },
  { id: 2, name: '橘卡5%', quantity: 5, img: 'img/3.png' },
  { id: 3, name: '藍卡20%', quantity: 20, img: 'img/4.png' }
];

bag = true
function prizes_set(prizes,numCubes=1000) {
  const prizeList = [];
  for (const prize of prizes) {
    if (bag) {
      for (let i = 0; i < prize.quantity * 10; i++) {
        prizeList.push(prize.id);
      }
    } else {
      for (let i = 0; i < prize.quantity; i++) {
        prizeList.push(prize.id);
      }
    }
  };
  if (bag) {
    while (prizeList.length < 1000) {
      prizeList.push('');
    }
  } else {
    while (prizeList.length < numCubes) {
      prizeList.push('');
    }
  };

  prizeList.sort(() => Math.random() - 0.5);
  prizeList.sort(() => Math.random() - 0.5);
  //console.log(prizeList)
  return prizeList
}
function getRandomlist(list) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

class ObjMode {
  constructor() {
    this.name = '';
    this.idMap = new Map();
  }
  objName(name) {
    this.name = name;
  }
  objCoordinate(id, Matrix) {
    this.idMap.set(id, Matrix);
  }
  getCoordinate(id) {
    return this.idMap.get(id);
  }
}

class PrizeList {
  constructor() {
      this.prizelist = {};
      this.id = 0;
  }
  updatePrize(name, id) {
    this.id = id
      if (!this.prizelist[name]) {
          this.prizelist[name] = { 'Position': [], 'Ratio': 0 };
      }
      this.prizelist[name]['Position'].push(id);
  }
  calculateRatio() {
    for (let name in this.prizelist) {
      if (this.prizelist.hasOwnProperty(name)) {
        const totalPositions = this.prizelist[name]['Position'].length;
        const ratio = (totalPositions / this.id) * 100;
        this.prizelist[name]['Ratio'] = `${ratio.toFixed(2)}%`;
      }
    }
  }
  printPrizeList() {
      return(this.prizelist);
  }
  clear() {
    this.prizelist = {};
    this.id = 0;
  }
}

let cardisopen
const coordinates = {}
const prizeList = new PrizeList();
function createSmallCube(modename, container, transformMatrix, cardid, prize) {
  if (!(modename in coordinates)){
    obj = new ObjMode();
    obj.objName(modename);
  }else{
    obj = coordinates[modename]
  }
  obj.objCoordinate(cardid,transformMatrix)
  coordinates[modename]=obj

  
  const card = document.createElement('div');
  const card_backside = document.createElement('div');
  const card_backside_text = document.createElement('span');
  const card_surface = document.createElement('div');
  const card_surface_text = document.createElement('span');
  card.id = cardid
  card.className = 'card-base';
  card.style.backgroundImage = `url(${document.getElementById('card-back-img').value})`
  //card.style.transform = transformMatrix; /*靜態*/
  card_backside.className = 'card-backside';

  if (prize) {
    /* 中獎背景+文字 */
    card_backside.style.backgroundImage = `url(${prize.img})`
    card_backside_text.textContent = prize.name
    prizeList.updatePrize(prize.name,cardid)
  }else{
    /* 未中獎背景+文字 */
    card_backside.style.backgroundImage = 'none'
    card_backside_text.textContent = '未中獎'
    prizeList.id=cardid
  }
  prizeList.calculateRatio()
  
  card_surface.className = 'card-surface';
  card_surface.style.backgroundImage = `url(${document.getElementById('card-surface-img').value})`
  card_surface_text.textContent = cardid;
  card_backside.appendChild(card_backside_text)
  card_surface.appendChild(card_surface_text)
  //card.appendChild(card_backside);
  card.appendChild(card_surface);
  container.appendChild(card);


  const finalTransform = parseMatrix3d(transformMatrix)
  const initialTransform = Object.assign({}, finalTransform);
  initialTransform['m41'] *= 8;
  initialTransform['m42'] *= 8;
  initialTransform['m43'] *= 8;

  card_surface.addEventListener('click', function (event) {
    if (cardisopen){ return; }
    if (event.target.className === 'card-surface'){
      const c_show = document.getElementById('cshow')
      const c_show_bt = document.getElementById('card-close')
      c_show.style.backgroundImage = prize ? `url(${prize.img})` : card.style.backgroundImage;
      cardisopen = true
      card.style.display = 'none'
      c_show.appendChild(card_backside_text)
      c_show.style.display = 'flex'
      //animateInit(c_show,100,'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, -0, 0, 11, 0, -40, -80, 500, 1)',x=1,y=3,z=1);/*動態*/
      //animateInit(c_show,100,parseMatrix3d('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, -0, 0, 11, 0, -20, -240, 350, 1)'),parseMatrix3d('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, -0, 0, 11, 0, -20, -40, 350, 1)'));/*動態OBS*/
      animateInit(c_show,100,parseMatrix3d('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, -0, 0, 11, 0, -40, -240, 500, 1)'),parseMatrix3d('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, -0, 0, 11, 0, -40, -80, 500, 1)'));/*動態*/
      c_show_bt.addEventListener('click', function () {
        if (c_show.contains(card_backside_text)) {
          c_show.removeChild(card_backside_text);
        }
        c_show.style.display = 'none';
        cardisopen = false;
      })
      //card_surface.style.display = 'none'
    }
  })
  //animateInit(card,100,transformMatrix);/*動態*/
  animateInit(card,100,initialTransform,finalTransform);/*動態*/
}

function coordinates_transform(a){
  if (a in coordinates){
    for (i=1; i <= coordinates[a].idMap.size ;i++){
      const card = document.getElementById(i.toString())
      const initialTransform = parseMatrix3d(card.style.transform)
      const finalTransform = parseMatrix3d(coordinates[a].getCoordinate(i))
      animateInit(card,100,initialTransform,finalTransform)
    }

  }
}
document.getElementById('Convertm1').addEventListener('click',function(){coordinates_transform('sphere5');})
document.getElementById('Convertm2').addEventListener('click',function(){coordinates_transform('rings');})
document.getElementById('Convertm3').addEventListener('click',function(){coordinates_transform('plane');})

function animateInit(card, steps = 200, initialTransform,finalTransform){
  /*Animate the initial position and the final position*/
  //const finalTransform = parseMatrix3d(transformMatrix);
  //let initialTransform = Object.assign({}, finalTransform);
  //initialTransform['m41'] *= x;/* x初始座標 */
  //initialTransform['m42'] *= y;/* y初始座標 */
  //initialTransform['m43'] *= z;/* z初始座標 */
  const deltaMatrix = calculateDeltaMatrix(finalTransform, initialTransform, steps);
  let step = 0;
  function animate() {
    if (step <= steps) {
      const currentMatrix = interpolateMatrix(initialTransform, deltaMatrix, step);
      const transformString = matrix3dToString(currentMatrix);
      card.style.transform = transformString;
      step++;
      requestAnimationFrame(animate);
    }
  }
  animate();
}


function parseMatrix3d(matrix3d) {
  const match = /matrix3d\((.*)\)/.exec(matrix3d);
  if (match) {
    const values = match[1].split(',').map(parseFloat);
    return {
      m11: values[0], m12: values[1], m13: values[2], m14: values[3],
      m21: values[4], m22: values[5], m23: values[6], m24: values[7],
      m31: values[8], m32: values[9], m33: values[10], m34: values[11],
      m41: values[12], m42: values[13], m43: values[14], m44: values[15]
    };
  }
  return null;
}

function calculateDeltaMatrix(finalMatrix, initialMatrix, steps) {
  const deltaMatrix = {};
  for (const key in finalMatrix) {
    deltaMatrix[key] = (finalMatrix[key] - initialMatrix[key]) / steps;
  }
  return deltaMatrix;
}

function interpolateMatrix(initialMatrix, deltaMatrix, step) {
  const currentMatrix = {};
  for (const key in initialMatrix) {
    currentMatrix[key] = initialMatrix[key] + deltaMatrix[key] * step;
  }
  return currentMatrix;
}

function matrix3dToString(matrix) {
  return `matrix3d(${matrix.m11}, ${matrix.m12}, ${matrix.m13}, ${matrix.m14}, ${matrix.m21}, ${matrix.m22}, ${matrix.m23}, ${matrix.m24}, ${matrix.m31}, ${matrix.m32}, ${matrix.m33}, ${matrix.m34}, ${matrix.m41}, ${matrix.m42}, ${matrix.m43}, ${matrix.m44})`;
}




const container = document.getElementById('cube');
let cubeSize = {w:45,h:80,s:1,r:25,c:1};
let radius = Math.sqrt((cubeSize.r * cubeSize.c * (cubeSize.w*1.1) * (cubeSize.h*1.1) *2 ) / (4 * Math.PI));
document.documentElement.style.setProperty('--width', cubeSize.w + 'px');
document.documentElement.style.setProperty('--height', cubeSize.h + 'px');
let update = false


async function createSphere(mode,r=25,c=1,delay=50) {
  if (update){return;}
  update = true
  await sleep(100)
  container.innerHTML = '';
  prizeList.clear()
  const spacing = cubeSize.w > cubeSize.h ? cubeSize.h*0.1 : cubeSize.w*0.1
  //radius = Math.sqrt((r * c * (cubeSize.w*1.1*cubeSize.s) * (cubeSize.h*1.1*cubeSize.s) *2 ) / (4 * Math.PI));
  radius = Math.sqrt((r * c * (cubeSize.w * cubeSize.s + spacing) * (cubeSize.h * cubeSize.s + spacing) *2 ) / (4 * Math.PI));
  switch (parseInt(mode)) {
    case 1:
      sphere1(r,c,delay)
      break;
    case 2:
      sphere2(r,c,delay)
      break;
    case 3:
      sphere3(r,c,delay)
      break;
    case 4:
      sphere4(r,c,delay)
      break;
    case 5:
      sphere5(r,c,delay)
      break;
    case 6:
      rings(r,c,delay)
      break;
    case 7:
      plane(r,c,delay)
      break;
    default:
      rings(r,c,delay)
  }
}


const globe = document.getElementById('cube');
let isDragging = false;
let previousX = 0;
let previousY = 0;
let zoom = 2;
let distance = 0;
let parallelX = 0;
let parallelY = 0;
let targetRotation = [1, 0, 0, 0];
let currentRotation = [1, 0, 0, 0]; 
let rotation = [0, 0, 0, 1];

const toQuaternion = (axis, angle) => {
  const halfAngle = angle / 2;
  const sinHalfAngle = Math.sin(halfAngle);
  return [
    axis[0] * sinHalfAngle,
    axis[1] * sinHalfAngle,
    axis[2] * sinHalfAngle,
    Math.cos(halfAngle)
  ];
};

const quaternionMultiply = (q1, q2) => {
  return [
    q1[3] * q2[0] + q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1],
    q1[3] * q2[1] - q1[0] * q2[2] + q1[1] * q2[3] + q1[2] * q2[0],
    q1[3] * q2[2] + q1[0] * q2[1] - q1[1] * q2[0] + q1[2] * q2[3],
    q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2]
  ];
};

const quaternionToMatrix = (q) => {
  const [x, y, z, w] = q;
  return [
    1 - 2 * y * y - 2 * z * z, 2 * x * y - 2 * z * w, 2 * x * z + 2 * y * w, 0,
    2 * x * y + 2 * z * w, 1 - 2 * x * x - 2 * z * z, 2 * y * z - 2 * x * w, 0,
    2 * x * z - 2 * y * w, 2 * y * z + 2 * x * w, 1 - 2 * x * x - 2 * y * y, 0,
    parallelX, parallelY, distance, 1
  ];
};

const scene = document.getElementById('scene');

let mouseleft = false
let mouseright = false
scene.addEventListener('mousedown', (event) => {
  if (event.button === 0) {
    mouseleft = true
  }else if(event.button === 2){
    mouseright = true
  }
  isDragging = true;
  previousX = event.clientX;
  previousY = event.clientY;
  globe.style.cursor = 'grabbing';

});

scene.addEventListener('mousemove', (event) => {
  if (!isDragging) return;
  if (mouseleft) {
    const deltaX = event.clientX - previousX;
    const deltaY = event.clientY - previousY;
    const rotateXCheckbox = document.getElementById('y-axis').checked;
    const rotateYCheckbox = document.getElementById('x-axis').checked;
    const rotateZCheckbox = 0
    const axisX = [1, 0, 0];
    const axisY = [0, 1, 0];
    const axisZ = [0, 0, 1];
    let qX, qY, qZ;
    if (rotateXCheckbox) {
      const angleX = deltaY * 0.002;
      qX = toQuaternion(axisX, angleX);
      targetRotation = quaternionMultiply(targetRotation, qX);
    }
    if (rotateYCheckbox) {
      const angleY = -deltaX * 0.002;
      qY = toQuaternion(axisY, angleY);
      targetRotation = quaternionMultiply(targetRotation, qY);
    }
    if (rotateZCheckbox) {
      const angleZ = (deltaX + deltaY) * 0.002;
      qZ = toQuaternion(axisZ, angleZ);
      targetRotation = quaternionMultiply(targetRotation, qZ);
    }
    previousX = event.clientX;
    previousY = event.clientY;
  } else if(mouseright){
    const deltaX = event.clientX - previousX;
    const deltaY = event.clientY - previousY;
    parallelX += deltaX
    parallelY += deltaY
    previousX = event.clientX;
    previousY = event.clientY;
  }
});


scene.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});


function init_XY(){
  const qInverseY = toQuaternion([0, 1, 0], 0);
  const initialRotation = [1, 0, 0, 0];
  targetRotation = quaternionMultiply(initialRotation, qInverseY);
}

function rotate_deg(axis='x',theta=10,reverse=true){
  const _axis={'x':[0, 1, 0],'y':[1, 0, 0],'z':[0, 0, 1]}
  let thRadian = (theta * Math.PI) / 180;
  if (reverse) {thRadian = -thRadian;}
  const qInverse = toQuaternion(_axis[axis], thRadian );
  targetRotation = quaternionMultiply(targetRotation, qInverse);
}


let autoXId
function autoX(reverse=-1){
  stopX()
  if (reverse === 0){ return; }
  const qInverse = toQuaternion([0, 1, 0], reverse * 0.5 / radius);
  targetRotation = quaternionMultiply(targetRotation, qInverse);
  autoXId = (requestAnimationFrame(() => autoX(reverse)));
}
function stopX(){
  if (autoXId !== null) {
    cancelAnimationFrame(autoXId);
    autoXId = null;
  }
}

let autoYId 
function autoY(reverse=-1){
  stopY()
  if (reverse === 0){ return; }
  qInverse = toQuaternion([1, 0, 0], reverse * 0.5 / radius);
  targetRotation = quaternionMultiply(targetRotation, qInverse);
  autoYId = (requestAnimationFrame(() => autoY(reverse)));
}
function stopY(){
  if (autoYId !== null) {
    cancelAnimationFrame(autoYId);
    autoYId = null;
  }
}

let autoZId 
function autoZ(reverse=-1){
  stopZ()
  if (reverse === 0){ return; }
  qInverse = toQuaternion([0, 0, 1], reverse * 0.5 / radius);
  targetRotation = quaternionMultiply(targetRotation, qInverse);
  autoZId = (requestAnimationFrame(() => autoZ(reverse)));
}
function stopZ(){
  if (autoZId !== null) {
    cancelAnimationFrame(autoZId);
    autoZId = null;
  }
}


document.getElementById('initxy').addEventListener('click',()=>{
  init_XY();
})


function updateRotation() {
  currentRotation = slerp(currentRotation, targetRotation, 0.1);
  const matrix = quaternionToMatrix(currentRotation);
  globe.style.transform = `matrix3d(${matrix.join(',')})`;
  globe.style.scale = `${zoom}`;
  requestAnimationFrame(updateRotation);
}
updateRotation();

function slerp(q1, q2, t) {
  let cosTheta = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3];
  if (cosTheta < 0) {
    q2 = q2.map(value => -value);
    cosTheta = -cosTheta;
  }

  if (cosTheta > 0.9999) {
    const result = q1.map((value, index) => value + t * (q2[index] - value));
    const mag = Math.sqrt(result[0]**2 + result[1]**2 + result[2]**2 + result[3]**2);
    return result.map(value => value / mag);
  }

  const theta = Math.acos(cosTheta);
  const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
  const a = Math.sin((1 - t) * theta) / sinTheta;
  const b = Math.sin(t * theta) / sinTheta;

  return [
    a * q1[0] + b * q2[0],
    a * q1[1] + b * q2[1],
    a * q1[2] + b * q2[2],
    a * q1[3] + b * q2[3]
  ];
}

scene.addEventListener('mouseup', () => {
  isDragging = false;
  mouseleft = false;
  mouseright = false;
  globe.style.cursor = 'grab';
});

scene.addEventListener('mouseleave', () => {
  isDragging = false;
  mouseleft = false;
  mouseright = false;
  globe.style.cursor = 'grab';
});

scene.addEventListener('wheel', (event) => {
  if (event.altKey) {
    zoom += event.deltaY * -0.001;
    zoom = Math.max(zoom,1)
  } else {
    distance += event.deltaY * -0.1;
    distance = Math.min(Math.max(-radius * 4, distance), radius * 4 + 200);
  }
});

document.getElementById('vertical').addEventListener('change',function() {
  if(this.checked){
    document.documentElement.style.setProperty('--writing-mode', 'vertical-rl');
  }else{
    document.documentElement.style.setProperty('--writing-mode', 'horizontal-tb');
  }
})

/*
const selectElement = document.getElementById('mode');
selectElement.addEventListener('change', function() {
  const selectedValue = selectElement.value;
  createSphere(selectedValue,cubeSize.r,cubeSize.c);
})
*/
document.getElementById('m1').addEventListener('click',function(){createSphere(5,cubeSize.r,cubeSize.c);})
document.getElementById('m2').addEventListener('click',function(){createSphere(6,cubeSize.r,cubeSize.c);})
document.getElementById('m3').addEventListener('click',function(){createSphere(7,cubeSize.r,cubeSize.c);})


function updateValue(sliderId, valueId) {
  const slider = document.getElementById(sliderId);
  const output = document.getElementById(valueId);
  output.innerHTML = slider.value;
  slider.oninput = function() {
      output.innerHTML = this.value;
      switch (sliderId){
        case 'items_row':
          cubeSize.r = parseInt(this.value);
          //createSphere(document.getElementById('mode').value,cubeSize.r,cubeSize.c);
          break;

        case 'items_col':
          cubeSize.c = parseInt(this.value);
          //createSphere(document.getElementById('mode').value,cubeSize.r,cubeSize.c);
          break;

        case 'items_height':
          cubeSize.h = parseInt(this.value);
          document.documentElement.style.setProperty('--height', cubeSize.s * parseInt(this.value) + 'px');
          break;

        case 'items_width':
          cubeSize.w =  parseInt(this.value);
          document.documentElement.style.setProperty('--width', cubeSize.s * parseInt(this.value) + 'px');
          break;

        case 'items_size':
          cubeSize.s = parseInt(this.value);
          document.documentElement.style.setProperty('--height', cubeSize.h * parseInt(this.value) + 'px');
          document.documentElement.style.setProperty('--width', cubeSize.w * parseInt(this.value) + 'px');
          break;

        case 'X-Rotate':
          autoX(parseInt(this.value));
          break;

        case 'Y-Rotate':
          autoY(parseInt(this.value));
          break;

        case 'Z-Rotate':
          autoZ(parseInt(this.value));
          break;

        case 'Text-Rotate':
          document.documentElement.style.setProperty('--textdeg', parseInt(this.value) + 'deg');
          break;

        case 'Text-Size':
          document.documentElement.style.setProperty('--fone-size', parseInt(this.value) + 'px');
          break;
      }

  }
}

updateValue('items_row', 'row');
updateValue('items_col', 'col');
updateValue('items_size', 'size');
updateValue('items_height', 'height');
updateValue('items_width', 'width');
updateValue('X-Rotate', 'XR');
updateValue('Y-Rotate', 'YR');
updateValue('Z-Rotate', 'ZR');
updateValue('Text-Rotate', 'TR');
updateValue('Text-Size', 'TS');
createSphere();

document.getElementById("menubt").addEventListener("click", function(){
  var menu = document.getElementById('menu');
  if (menu.classList.contains('collapsed')) {
      menu.classList.remove('collapsed');
  } else {
      menu.classList.add('collapsed');
  }
})


document.getElementById("menu").addEventListener("click", function(event) {
  if (event.target.classList.contains("hr-text")) {
      const content = event.target.getAttribute("data-content");
      let sectionId;
      switch (content) {
        case "表格輸入":
          sectionId = "cont7";
          break;
        case "卡片設定":
          sectionId = "cont2";
          break;
        case "建立模式":
          sectionId = "cont1";
          break;
        case "旋轉控制":
          sectionId = "cont3";
          break;
        case "自動旋轉":
          sectionId = "cont4";
          break;
        case "字體方向":
          sectionId = "cont5";
          break;
        case "改變形狀":
          sectionId = "cont6";
          break;
      }

      if (sectionId) {
          const sectionStyle = document.getElementById(sectionId).style;
          sectionStyle.height = sectionStyle.height === '' ? '0px' : '';
      }
  }
});