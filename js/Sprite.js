export class Sprite {
    constructor(imagePath, width, height) {
        this.imagePath = imagePath;
        this.width = width;
        this.height = height;
        this.image = null;
        this.loaded = false;
        this.loadError = false;
        
        this.loadImage();
    }
    
    loadImage() {
        this.image = new Image();
        this.image.onload = () => {
            this.loaded = true;
            console.log(`Successfully loaded sprite: ${this.imagePath}`);
        };
        this.image.onerror = () => {
            this.loadError = true;
            console.error(`Failed to load sprite: ${this.imagePath}`);
        };
        this.image.src = this.imagePath;
        console.log(`Loading sprite: ${this.imagePath}`);
    }
    
    draw(ctx, x, y, angle = 0, scaleX = 1, scaleY = 1) {
        if (!this.loaded || this.loadError) {
            // Fallback: рисуем простой прямоугольник
            console.log(`Using fallback for sprite: ${this.imagePath}, loaded: ${this.loaded}, error: ${this.loadError}`);
            this.drawFallback(ctx, x, y, angle, scaleX, scaleY);
            return;
        }
        
        ctx.save();
        
        // Включаем высококачественное сглаживание
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Перемещаем контекст к центру изображения для поворота
        const centerX = x + (this.width * scaleX) / 2;
        const centerY = y + (this.height * scaleY) / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        // Рисуем изображение с высоким качеством
        ctx.drawImage(
            this.image,
            -(this.width * scaleX) / 2,
            -(this.height * scaleY) / 2,
            this.width * scaleX,
            this.height * scaleY
        );
        
        ctx.restore();
    }
    
    drawFallback(ctx, x, y, angle = 0, scaleX = 1, scaleY = 1) {
        ctx.save();
        
        const centerX = x + (this.width * scaleX) / 2;
        const centerY = y + (this.height * scaleY) / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        // Рисуем простой прямоугольник как fallback
        ctx.fillStyle = '#666';
        ctx.fillRect(
            -(this.width * scaleX) / 2,
            -(this.height * scaleY) / 2,
            this.width * scaleX,
            this.height * scaleY
        );
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            -(this.width * scaleX) / 2,
            -(this.height * scaleY) / 2,
            this.width * scaleX,
            this.height * scaleY
        );
        
        ctx.restore();
    }
    
    isReady() {
        return this.loaded && !this.loadError;
    }
}
