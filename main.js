
const Config = {
  Screen: {
    Width: 320,
    Height: 320,
    BackGroundColor: 0x000000,
  }
}
const Resource = {
  Actor: 'image/player.png',
  MapTile: 'image/indoor_tiles.png',
  MapData: 'map/map.json',
  PauseBtn: 'image/pausebutton.png',
  Bgm: 'audio/rescue.mp3',
  Pause: 'audio/pause.mp3',
  Jump: 'audio/jet.mp3',
  GabolinData: 'image/gabolin.json',
}

const assets = [];
for (let key in Resource) {
  assets.push(Resource[key]);
}
  
let core;

//ブラウザロード完了からスタート
window.onload = () => {
  core = new Game(Config.Screen.Width, Config.Screen.Height, Config.Screen.BackGroundColor);
  core.preload(assets);
  core.onload = () => {
    core.replaceScene(new MainScene());
  }
}

let map;
let player;

class MainScene extends Container {
  constructor(){
    super();
    this.interactive = true;

    core.app.renderer.backgroundColor = 0xff0000;//背景色変更

    //タイルマップ作成
    map = new TileMap();
    map.image = core.resources[Resource.MapTile].texture;
    this.addChild(map);
    let data = core.resources[Resource.MapData].data;
    const sizes = {
      tileColumns: data.width,//横のタイルの数
      tileRows: data.height,//縦のタイルの数
      tileWidth: data.tilewidth,//タイルの幅
      tileHeight: data.tileheight,//タイルの高さ
    }
    map.setSizes(sizes);
    const mapData = [];
    data = core.resources[Resource.MapData].data.layers[0].data;
    for(let i = 0; i < data.length; i++){
      mapData[i] = data[i] - 1;//TiledMapEditorの画像番号が1からなので-1(0からならframeNumberと同じになる)
    }
    map.createMap(mapData);

    const gabo = new Gabolin();
    gabo.position.set(144, 144);
    map.addChild(gabo);

    //プレイヤー
    player = new Player(32, 32);
    player.position.set(48, 32);
    map.addChild(player);

    this.on("pointerdown", () => {
      player.touchAction();
    });
    
    //ポーズボタン
    const pauseBtn = new Sprite();
    pauseBtn.texture = core.resources[Resource.PauseBtn].texture;
    pauseBtn.position.set(8, 8)
    this.addChild(pauseBtn);
    pauseBtn.interactive = true;

    core.resources[Resource.Bgm].sound.loop = true;
    core.resources[Resource.Bgm].sound.volume = 0.2;
    core.resources[Resource.Bgm].sound.play();
    //core.sound.play(Resource.Bgm);こっちでもできる

    pauseBtn.on("pointerdown", (e) => {
      e.stopPropagation();//eventの伝播を止める(これが無いとジャンプする)
      core.pausePlayingSounds();
      core.resources[Resource.Pause].sound.play();
      core.pushScene(new PauseScene());
    });
  }
  update(delta){
    super.update(delta);
  }
}
class Gabolin extends Sprite {
  constructor(){
    super();
    this.texture = core.resources[Resource.GabolinData].textures['player-0'];
    this.frameNumber = 0;
  }
  update(delta){
    super.update(delta);
    if(this.age % 15 == 0){
      if(++this.frameNumber > 13) this.frameNumber = 0;
      this.texture = core.resources[Resource.GabolinData].textures['player-' + this.frameNumber];
    }
  }
}
class Player extends EnchantSprite {
  constructor(width, height){
    super(width, height);
    this.interactive = true;
    this.remainderY = 0;//座標の小数点以下
    this.remainderX = 0;//座標の小数点以下
    this.anchor.set(0.5, 0.5);
    this.walkAnime = [0, 1, 2, 1];
    this.animeCount = 0;
    this.isOnground = false;
    this.vy = 0;
    this.vx = 0.7;
    this.image = core.resources[Resource.Actor].texture; 
  }
  touchAction(){
    if(!this.isOnground)return;
    core.resources[Resource.Jump].sound.play();
    this.vy = -4;
    this.scale.x *= -1;
    this.vx *= -1;    
  }
  //座標から小数点以下を切り分ける(ノイズ対策)
  separateNumAfterDP(){
    this.remainderX = this.x - (this.x | 0);
    this.remainderY = this.y - (this.y | 0);
    this.x = this.x | 0;
    this.y = this.y | 0;
  } 
    
  //座標に小数点以下を戻す(ノイズ対策)
  backNumAfterDP(){
    this.x += this.remainderX;
    this.y += this.remainderY;
  }

  update(delta){
    super.update(delta);
    this.backNumAfterDP();
    this.x += this.vx;
    if(this.x < 0 || this.x > Config.Screen.Width){
      this.vx *= -1; 
      this.scale.x *= -1;
    }
    this.isOnground = false;
    this.vy += 0.1;
    if(this.vy > 6) this.vy = 6;
    this.y += this.vy;
    if(this.y > 240) {
      this.y = 240;
      this.isOnground = true;
    } 
    if(this.isOnground){
      if(this.age % 10 == 0){
        if(++this.animeCount >= this.walkAnime.length) this.animeCount = 0;
        this.frameNumber = this.walkAnime[this.animeCount];
      }
    }else{
      this.frameNumber = 4;
    }
    this.separateNumAfterDP();
  }
}

class PauseScene extends Container {
  constructor(){
    super();
    this.interactive = true;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000);
    bg.drawRect(0, 0, Config.Screen.Width, Config.Screen.Height);
    bg.endFill();
    const texture = PIXI.RenderTexture.create({width: Config.Screen.Width, height: Config.Screen.Height});
    core.app.renderer.render(bg, texture);
    const backGround = new PIXI.Sprite(texture);
    backGround.alpha = 0.4;
    this.addChild(backGround);

    const t = new PIXI.Text('PAUSE', new PIXI.TextStyle({
      fontFamily: 'sans-serif',
      fontSize: 32,
      fill: 0xffffff,
    }));
    t.anchor.set(0.5, 0.5);
    t.position.set(Config.Screen.Width*0.5, Config.Screen.Height*0.5);
    this.addChild(t);

    this.on('pointerdown', () => {
      core.resumePausedSounds();
      core.popScene();
    });
  }
}

