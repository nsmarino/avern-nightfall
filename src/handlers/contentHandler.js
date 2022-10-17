import sanityClient from "@sanity/client"
import worldSceneGLTF from '../../assets/worldSceneWithCollections.gltf'
import worldScene2GLTF from '../../assets/worldScene2WithCollections.gltf'
import battleSceneGLTF from "../../assets/battleSceneWithCollections.gltf"

// Approximation of how content will be modeled in Sanity
const area1 = {
    scene: worldSceneGLTF,
    id:"worldScene_1",
    spawns: [
        {
            id: "interactSpawn1", // some sort of name or ID will be assigned via CMS 
            name: "Interaction in world 1",
            type: "interaction", // types will be managed via select elem in backend
            content: [
                {
                    text: "Example node that will be managed via Sanity CMS"
                },
                {
                    text: "On this node, the player receives an item, which is stored in the PlayerData component on the 'player' gameObject. ",
                    item: "Sword"
                },
                {
                    text: "The player only receives this item once.",
                }
            ]
        },
        {
            id: "enemySpawn1", // some sort of name or ID will be assigned via CMS 
            name: "Enemy in world 1",
            type: "enemy", // types will be managed via select elem in backend
            // fieldEnemyMesh: // able to set how it appears in the world scene from backend
            battle: {
                stage: battleSceneGLTF,
                enemies: [
                    {
                        name: "goblin",
                        player: false,
                        level: 1,
                        id: "enemySpawn1"
                    },
                    {
                        name: "raven",
                        player: false,
                        level: 2,
                        id: "enemySpawn2"
                    },
                    {
                        name: "gryphon",
                        player: false,
                        level: 3,
                        id: "enemySpawn3"
                    },
                ]
            }
        },
        {
            id: "exodus",
            type: "connection",
            name: "Exodus to W2",
            connectionId: "worldScene_2",
        }
    ]
}
const area2 = {
    scene: worldScene2GLTF,
    id:"worldScene_2",
    spawns: [
        {
            id: "interactSpawn1", // some sort of name or ID will be assigned via CMS 
            name: "Interaction in world 2",
            type: "interaction", // types will be managed via select elem in backend
            content: [
                {
                    id: 1,
                    text: "You can interact with various objects in the world."
                },
                {
                    id: 2,
                    text: "If you didn't have a shield already, a shield has been added to your inventory.",
                    item: "Dented Shield"
                }
            ]
        },
        {
            id: "enemySpawn1", // some sort of name or ID will be assigned via CMS 
            name: "Enemy 1",
            type: "enemy", // types will be managed via select elem in backend
            // fieldEnemyMesh: // able to set how it appears in the world scene from backend
            battle: {
                stage: battleSceneGLTF,
                enemies: [
                    {
                        name: "goblin",
                        player: false,
                        level: 1,
                        id: "enemySpawn1"
                    },
                    {
                        name: "raven",
                        player: false,
                        level: 2,
                        id: "enemySpawn2"
                    },
                ]
            }
        },
        {
            id: "exodus",
            name: "Exodus to W1",
            type: "connection",
            connectionId: "worldScene_1",
        }
    ]
}
const areas = [ area1, area2 ]

class ContentHandler {
    constructor() {
        this.client = sanityClient({
            projectId: '4cv68xhy',
            dataset: 'production',
            apiVersion: '2021-03-25',
            useCdn: false, // `false` if you want to ensure fresh data
          })
    }

    async getAreas() {
        const query = `*[_type == "area"]{
          _id,
          "mesh": mesh.asset->url,
          "spawns": spawns[]{
            vertexName,
            entity->{
              "url": mesh.asset->url,
              ...
            }
          }
        }`
        const res = await this.client.fetch(query)
        console.log("Content from Sanity", res)

        // STILL PLACEHOLDER DATA
        return areas
    }
}


const contentHandler = new ContentHandler()

export default contentHandler