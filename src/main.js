import gsap from "gsap"

import renderer from "./core/renderer"
import clock from "./core/clock"

import inputHandler from "./handlers/inputHandler"
import sceneHandler from "./handlers/sceneHandler"
import gameObjectsHandler from "./handlers/gameObjectsHandler"
import contentHandler from "./handlers/contentHandler"
import audioHandler from "./handlers/audioHandler"

import Player from "./components/player/Player"
import PlayerData from "./components/player/PlayerData"
import Interaction from "./components/managers/Interaction"
import CameraManager from "./components/managers/CameraManager"

async function showStartMenu() {
	audioHandler.init()
	document.querySelector(".start-btn").addEventListener("click", () => {
		gsap.to(document.querySelector(".start-menu"), {display:"none", pointerEvents: "none"})
		init()
	})
}

let cameraManager

async function init() {
	const areas = await contentHandler.getAreas()
	sceneHandler.init(areas)
	const scene = sceneHandler.getCurrentScene()

	const player = gameObjectsHandler.createGameObject(scene, "player")
	player.addComponent(Player)
	player.addComponent(PlayerData)

	const manager = gameObjectsHandler.createGameObject(scene, "manager")
	manager.addComponent(Interaction)
	cameraManager = manager.addComponent(CameraManager)
	
	const playerCamera = player.getComponent(Player).getCamera()
	cameraManager.setCamera(playerCamera)

	render()
}

function render() {

	requestAnimationFrame( render );

	const delta = Math.min( clock.getDelta(), 0.1 );

	gameObjectsHandler.update(delta)
	inputHandler.update()

	renderer.render( sceneHandler.getCurrentScene(), cameraManager.camera );
}

showStartMenu()