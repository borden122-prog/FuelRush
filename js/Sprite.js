export class Sprite {
    constructor(imagePath, width, height, assetLoader = null) {
        this.imagePath = imagePath;
        this.width = width;
        this.height = height;
        this.image = null;
        this.loaded = false;
        this.loadError = false;
        this.assetLoader = assetLoader;
        
        // Если передан объект Image напрямую
        if (imagePath && imagePath instanceof Image) {
            this.image = imagePath;
            this.loaded = true;
            console.log('Sprite initialized with Image object');
        }
        // Если есть загрузчик ассетов, используем его
        else if (this.assetLoader) {
            this.loadFromAssetLoader();
        } else {
            this.loadImage();
        }
    }
    
    loadFromAssetLoader() {
        // Получаем ассет из загрузчика
        const assetKey = this.getAssetKey();
        this.image = this.assetLoader.getAsset(assetKey);
        
        if (this.image) {
            this.loaded = true;
            console.log(`Sprite loaded from asset loader: ${this.imagePath}`);
        } else {
            this.loadError = true;
            console.error(`Asset not found in loader: ${assetKey}`);
        }
    }
    
    getAssetKey() {
        // Определяем ключ ассета по пути
        if (this.imagePath.includes('player-car')) return 'playerCar';
        if (this.imagePath.includes('obstacle-car')) {
            // Извлекаем номер из пути (например, obstacle-car1.png -> 0)
            const match = this.imagePath.match(/obstacle-car(\d+)\.png/);
            if (match) {
                return `obstacleCar${parseInt(match[1]) - 1}`;
            }
            return 'obstacleCar0';
        }
        if (this.imagePath.includes('road-texture')) return 'roadTexture';
        if (this.imagePath.includes('fuel-check')) {
            // Извлекаем номер из пути (например, fuel-check1.png -> 0)
            const match = this.imagePath.match(/fuel-check(\d+)\.png/);
            if (match) {
                return `fuelCheck${parseInt(match[1]) - 1}`;
            }
            return 'fuelCheck0';
        }
        return 'unknown';
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
