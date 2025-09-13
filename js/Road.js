import { CONFIG } from './config.js';

export class Road {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.lanes = CONFIG.ROAD.LANES;
        this.laneWidth = canvasWidth / this.lanes;
        
        // Загрузка текстуры дороги
        this.roadTexture = new Image();
        this.textureLoaded = false;
        this.textureLoadError = false;
        this.loadRoadTexture();
        
        // Анимация дороги
        this.roadOffset = 0; // Смещение для анимации
        this.textureHeight = 0; // Высота текстуры (будет установлена после загрузки)
        
        // Оптимизация отрисовки
        this.lastCanvasWidth = 0;
        this.needsTextureRecalculation = true;
    }
    
    loadRoadTexture() {
        this.roadTexture.onload = () => {
            this.textureLoaded = true;
            // Вычисляем высоту текстуры с сохранением пропорций
            this.textureHeight = (this.roadTexture.height * this.canvasWidth) / this.roadTexture.width;
            this.lastCanvasWidth = this.canvasWidth;
            console.log(`Road texture loaded: ${this.roadTexture.width}x${this.roadTexture.height}, scaled height: ${this.textureHeight}`);
        };
        this.roadTexture.onerror = () => {
            this.textureLoadError = true;
            console.error(`Failed to load road texture: ${CONFIG.SPRITES.ROAD_TEXTURE}`);
        };
        // Устанавливаем crossOrigin для избежания проблем с CORS
        this.roadTexture.crossOrigin = 'anonymous';
        this.roadTexture.src = CONFIG.SPRITES.ROAD_TEXTURE;
    }
    
    // Проверка готовности текстуры
    isTextureReady() {
        return this.textureLoaded && !this.textureLoadError && this.textureHeight > 0;
    }
    
    // Отрисовка дороги
    draw(ctx, gameSpeed = 1) {
        // Проверяем, нужно ли пересчитать размеры текстуры
        if (this.lastCanvasWidth !== this.canvasWidth && this.textureLoaded) {
            this.textureHeight = (this.roadTexture.height * this.canvasWidth) / this.roadTexture.width;
            this.lastCanvasWidth = this.canvasWidth;
        }
        
        // Рисуем текстуру дороги с анимацией
        if (this.isTextureReady()) {
            // Вычисляем начальную позицию для бесшовного зацикливания
            const startY = this.roadOffset % this.textureHeight;
            
            // Рисуем текстуры снизу вверх для бесшовного зацикливания
            // Начинаем с позиции, которая покрывает весь экран
            let y = startY - this.textureHeight;
            while (y < this.canvasHeight) {
                ctx.drawImage(
                    this.roadTexture,
                    0, 0, this.roadTexture.width, this.roadTexture.height, // исходные координаты
                    0, y, this.canvasWidth, this.textureHeight // целевые координаты (растягиваем на всю ширину)
                );
                y += this.textureHeight;
            }
        } else {
            // Fallback: простой фон дороги
            ctx.fillStyle = CONFIG.ROAD.ROAD_COLOR;
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
    }
    
    // Обновление анимации дороги
    update(deltaTime, gameSpeed) {
        // Двигаем дорогу вниз со скоростью, пропорциональной игровой скорости
        this.roadOffset += gameSpeed * deltaTime * CONFIG.ROAD.ANIMATION_SPEED;
        
        // Зацикливаем смещение для бесшовного повторения
        if (this.textureHeight > 0 && this.roadOffset >= this.textureHeight) {
            this.roadOffset = this.roadOffset % this.textureHeight;
        }
    }
    
    // Обновление размеров canvas
    updateCanvasSize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.laneWidth = canvasWidth / this.lanes;
        
        // Пересчитываем высоту текстуры при изменении размера экрана
        if (this.textureLoaded && this.roadTexture) {
            this.textureHeight = (this.roadTexture.height * this.canvasWidth) / this.roadTexture.width;
        }
    }
}
