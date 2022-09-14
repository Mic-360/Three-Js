import { Quaternion, Vector3 } from "three";
import { OrbitControls } from "@three-ts/orbit-controls";
import { A, D, DIRECTIONS, S, W } from "./keys";

export class Controller {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  animationsMap: Map<string, THREE.AnimationAction> = new Map();
  orbitControl: OrbitControls;
  camera: THREE.Camera;

  toggleRun: boolean = true;
  currentAction: string;

  walkDirection = new Vector3();
  rotateAngle = new Vector3(0, 1, 0);
  rotateQuarternion: Quaternion = new Quaternion();
  cameraTarget = new Vector3();

  fadeDuration: number = 0.2;
  runVelocity = 20;
  walkVelocity = 10;

  constructor(
    model: THREE.Group,
    mixer: THREE.AnimationMixer,
    animationsMap: Map<string, THREE.AnimationAction>,
    orbitControl: OrbitControls,
    camera: THREE.Camera,
    currentAction: string
  ) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.currentAction = currentAction;
    this.animationsMap.forEach((value, key) => {
      if (key == currentAction) {
        value.play();
      }
    });
    this.orbitControl = orbitControl;
    this.camera = camera;
    this.updateCameraTarget(0, 0);
  }

  public switchRunToggle() {
    this.toggleRun = !this.toggleRun;
  }

  public update(delta: number, keysPressed: any) {
    const directionPressed = DIRECTIONS.some((key) => keysPressed[key] == true);

    var play = "";
    if (directionPressed && this.toggleRun) {
      play = "Run";
    } else if (directionPressed) {
      play = "Walk";
    } else {
      play = "Idle";
    }

    if (this.currentAction != play) {
      const toPlay = this.animationsMap.get(play) as THREE.AnimationAction;
      const current = this.animationsMap.get(
        this.currentAction
      ) as THREE.AnimationAction;

      current.fadeOut(this.fadeDuration);
      toPlay.reset().fadeIn(this.fadeDuration).play();

      this.currentAction = play;
    }

    this.mixer.update(delta);

    if (this.currentAction == "Run" || this.currentAction == "Walk") {
      var angleYCameraDirection = Math.atan2(
        this.camera.position.x - this.model.position.x,
        this.camera.position.z - this.model.position.z
      );
      var directionOffset = this.directionOffset(keysPressed);

      this.rotateQuarternion.setFromAxisAngle(
        this.rotateAngle,
        angleYCameraDirection + directionOffset
      );
      this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2);

      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.y = 0;
      this.walkDirection.normalize();
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

      const velocity =
        this.currentAction == "Run" ? this.runVelocity : this.walkVelocity;

      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;
      this.model.position.x += moveX;
      this.model.position.z += moveZ;
      this.updateCameraTarget(moveX, moveZ);
    }
  }

  private updateCameraTarget(moveX: number, moveZ: number) {
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;

    this.cameraTarget.x = this.model.position.x;
    this.cameraTarget.y = this.model.position.y + 1;
    this.cameraTarget.z = this.model.position.z;
    this.orbitControl.target = this.cameraTarget;
  }

  private directionOffset(keysPressed: any) {
    var directionOffset = 0;

    if (keysPressed[W]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4;
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4;
      }
    } else if (keysPressed[S]) {
      if (keysPressed[A]) {
        directionOffset = Math.PI / 4 + Math.PI / 2;
      } else if (keysPressed[D]) {
        directionOffset = -Math.PI / 4 - Math.PI / 2;
      } else {
        directionOffset = Math.PI;
      }
    } else if (keysPressed[A]) {
      directionOffset = Math.PI / 2;
    } else if (keysPressed[D]) {
      directionOffset = -Math.PI / 2;
    }

    return directionOffset;
  }
}
