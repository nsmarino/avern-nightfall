import * as THREE from 'three';

import Component from "./component";
import BattleHandler from "../handlers/battleHandler";

class WorldBattleTrigger extends Component {
    constructor(gameObject, battleContent, worldSceneData) {
        super(gameObject)

        this.removeGameObject = () => gameObject.removeFromScene()

        gameObject.transform.position.copy(worldSceneData.position)

        this.battleContent = battleContent

        const transform = gameObject.transform
        transform.position.y += 1

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshBasicMaterial( {color: 0x00ffff} )
        );

        transform.add(this.mesh)
        this.mesh.name = gameObject.name

        this.playerHasCollided = false
        this.shouldFire = false
        this.mesh.onPlayerCollide = this.onPlayerCollide.bind(this)
    }

    onPlayerCollide() {
        if (!this.playerHasCollided) {
            this.shouldFire = true
            this.playerHasCollided = true
        }
    }

    update() {
        if (this.shouldFire) new BattleHandler(this.battleContent, this.removeGameObject)
        if (this.playerHasCollided) this.shouldFire = false
        this.mesh.rotateY(-0.01)
    }
}

export default WorldBattleTrigger