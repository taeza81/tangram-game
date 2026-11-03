/**
 * tangram-data.js - 칠교놀이의 왕(Tangram King) 스타일 확장 데이터셋
 * 카테고리별 테마 퍼즐 (기하 도형, 동물, 사물/탈것) 및 280x280 정밀 좌표계
 */

const TANGRAM_PIECES_DEF = {
  'large-tri-1': {
    id: 'large-tri-1',
    name: '큰 삼각형 ①',
    colorName: '빨강',
    type: 'large-triangle',
    color: '#FF5757',
    borderColor: '#C42B2B',
    boardWidth: 280,
    boardHeight: 140,
    svgPoints: "0,140 280,140 140,0",
    viewBox: "0 0 280 140"
  },
  'large-tri-2': {
    id: 'large-tri-2',
    name: '큰 삼각형 ②',
    colorName: '파랑',
    type: 'large-triangle',
    color: '#38B6FF',
    borderColor: '#0284C7',
    boardWidth: 280,
    boardHeight: 140,
    svgPoints: "0,140 280,140 140,0",
    viewBox: "0 0 280 140"
  },
  'med-tri': {
    id: 'med-tri',
    name: '중간 삼각형',
    colorName: '초록',
    type: 'medium-triangle',
    color: '#10B981',
    borderColor: '#047857',
    boardWidth: 198,
    boardHeight: 99,
    svgPoints: "0,99 198,99 99,0",
    viewBox: "0 0 198 99"
  },
  'small-tri-1': {
    id: 'small-tri-1',
    name: '작은 삼각형 ①',
    colorName: '노랑',
    type: 'small-triangle',
    color: '#FBBF24',
    borderColor: '#D97706',
    boardWidth: 140,
    boardHeight: 70,
    svgPoints: "0,70 140,70 70,0",
    viewBox: "0 0 140 70"
  },
  'small-tri-2': {
    id: 'small-tri-2',
    name: '작은 삼각형 ②',
    colorName: '보라',
    type: 'small-triangle',
    color: '#A855F7',
    borderColor: '#7E22CE',
    boardWidth: 140,
    boardHeight: 70,
    svgPoints: "0,70 140,70 70,0",
    viewBox: "0 0 140 70"
  },
  'square': {
    id: 'square',
    name: '정사각형',
    colorName: '주황',
    type: 'square',
    color: '#FB923C',
    borderColor: '#EA580C',
    boardWidth: 99,
    boardHeight: 99,
    svgPoints: "0,0 99,0 99,99 0,99",
    viewBox: "0 0 99 99"
  },
  'para': {
    id: 'para',
    name: '평행사변형',
    colorName: '청록',
    type: 'parallelogram',
    color: '#14B8A6',
    borderColor: '#0F766E',
    boardWidth: 210,
    boardHeight: 70,
    svgPoints: "0,70 140,70 210,0 70,0",
    viewBox: "0 0 210 70"
  }
};

// 테마별 스테이지 구성 (기하 도형, 동물, 사물)
const TANGRAM_PUZZLES = [
  // [테마 1: 기본 기하 도형]
  {
    id: 'square-puzzle',
    category: '기하도형',
    name: '정사각형',
    desc: '칠교 7조각을 모아 원래의 커다란 정사각형을 완성해 보세요.',
    silhouettePath: 'assets/silhouettes/silhouette-square.svg',
    targets: {
      'large-tri-1': { x: 140, y: 70,  rot: 180, flip: 1 },
      'large-tri-2': { x: 70,  y: 140, rot: 90,  flip: 1 },
      'med-tri':     { x: 210, y: 210, rot: 315, flip: 1 },
      'small-tri-1': { x: 210, y: 105, rot: 180, flip: 1 },
      'square':      { x: 140, y: 210, rot: 45,  flip: 1 },
      'small-tri-2': { x: 70,  y: 245, rot: 0,   flip: 1 },
      'para':        { x: 245, y: 140, rot: 90,  flip: 1 }
    }
  },
  {
    id: 'triangle-puzzle',
    category: '기하도형',
    name: '거대한 삼각형',
    desc: '칠교 조각을 모두 모아 하나의 커다란 직각삼각형을 만들어 보세요.',
    silhouettePath: 'assets/silhouettes/silhouette-triangle.svg',
    targets: {
      'large-tri-1': { x: 90,  y: 190, rot: 0,   flip: 1 },
      'large-tri-2': { x: 190, y: 190, rot: 0,   flip: 1 },
      'med-tri':     { x: 140, y: 90,  rot: 180, flip: 1 },
      'small-tri-1': { x: 105, y: 130, rot: 0,   flip: 1 },
      'small-tri-2': { x: 175, y: 130, rot: 0,   flip: 1 },
      'square':      { x: 140, y: 150, rot: 0,   flip: 1 },
      'para':        { x: 140, y: 225, rot: 0,   flip: 1 }
    }
  },
  {
    id: 'trapezoid-puzzle',
    category: '기하도형',
    name: '사다리꼴',
    desc: '아랫변이 넓고 윗변이 평평한 사다리꼴을 만들어 보세요.',
    silhouettePath: 'assets/silhouettes/silhouette-square.svg',
    targets: {
      'large-tri-1': { x: 90,  y: 150, rot: 0,   flip: 1 },
      'large-tri-2': { x: 190, y: 150, rot: 0,   flip: 1 },
      'med-tri':     { x: 140, y: 70,  rot: 180, flip: 1 },
      'small-tri-1': { x: 70,  y: 70,  rot: 180, flip: 1 },
      'small-tri-2': { x: 210, y: 70,  rot: 180, flip: 1 },
      'square':      { x: 140, y: 200, rot: 45,  flip: 1 },
      'para':        { x: 140, y: 120, rot: 0,   flip: 1 }
    }
  },

  // [테마 2: 동물 친구들]
  {
    id: 'fish-puzzle',
    category: '동물',
    name: '헤엄치는 물고기',
    desc: '지느러미를 흔들며 바닷속을 헤엄치는 귀여운 물고기입니다.',
    silhouettePath: 'assets/silhouettes/silhouette-fish.svg',
    targets: {
      'large-tri-1': { x: 110, y: 110, rot: 45,  flip: 1 },
      'large-tri-2': { x: 110, y: 175, rot: 135, flip: 1 },
      'med-tri':     { x: 220, y: 140, rot: 90,  flip: 1 },
      'small-tri-1': { x: 175, y: 90,  rot: 0,   flip: 1 },
      'small-tri-2': { x: 175, y: 195, rot: 180, flip: 1 },
      'square':      { x: 150, y: 140, rot: 0,   flip: 1 },
      'para':        { x: 55,  y: 140, rot: 45,  flip: 1 }
    }
  },
  {
    id: 'swan-puzzle',
    category: '동물',
    name: '호수의 백조 (새)',
    desc: '우아하게 목을 세우고 물 위를 떠다니는 아름다운 백조입니다.',
    silhouettePath: 'assets/silhouettes/silhouette-fish.svg',
    targets: {
      'large-tri-1': { x: 140, y: 180, rot: 0,   flip: 1 },
      'large-tri-2': { x: 200, y: 180, rot: 180, flip: 1 },
      'med-tri':     { x: 90,  y: 130, rot: 90,  flip: 1 },
      'small-tri-1': { x: 70,  y: 60,  rot: 0,   flip: 1 },
      'small-tri-2': { x: 140, y: 120, rot: 180, flip: 1 },
      'square':      { x: 70,  y: 90,  rot: 45,  flip: 1 },
      'para':        { x: 240, y: 180, rot: 45,  flip: 1 }
    }
  },
  {
    id: 'fox-puzzle',
    category: '동물',
    name: '영리한 여우',
    desc: '쫑긋한 귀와 날렵한 꼬리를 가진 귀여운 아기 여우입니다.',
    silhouettePath: 'assets/silhouettes/silhouette-fish.svg',
    targets: {
      'large-tri-1': { x: 140, y: 140, rot: 90,  flip: 1 },
      'large-tri-2': { x: 140, y: 210, rot: 270, flip: 1 },
      'med-tri':     { x: 220, y: 190, rot: 0,   flip: 1 },
      'small-tri-1': { x: 80,  y: 70,  rot: 0,   flip: 1 },
      'small-tri-2': { x: 130, y: 70,  rot: 0,   flip: 1 },
      'square':      { x: 105, y: 105, rot: 45,  flip: 1 },
      'para':        { x: 60,  y: 190, rot: 90,  flip: 1 }
    }
  },

  // [테마 3: 사물과 탈것]
  {
    id: 'house-puzzle',
    category: '사물',
    name: '아늑한 집',
    desc: '지붕과 벽, 굴뚝이 어우러진 따뜻한 우리 집 모양입니다.',
    silhouettePath: 'assets/silhouettes/silhouette-house.svg',
    targets: {
      'large-tri-1': { x: 140, y: 65,  rot: 0,   flip: 1 },
      'large-tri-2': { x: 95,  y: 175, rot: 90,  flip: 1 },
      'med-tri':     { x: 185, y: 175, rot: 270, flip: 1 },
      'small-tri-1': { x: 55,  y: 75,  rot: 180, flip: 1 },
      'small-tri-2': { x: 140, y: 225, rot: 180, flip: 1 },
      'square':      { x: 140, y: 165, rot: 45,  flip: 1 },
      'para':        { x: 140, y: 120, rot: 0,   flip: 1 }
    }
  },
  {
    id: 'boat-puzzle',
    category: '사물',
    name: '바다의 돛단배',
    desc: '바람을 가르며 파도 위를 달리는 멋진 돛단배입니다.',
    silhouettePath: 'assets/silhouettes/silhouette-house.svg',
    targets: {
      'large-tri-1': { x: 110, y: 100, rot: 270, flip: 1 },
      'large-tri-2': { x: 180, y: 120, rot: 90,  flip: 1 },
      'med-tri':     { x: 140, y: 210, rot: 180, flip: 1 },
      'small-tri-1': { x: 140, y: 50,  rot: 0,   flip: 1 },
      'small-tri-2': { x: 70,  y: 210, rot: 0,   flip: 1 },
      'square':      { x: 210, y: 210, rot: 45,  flip: 1 },
      'para':        { x: 140, y: 250, rot: 0,   flip: 1 }
    }
  }
];

// 1단계 기본 도형 데이터
const BASIC_SHAPES_DATA = [
  {
    id: 'basic-circle',
    name: '동그라미 (원)',
    colorName: '빨강',
    color: '#FF5757',
    borderColor: '#C42B2B',
    shapeType: 'circle',
    asset: 'assets/shapes/circle.svg',
    slotAsset: 'assets/silhouettes/slot-circle.svg'
  },
  {
    id: 'basic-triangle',
    name: '세모 (삼각형)',
    colorName: '파랑',
    color: '#38B6FF',
    borderColor: '#1075B3',
    shapeType: 'triangle',
    asset: 'assets/shapes/triangle.svg',
    slotAsset: 'assets/silhouettes/slot-triangle.svg'
  },
  {
    id: 'basic-square',
    name: '네모 (정사각형)',
    colorName: '초록',
    color: '#52D16C',
    borderColor: '#258238',
    shapeType: 'square',
    asset: 'assets/shapes/square.svg',
    slotAsset: 'assets/silhouettes/slot-square.svg'
  }
];

window.TANGRAM_PIECES_DEF = TANGRAM_PIECES_DEF;
window.TANGRAM_PUZZLES = TANGRAM_PUZZLES;
window.BASIC_SHAPES_DATA = BASIC_SHAPES_DATA;
