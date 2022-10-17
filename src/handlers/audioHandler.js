import introWav from '../../assets/audio/intro.wav'
import click from '../../assets/audio/click.wav'

class AudioHandler {
    constructor() {
        this.musicHandler = document.createElement("audio")
        this.musicHandler.src = introWav
        
        this.fxHandler = document.createElement("audio") // button fx for main menu
        this.fxHandler.src = click
        this.fxHandler.volume = 0.1

        document.querySelectorAll(".start-menu button").forEach(btn => {
            btn.addEventListener("mouseenter", () => {
                this.fxHandler.play()
            })
            btn.addEventListener("click", () => {
                this.fxHandler.play()
            })
        })
    }

    init() {
        document.addEventListener("click", () => {
            // this.musicHandler.play()
        })
    }

    changeMusic(audio) {
        this.musicHandler.src = audio
        this.musicHandler.play()
    }
}

const audioHandler = new AudioHandler()

export default audioHandler