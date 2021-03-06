
import {ElementRef, Injectable, NgZone} from '@angular/core'
import {
  Engine,
  FreeCamera,
  ArcRotateCamera,
  Scene,
  Light,
  Mesh,
  Color3,
  Color4,
  Vector3,
  HemisphericLight,
  StandardMaterial,
  Texture,
  DynamicTexture,
  Space,
  MeshBuilder
} from '@babylonjs/core'

@Injectable({ providedIn: 'root' })
export class EngineService {
  private canvas: HTMLCanvasElement
  private engine: Engine
  private camera: ArcRotateCamera
  private scene: Scene
  private light: Light

  private item: Mesh

  public constructor(
    private ngZone: NgZone
  ) {}

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement

    // Then, load the Babylon 3D engine:
    this.engine = new Engine(this.canvas,  true)

    // create a basic BJS Scene object
    this.scene = new Scene(this.engine)
    // this.scene.clearColor = new Color4(0, 0, 0, 0)

    this.camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(10, 0, 20), this.scene)

    // target the camera to scene origin
    this.camera.setTarget(Vector3.Zero())

    // attach the camera to the canvas
    this.camera.attachControl(this.canvas, false)

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    this.light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene)

    const ground = MeshBuilder.CreateGround("ground", {width:10, height:10})

    // create a built-in "item" shape its constructor takes 4 params: name, subdivisions, radius, scene
    // this.item= Mesh.Createitem('item', 16, 2, this.scene)
    this.item = MeshBuilder.CreateBox("box", {})
    // create the material with its texture for the item and assign it to the item
    const spherMaterial = new StandardMaterial('sun_surface', this.scene)
    spherMaterial.diffuseTexture = new Texture('assets/textures/sun.jpg', this.scene)
    this.item.material = spherMaterial

    // move the item upward 1/2 of its height
    this.item.position.y = 0.5

    // simple rotation along the y axis
    this.scene.registerAfterRender(() => {
      this.item.rotate (
        new Vector3(0, 1, 0),
        0.02,
        Space.LOCAL
      )
    })

    // generates the world x-y-z axis for better understanding
    this.showWorldAxis(8)
  }

  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
      const rendererLoopCallback = () => {
        this.scene.render()
      }

      if (window.document.readyState !== 'loading') {
        this.engine.runRenderLoop(rendererLoopCallback)
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.engine.runRenderLoop(rendererLoopCallback)
        })
      }

      window.addEventListener('resize', () => {
        this.engine.resize()
      })
    })
  }

  /**
   * creates the world axes
   *
   * Source: https://doc.babylonjs.com/snippets/world_axes
   *
   * @param size number
   */
  public showWorldAxis(size: number): void {

    const makeTextPlane = (text: string, color: string, textSize: number) => {
      const dynamicTexture = new DynamicTexture('DynamicTexture', 50, this.scene, true)
      dynamicTexture.hasAlpha = true
      dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color , 'transparent', true)
      const plane = Mesh.CreatePlane('TextPlane', textSize, this.scene, true)
      const material = new StandardMaterial('TextPlaneMaterial', this.scene)
      material.backFaceCulling = false
      material.specularColor = new Color3(0, 0, 0)
      material.diffuseTexture = dynamicTexture
      plane.material = material

      return plane
    }

    const axisX = Mesh.CreateLines(
      'axisX',
      [
        Vector3.Zero(),
        new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
        new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
      ],
      this.scene
    )

    axisX.color = new Color3(1, 0, 0)
    const xChar = makeTextPlane('X', 'red', size / 10)
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0)

    const axisY = Mesh.CreateLines(
      'axisY',
      [
        Vector3.Zero(), new Vector3(0, size, 0), new Vector3( -0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0), new Vector3( 0.05 * size, size * 0.95, 0)
      ],
      this.scene
    )

    axisY.color = new Color3(0, 1, 0)
    const yChar = makeTextPlane('Y', 'green', size / 10)
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size)

    const axisZ = Mesh.CreateLines(
      'axisZ',
      [
        Vector3.Zero(), new Vector3(0, 0, size), new Vector3( 0 , -0.05 * size, size * 0.95),
        new Vector3(0, 0, size), new Vector3( 0, 0.05 * size, size * 0.95)
      ],
      this.scene
    )

    axisZ.color = new Color3(0, 0, 1)
    const zChar = makeTextPlane('Z', 'blue', size / 10)
    zChar.position = new Vector3(0, 0.05 * size, 0.9 * size)
  }
}
