import gsap from "gsap"
import Component from "../component";

class PlayerData extends Component {
    constructor(gameObject) {
        super(gameObject)
        // can load data from localStorage or from Sanity?
        this.ui = document.querySelector(".player-data-ui")

        this.inventory = []
        this.inventoryEl = document.querySelector(".inventory-list")

        this.xp = 0
        this.xpEl = document.querySelector(".xp-count")
        this.updateXp(0)

        this.party = [
            {
                name: "ONE",
                player: true,
                level: 1,
                id: "partySpawn"
            },
            {
                name: "TWO",
                player: true,
                level: 2,
                id: "partySpawn2"
            },
            {
                name: "THREE",
                player: true,
                level: 3,
                id: "partySpawn3"
            },
        ]    
    }

    getParty() {
        return this.party
    }

    addToInventory(item) {
        this.inventory.push(item)
        this.updateInventoryList()
    }

    updateInventoryList() {
        this.inventoryEl.innerHTML = null
        for (const item of this.inventory) {
            const li = document.createElement("p")
            li.innerText = item
            this.inventoryEl.appendChild(li)
        }
    }

    updateXp(int) {
        this.xp += int
        this.xpEl.innerHTML = this.xp
    }

    hasInventoryItem(item) {
        return this.inventory.find(invItem => invItem===item)
    }

    hidePlayerDataUI() {
        gsap.to(this.ui, {autoAlpha: 0 })
    }

    showPlayerDataUI() {
        gsap.to(this.ui, {autoAlpha: 1 })
    }
}

export default PlayerData