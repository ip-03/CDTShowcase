class Spell extends Entity {
    constructor(id, x, y, type, angle) {
        if(new.target === Spell) {
            throw new TypeError("Cannot construct Spell instances directly");
        }
        super(id, x, y, type, true, angle);
    }
    draw() {
        // Implement in subclasses
        throw new Error("Method 'draw()' must be implemented.");
    }
}