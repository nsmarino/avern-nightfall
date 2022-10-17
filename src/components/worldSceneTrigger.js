import * as THREE from 'three';

import sceneHandler from "../handlers/sceneHandler";
import uiHandler from "../handlers/uiHandler"
import Component from "./component";

// Load new world scene
class WorldSceneTrigger extends Component {
    constructor(gameObject, connectionId, worldSceneData) {
        super(gameObject)

        gameObject.transform.position.copy(worldSceneData.position)

        this.connectionId = connectionId

        const transform = gameObject.transform
        transform.position.y -= 1

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(2,2,2),
            new THREE.MeshBasicMaterial( {color: 0xffff00} )
        );
        transform.add(this.mesh)

        this.mesh.onPlayerAction = this.onPlayerAction.bind(this)
        this.mesh.onPlayerLook = this.onPlayerLook.bind(this)

        this.prompt = `Go to ${this.connectionId}`
    }

    onPlayerLook() {
        uiHandler.showPrompt(this.prompt)
    }

    onPlayerAction() {
        sceneHandler.switchWorldStages(this.connectionId)
    }

    update() {
        this.mesh.rotateY(0.01)
    }
}

export default WorldSceneTrigger