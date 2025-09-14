import { CONFIG } from './config.js';
import { Sprite } from './Sprite.js';

export class Player {
    constructor(canvasWidth, canvasHeight, assetLoader = null) {
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
        
        // Внешний вид
        this.color = CONFIG.PLAYER.COLOR;
        this.sprite = new Sprite(CONFIG.SPRITES.PLAYER_CAR, this.width, this.height, assetLoader);
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
    
    // Обновление позиции и угла
    update(deltaTime) {
        // Плавный поворот
        const angleDiff = this.targetAngle - this.angle;
        this.angle += angleDiff * CONFIG.PLAYER.TURN_SPEED * deltaTime;
        
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
        // Используем спрайт для отрисовки
        this.sprite.draw(ctx, this.x, this.y, this.angle);
    }
    
    // Сброс позиции
    reset() {
        this.x = this.canvasWidth / 2 - this.width / 2;
        this.y = this.canvasHeight - this.height - 50;
        this.targetX = this.x;
        this.angle = 0;
        this.targetAngle = 0;
        this.moveDirection = 0;
    }
    
    // Обновление размеров canvas
    updateCanvasSize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset();
    }
}
