// Keyboard controls
// TODO: ability to edit from main menu or pause menu

class InputHandler {
    constructor() {
        this.config = {
            forward: {
                code: "KeyW",
                pressed: false,
                name: "W"
            },
            back: {
                code:"KeyS",
                pressed: false,
                name: "S"
            },
            left: {
                code:"KeyA",
                pressed: false,
                name: "A"
            },
            right: {
                code:"KeyD",
                pressed: false,
                name: "D"
            },
        
            action: {
                code:"KeyE",
                pressed: false,
                name: "E"
            },
            jump: {
                code:"Space",
                pressed: false,
                name: "Space"
            },
        
            camUp: {
                code:"KeyI",
                pressed: false,
                name: "I"
            },
            camDown: {
                code:"KeyK",
                pressed: false,
                name: "K"
            },
            resetCam: {
                code:"KeyL",
                pressed: false,
                name: "L"
            },
        
            characterMenu: {
                code:"KeyJ",
                pressed: false,
                name: "J"
            },
            pauseMenu: {
                code:"Semicolon",
                pressed: false,
                name: "Semicolon"
            },
        }
        
        this.inputs = {
            forward:false,
            back:false,
            left:false,
            right:false,
            camUp:false,
            camDown:false,

            action:false,
            actionWasPressed:false,

            jump:false,

            characterMenu:false,
            pauseMenu:false,
        }
        window.addEventListener( 'keydown', function(e) {
            switch ( e.code ) {
                case this.config.forward.code: this.inputs.forward = true; break;
                case this.config.back.code: this.inputs.back = true; break;
                case this.config.right.code: this.inputs.right = true; break;
                case this.config.left.code: this.inputs.left = true; break;

                case this.config.camUp.code: this.inputs.camUp = true; break;
                case this.config.camDown.code: this.inputs.camDown = true; break;
                case this.config.resetCam.code: this.inputs.resetCam = true; break;

                case this.config.action.code:
                    // Ensure button does not fire multiple times if held down:
                    if (!this.config.action.pressed) { // if the key was not previously pressed
                        this.inputs.action = true
                        this.config.action.pressed = true
                    }
                    break;

                case this.config.jump.code: this.inputs.jump = true; break;


            }
        }.bind(this));
    
        window.addEventListener( 'keyup', function ( e ) {
            switch ( e.code ) {
                case this.config.forward.code: this.inputs.forward = false; break;
                case this.config.back.code: this.inputs.back = false; break;
                case this.config.right.code: this.inputs.right = false; break;
                case this.config.left.code: this.inputs.left = false; break;

                case this.config.camUp.code: this.inputs.camUp = false; break;
                case this.config.camDown.code: this.inputs.camDown = false; break;
                case this.config.resetCam.code: this.inputs.resetCam = false; break;

                case this.config.action.code: 
                    this.inputs.action = false; 
                    this.config.action.pressed = false;
                    break;

                case this.config.jump.code: this.inputs.jump = false; break;
            }
        }.bind(this));
    }

    getInputs() {
        return this.inputs
    }
    update() {
        if (this.config.action.pressed) this.inputs.action = false
    }
}

const inputHandler = new InputHandler()

export default inputHandler