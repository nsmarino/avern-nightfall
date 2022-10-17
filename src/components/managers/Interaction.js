import gsap from "gsap"

// could these all be on MANAGER?
import inputHandler from "../../handlers/inputHandler";
import gameObjectsHandler from "../../handlers/gameObjectsHandler";
import uiHandler from "../../handlers/uiHandler";
import Component from "../component";
import Player from "../player/Player";
import PlayerData from "../player/PlayerData";

class Interaction extends Component {
    constructor(gameObject) {
        super(gameObject)

        this.active = false

        this.ui = document.querySelector("#narrative-controller")
        this.textContainer = document.querySelector("#narrative-controller .text-container")

        this.index = 0
    }

    displayNode(node) {
        this.textContainer.innerHTML = ''
        const textWrapper = document.createElement("p")
        gsap.set(this.textContainer, { opacity: 0})
        textWrapper.innerHTML = node.text
        this.textContainer.appendChild(textWrapper)
        gsap.to(this.textContainer, {opacity: 1})

        if (node.item) {
            const playerData = gameObjectsHandler.getGameObjectByName("player").getComponent(PlayerData)
            if (!playerData.hasInventoryItem(node.item)) playerData.addToInventory(node.item)
        }
    }

    open(content) {
        if (this.content) return
        this.active = true
        this.content = content
        uiHandler.clearPrompt()
        this.displayNode(this.content[this.index])
        gsap.to(this.ui, {autoAlpha: 1, pointerEvents: "auto"})
    }
    close() {
        this.active = false
        this.index = 0
        this.content = null
        gsap.to(this.ui, {autoAlpha: 0, pointerEvents: "none"})

        gameObjectsHandler.getGameObjectByName("player").getComponent(Player).unlockWorldUpdate()
    }

    update() {
        if (!this.active) return;
        const inputs = inputHandler.getInputs()
        if (inputs.action) {
            if (this.index === 0) {
                this.index += 1
                return
            } else if (this.content[this.index] && this.index > 0) {
                this.displayNode(this.content[this.index])
                this.index += 1
            } else {
                this.close()
            } 
       }
    }
}

export default Interaction