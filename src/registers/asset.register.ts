import { Register, Registerable } from 'src/registers/register'
import { Assets, Sprite, Texture } from 'pixi.js'
import { Sound } from '@pixi/sound'

export class Asset extends Registerable<AssetRegister> {
  public isLoaded = false

  public constructor(
    public readonly name: string,
    public readonly path: string,
  ) {
    super()
  }

  public load() {
    return Assets.load(this.path).then((asset) => {
      this.isLoaded = true
      return asset
    })
  }

  public register(register: AssetRegister) {
    Assets.add(this.name, this.path)
  }

  public deregister(register: AssetRegister) {
    Assets.unload(this.path).then(() => {
      this.isLoaded = false
    })
  }

  public toTexture() {
    return new Texture(Assets.get(this.path))
  }

  public toSprite() {
    return new Sprite(this.toTexture())
  }

  public toSound() {
    const sound = Sound.from(this.path)

    sound.volume = 0.5
    sound.autoPlay = false

    return sound
  }
}

export class AssetRegister extends Register<Asset> {
  public async initialize() {
    await this.loadAll()
  }

  public get(name: string) {
    return this.modules.find((a) => a.name === name)
  }

  public getMany(names: string[]) {
    return this.modules.filter((a) => names.includes(a.name))
  }

  public get loaded() {
    return this.modules.filter((a) => a.isLoaded).length
  }

  public get total() {
    return this.modules.length
  }

  public get progress() {
    return this.loaded / this.total
  }

  public get loadingComplete() {
    return this.loaded === this.total
  }

  public get progressAsPercentage() {
    return Math.floor(this.progress * 100)
  }

  public get currentlyLoadingAsset() {
    return this.modules[this.loaded]
  }

  public getPath(name: string) {
    const asset = this.get(name)
    if (!asset) {
      throw new Error(`Asset ${name} not found`)
    }
    return asset.path
  }

  public load(name: string) {
    const asset = this.get(name)
    if (!asset) {
      throw new Error(`Asset ${name} not found`)
    }

    return asset.load()
  }

  public async loadAll() {
    for (const asset of this.modules) {
      await asset.load()
    }
  }
}
