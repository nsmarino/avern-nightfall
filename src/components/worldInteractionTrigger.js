import * as THREE from 'three';
import gameObjectsHandler from '../handlers/gameObjectsHandler';

import uiHandler from "../handlers/uiHandler"
import Component from "./component";
import Interaction from './managers/Interaction';

class WorldInteractionTrigger extends Component {
    constructor(gameObject, interactionContent, worldSceneData) {
        super(gameObject)

        gameObject.transform.position.copy(worldSceneData.position)

        this.interactionContent = interactionContent

        const transform = gameObject.transform
        transform.position.y += 1

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshBasicMaterial( {color: 0x00ff00} )
        );
        transform.add(this.mesh)
        this.mesh.name = gameObject.name

        this.mesh.onPlayerAction = this.onPlayerAction.bind(this)
        this.mesh.onPlayerLook = this.onPlayerLook.bind(this)

        this.prompt = "Talk"
        this.handler = null
    }

    onPlayerLook() {
        uiHandler.showPrompt(this.prompt)
    }

    onPlayerAction() {
        const interactionManager = gameObjectsHandler.getGameObjectByName("manager").getComponent(Interaction)
        interactionManager.open(this.interactionContent)
    }

    update() {
        this.mesh.rotateY(0.01)
    }
}

export default WorldInteractionTrigger
