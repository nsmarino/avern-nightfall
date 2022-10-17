import inputHandler from "../../handlers/inputHandler";
import Component from "../component";

class CameraManager extends Component {
    constructor(gameObject) {
        super(gameObject)
        this.camera = null
    }
    setCamera(camera) {
        this.camera = camera
        this.camera.updateProjectionMatrix()
    }

    resetCameraAngle() {
        this.camera.parent.rotation.x = 0
    }

    update() {
        const inputs = inputHandler.getInputs()
        if (inputs.resetCam) {
            this.resetCameraAngle()
        }
    }
}

export default CameraManager