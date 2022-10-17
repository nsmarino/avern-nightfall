import { SafeArray } from "../helpers"
import GameObject from "../gameObjects/gameObject"

class GameObjectsHandler {
    constructor() {
      this.gameObjects = new SafeArray();
    }
    
    createGameObject(parent, name) {
      const gameObject = new GameObject(parent, name);
      this.gameObjects.add(gameObject);
      return gameObject;
    }

    removeGameObject(gameObject) {
      this.gameObjects.remove(gameObject);
    }

    getGameObjectByName(name) {
      return this.gameObjects.findByName(name);
    }

    // might be useful to have both of these for now, going to keep everything non-player 
    // that should normally be preserved between scenes as components on the manager gameObject
    removeAllGameObjectsExceptPlayer() {
      this.gameObjects.forEach(gameObject => {
        if (gameObject.name !== "player") this.removeGameObject(gameObject)
      })
    }
    removeAllGameObjectsExceptPlayerAndManager() {
      this.gameObjects.forEach(gameObject => {
        if (gameObject.name !== "player" && gameObject.name !== "manager") this.removeGameObject(gameObject)
      })
    }

    update(delta) {
      this.gameObjects.forEach(gameObject => gameObject.update(delta));
    }
  }

const gameObjectsHandler = new GameObjectsHandler()

export default gameObjectsHandler


