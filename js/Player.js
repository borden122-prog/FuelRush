import { CONFIG } from './config.js';
import { Sprite } from './Sprite.js';

export class Player {
    constructor(canvasWidth, canvasHeight, assetLoader = null, carType = CONFIG.CAR_SELECTION.DEFAULT_CAR) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Позиция и размеры
        this.x = canvasWidth / 2 - CONFIG.PLAYER.WIDTH / 2;
        this.y = canvasHeight - CONFIG.PLAYER.HEIGHT - 50;
        this.width = CONFIG.PLAYER.WIDTH;
        this.height = CONFIG.PLAYER.HEIGHT;
        
        // Движение и поворот
        this.targetX = this.x;
        this.angle = 0;
        this.targetAngle = 0;
        this.moveDirection = 0; // -1 (влево), 0 (прямо), 1 (вправо)
        
        // Система тряски
        this.isShaking = false;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeStartTime = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        
        // Состояние остановки движения
        this.isMovementStopped = false;
        
        // Внешний вид
        this.color = CONFIG.PLAYER.COLOR;
        this.carType = carType;
        this.sprite = new Sprite(CONFIG.SPRITES.PLAYER_CARS[carType], this.width, this.height, assetLoader);
    }
    
    // Движение влево
    moveLeft() {
        this.moveDirection = -1;
        this.targetAngle = -CONFIG.PLAYER.TURN_ANGLE * Math.PI / 180;
    }
    
    // Движение вправо
    moveRight() {
        this.moveDirection = 1;
        this.targetAngle = CONFIG.PLAYER.TURN_ANGLE * Math.PI / 180;
    }
    
    // Остановка движения
    stopMoving() {
        this.moveDirection = 0;
    }
    
    // Полная остановка движения (при столкновении)
    stopMovement() {
        this.isMovementStopped = true;
        this.moveDirection = 0;
        this.targetAngle = 0;
    }
    
    // Обновление позиции и угла
    update(deltaTime, turnSpeedMultiplier = 1) {
        // Обновляем тряску
        this.updateShake(deltaTime);
        
        // Если движение остановлено, не обновляем позицию
        if (this.isMovementStopped) {
            return;
        }
        
        // Плавный поворот с учетом множителя скорости поворота
        const angleDiff = this.targetAngle - this.angle;
        this.angle += angleDiff * CONFIG.PLAYER.TURN_SPEED * deltaTime * turnSpeedMultiplier;
        
        // Плавное движение
        if (this.moveDirection !== 0) {
            const newX = this.x + (this.moveDirection * CONFIG.PLAYER.MOVE_DISTANCE);
            
            // Проверяем границы экрана
            if (newX >= 10 && newX <= this.canvasWidth - this.width - 10) {
                this.x = newX;
            }
        }
        
        // Автоматический возврат к прямому движению
        if (this.moveDirection === 0) {
            this.targetAngle = 0;
        }
    }
    
    // Отрисовка игрока
    draw(ctx) {
        // Используем спрайт для отрисовки с учетом тряски
        const drawX = this.x + this.shakeOffsetX;
        const drawY = this.y + this.shakeOffsetY;
        this.sprite.draw(ctx, drawX, drawY, this.angle);
    }
    
    // Сброс позиции
    reset() {
        this.x = this.canvasWidth / 2 - this.width / 2;
        this.y = this.canvasHeight - this.height - 50;
        this.targetX = this.x;
        this.angle = 0;
        this.targetAngle = 0;
        this.moveDirection = 0;
        
        // Сбрасываем тряску
        this.isShaking = false;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        
        // Сбрасываем остановку движения
        this.isMovementStopped = false;
    }
    
    // Обновление размеров canvas
    updateCanvasSize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset();
    }
    
    // Смена типа машины
    setCarType(carType, assetLoader) {
        this.carType = carType;
        this.sprite = new Sprite(CONFIG.SPRITES.PLAYER_CARS[carType], this.width, this.height, assetLoader);
        console.log(`Player car type changed to: ${carType}, sprite path: ${CONFIG.SPRITES.PLAYER_CARS[carType]}`);
        
        // Проверяем, что ассет загружен
        if (assetLoader && assetLoader.areAllAssetsReady()) {
            console.log('All assets are ready, sprite should load correctly');
        } else {
            console.warn('Assets not fully loaded yet, sprite may show fallback');
        }
    }
    
    // Запуск тряски
    startShake(intensity = 5, duration = 600) {
        this.isShaking = true;
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStartTime = performance.now();
    }
    
    // Обновление тряски
    updateShake(deltaTime) {
        if (!this.isShaking) return;
        
        const currentTime = performance.now();
        const elapsed = currentTime - this.shakeStartTime;
        const progress = elapsed / this.shakeDuration;
        
        if (progress >= 1) {
            // Тряска завершена
            this.isShaking = false;
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            return;
        }
        
        // Уменьшаем интенсивность тряски со временем
        const currentIntensity = this.shakeIntensity * (1 - progress);
        
        // Генерируем случайные смещения
        this.shakeOffsetX = (Math.random() - 0.5) * 2 * currentIntensity;
        this.shakeOffsetY = (Math.random() - 0.5) * 2 * currentIntensity;
    }
}
