import { CONFIG } from './config.js';
import { Sprite } from './Sprite.js';

export class Obstacle {
    constructor(x = 0, y = 0, gameSpeed = 0, assetLoader = null) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.OBSTACLE.WIDTH;
        this.height = CONFIG.OBSTACLE.HEIGHT;
        this.color = CONFIG.OBSTACLE.COLOR;
        this.speed = gameSpeed * CONFIG.OBSTACLE.SPEED_MULTIPLIER;
        this.assetLoader = assetLoader;
        
        // Система тряски
        this.isShaking = false;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeStartTime = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        
        // Состояние остановки движения
        this.isMovementStopped = false;
        
        // Флаг столкнувшегося препятствия
        this.isCollisionObstacle = false;
        
        // Получаем случайное изображение препятствия
        const randomCarImage = assetLoader ? assetLoader.getRandomObstacleCar() : null;
        this.sprite = new Sprite(randomCarImage, this.width, this.height, assetLoader);
    }
    
    // Инициализация объекта из пула
    init(x, y, gameSpeed) {
        this.x = x;
        this.y = y;
        this.speed = gameSpeed * CONFIG.OBSTACLE.SPEED_MULTIPLIER;
        
        // Выбираем новое случайное изображение для препятствия
        if (this.assetLoader) {
            const randomCarImage = this.assetLoader.getRandomObstacleCar();
            this.sprite = new Sprite(randomCarImage, this.width, this.height, this.assetLoader);
        }
    }
    
    // Сброс объекта для возврата в пул
    reset() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        
        // Сбрасываем тряску
        this.isShaking = false;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        
        // Сбрасываем остановку движения
        this.isMovementStopped = false;
        
        // Сбрасываем флаг столкнувшегося препятствия
        this.isCollisionObstacle = false;
    }
    
    // Обновление позиции
    update(deltaTime, newSpeed = null, direction = null) {
        // Обновляем тряску
        this.updateShake(deltaTime);
        
        // Если движение остановлено, не обновляем позицию
        if (this.isMovementStopped) {
            return;
        }
        
        // Если передана новая скорость, используем её, иначе используем сохраненную
        const effectiveSpeed = newSpeed !== null ? newSpeed * CONFIG.OBSTACLE.SPEED_MULTIPLIER : this.speed;
        
        // Определяем направление движения (используем переданное направление или глобальное)
        const effectiveDirection = direction !== null ? direction : CONFIG.OBSTACLE.DIRECTION;
        
        if (effectiveDirection === 'up') {
            this.y -= effectiveSpeed * deltaTime; // Движение вверх
        } else {
            this.y += effectiveSpeed * deltaTime; // Движение вниз (по умолчанию)
        }
    }
    
    // Отрисовка препятствия
    draw(ctx) {
        // Используем спрайт для отрисовки с учетом тряски
        const drawX = this.x + this.shakeOffsetX;
        const drawY = this.y + this.shakeOffsetY;
        this.sprite.draw(ctx, drawX, drawY);
    }
    
    // Проверка, вышло ли препятствие за экран
    isOffScreen(canvasHeight, direction = null) {
        const effectiveDirection = direction !== null ? direction : CONFIG.OBSTACLE.DIRECTION;
        
        if (effectiveDirection === 'up') {
            // При движении вверх препятствие выходит за экран, когда его нижняя часть выше верхней границы экрана
            return this.y + this.height < -100;
        } else {
            // При движении вниз препятствие выходит за экран, когда его верхняя часть ниже нижней границы экрана
            return this.y > canvasHeight + 100;
        }
    }
    
    // Проверка столкновения с игроком
    checkCollision(player) {
        // Используем коллизионные размеры для более точного определения столкновений
        const obstacleCollisionX = this.x + (this.width - CONFIG.OBSTACLE.COLLISION_WIDTH) / 2;
        const obstacleCollisionY = this.y + (this.height - CONFIG.OBSTACLE.COLLISION_HEIGHT) / 2;
        
        const playerCollisionX = player.x + (player.width - CONFIG.PLAYER.COLLISION_WIDTH) / 2;
        const playerCollisionY = player.y + (player.height - CONFIG.PLAYER.COLLISION_HEIGHT) / 2;
        
        return playerCollisionX < obstacleCollisionX + CONFIG.OBSTACLE.COLLISION_WIDTH &&
               playerCollisionX + CONFIG.PLAYER.COLLISION_WIDTH > obstacleCollisionX &&
               playerCollisionY < obstacleCollisionY + CONFIG.OBSTACLE.COLLISION_HEIGHT &&
               playerCollisionY + CONFIG.PLAYER.COLLISION_HEIGHT > obstacleCollisionY;
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
    
    // Остановка движения (при столкновении)
    stopMovement() {
        this.isMovementStopped = true;
    }
}
