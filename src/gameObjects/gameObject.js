import * as THREE from 'three';

import {removeArrayElement } from "../helpers"

class GameObject {
    constructor(parent, name) {
        this.name = name;
        this.components = [];
        this.transform = new THREE.Object3D();
        this.transform.name = name
        parent.add(this.transform);
    }
    addComponent(ComponentType, ...args) {
        const component = new ComponentType(this, ...args);
        this.components.push(component);
        return component;
    }
    removeComponent(component) {
        removeArrayElement(this.components, component);
    }
    
    getComponent(ComponentType) {
        return this.components.find(c => c instanceof ComponentType);
    }

    init(parent) {
        for (const component of this.components) {
            component.init(parent);
            }
    }

    update(delta) {
        for (const component of this.components) {
        component.update(delta);
        }
    }

    removeFromScene() {
        if (this.transform.parent) this.transform.parent.remove(this.transform)
    }
}

export default GameObject