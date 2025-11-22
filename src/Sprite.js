class Sprite {
    constructor(imagePath, frameCount = 1, rows = 1, cols = 1, fps = 1, loop = true, playing = true, startFrame = 0, endFrame = frameCount - 1, spriteWidth = 0, spriteHeight = 0) {
        this.spritesheet = null;
        this.imageLoaded = false;

        this.frameCount = frameCount;
        this.rows = rows;
        this.cols = cols;
        this.frameDelay = 1000 / fps; // ms per frame
        this.loop = loop;
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.currentFrame = startFrame;
        this.lastUpdateTime = millis();
        this.playing = playing;
        this.wasPlaying = playing;

        loadImage(imagePath, (img) => {
            this.spritesheet = img;
            this.frameWidth = this.spritesheet.width / cols;
            this.frameHeight = this.spritesheet.height / rows;
            if (spriteWidth == 0) this.spriteWidth = this.frameWidth;
            if (spriteHeight == 0) this.spriteHeight = this.frameHeight;
            this.imageLoaded = true;
        }, (err) => {
            console.error(`Failed to load image at ${imagePath}:`, err);
        });
    }

    draw(x, y, dir = `right`, xScale = 1, yScale = 1) {
        if (!this.spritesheet) return;
        if (dir === `left`) {
            push();
            scale(-1, 1);
        }
        if (this.frameCount == 1) {
            imageMode(CENTER);
            image(this.spritesheet, dir === `left` ? -x : x, y, this.frameWidth * xScale, this.frameHeight * yScale);
            return;
        }
        const frameX = (this.currentFrame % this.cols) * this.frameWidth + this.frameWidth / 2;
        const frameY = Math.floor(this.currentFrame / this.cols) * this.frameHeight + this.frameHeight / 2;

        imageMode(CENTER);
        image(this.spritesheet, dir === `left` ? -x : x, y, this.frameWidth * xScale, this.frameHeight * yScale, frameX - this.spriteWidth / 2, frameY - this.spriteHeight / 2, this.spriteWidth, this.spriteHeight);
        console.log(`Drawing frame ${this.currentFrame} at (${x}, ${y})`);
        if (this.playing) {
            this.updateFrame();
            this.wasPlaying = true;
        }
        if (!this.playing && this.wasPlaying) {
            this.currentFrame = this.startFrame;
            this.wasPlaying = false;
        }
        pop();
    }

    updateFrame() {
        if (this.frameCount <= 1) return;
        const now = millis();
        if (now - this.lastUpdateTime >= this.frameDelay) {
            this.currentFrame++;
            if (this.currentFrame > this.endFrame) {
                if (this.loop) {
                    this.currentFrame = this.startFrame;
                } else {
                    this.currentFrame = this.endFrame;
                }
            }
            this.lastUpdateTime = now;
        }
    }

}