import * as THREE from 'three';
import gameObjectsHandler from '../../handlers/gameObjectsHandler';

import uiHandler from "../../handlers/uiHandler"
import Component from ".././component";

class Enemy extends Component {
    constructor(gameObject, interactionContent, worldSceneData) {
        super(gameObject)

        gameObject.transform.position.copy(worldSceneData.position)

        this.interactionContent = interactionContent

        const transform = gameObject.transform
        transform.position.y += 1

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshBasicMaterial( {color: 0x990000} )
        );
        transform.add(this.mesh)
        this.mesh.name = gameObject.name
    }

    update() {
        this.mesh.rotateY(0.01)
    }
}

export default Enemy
