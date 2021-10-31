/***********************************************
 * タイルマップ用のクラス
 ***********************************************/
 class TileMap extends Container {
  constructor(){
    super();
    this.tileWidth = 16;//タイルの幅
    this.tileHeight = 16;//タイルの高さ
    this.tileColumns = 16;//横のタイルの数
    this.tileRows = 16;//縦のタイルの数
    this.mapWidth = this.tileColumns * this.tileWidth;//マップの幅(ドット)
    this.mapHeight = this.tileRows * this.tileHeight;//マップの高さ(ドット)
  }

  //マップの各サイズをセットする(変えたいプロパティだけでOK)
  setSizes(data){
    if(data.tileWidth)this.tileWidth = data.tileWidth;
    if(data.tileHeight)this.tileHeight = data.tileHeight;
    if(data.tileColumns)this.tileColumns = data.tileColumns;
    if(data.tileRows)this.tileRows = data.tileRows;
    this.mapWidth = this.tileColumns * this.tileWidth;
    this.mapHeight = this.tileRows * this.tileHeight;
  }
  //マップデータを読み込んでマップを作成する
  //マイナスの値の所は無し(0以上でスプライトを作る)
  createMap(data){
    this.mapHeight = (data.length / this.tileColumns | 0) * this.tileHeight; //マップの高さを算出
    this.mapSprites = [];
    let sprites = this.mapSprites;
    for(let i = 0; i < data.length; i++){
      if(data[i] < 0){
        sprites[i] = null;
        continue;
      }
      sprites[i] = new EnchantSprite(this.tileWidth, this.tileHeight);
      sprites[i].image = this._image;
      sprites[i].frameNumber = data[i];
      //表示位置
      const x = i % this.tileColumns * this.tileWidth;
      const y = (i / this.tileColumns | 0) * this.tileHeight;
      sprites[i].position.set(x, y);
      this.addChild(sprites[i]);
    }
  }
  //画像データのセット
  set image(data) {
    this._image = data;
    //スプライトのテクスチャーを変える
    const sprites = this.mapSprites;
    if(!sprites)return;
    for(let i = 0; i < sprites.length; i++){
      if(sprites[i]){
        sprites[i].image = data;
      }
    }
  }
}
