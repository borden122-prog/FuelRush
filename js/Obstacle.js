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
    }
    
    // Обновление позиции
    update(deltaTime) {
        this.y += this.speed * deltaTime;
    }
    
    // Отрисовка препятствия
    draw(ctx) {
        // Используем спрайт для отрисовки
        this.sprite.draw(ctx, this.x, this.y);
    }
    
    // Проверка, вышло ли препятствие за экран
    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + 100;
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
}
