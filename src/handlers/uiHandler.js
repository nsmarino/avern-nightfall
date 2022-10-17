import gsap from "gsap"
import inputHandler from "./inputHandler"

class UIHandler {
    constructor() {
        this.activePrompt = false
        this.promptEl = document.querySelector(".prompt")
        this.controlsEl = document.querySelector(".controls-ui")

        Object.keys(inputHandler.config).forEach(key => {
            const para = document.createElement("p")
            para.innerText = `${key}: ${inputHandler.config[key].name}`
            this.controlsEl.appendChild(para)
         })

    }

    showPrompt(prompt){
        this.activePrompt = true
        this.promptEl.innerText = prompt
        const span = document.createElement("span")
        span.innerText = `[${inputHandler.config.action.name}]`
        this.promptEl.appendChild(span)
        gsap.to(this.promptEl, { opacity: 1, pointerEvents: "auto", duration: 0.05})
    }

    clearPrompt() {
        this.activePrompt = false
        this.promptEl.innerHTML = ""
        gsap.to(this.promptEl, { opacity: 0, pointerEvents: "auto", duration: 0.05 })
    }
}

const uiHandler = new UIHandler()

export default uiHandler