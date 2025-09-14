import { CONFIG } from './config.js';
import { Obstacle } from './Obstacle.js';
import { ObjectPool } from './ObjectPool.js';

export class ObstacleManager {
    constructor(canvasWidth, canvasHeight, assetLoader = null) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.lanes = CONFIG.ROAD.LANES;
        this.laneWidth = canvasWidth / this.lanes;
        this.lanePositions = [];
        this.assetLoader = assetLoader;
        
        // Создаем пул объектов для препятствий
        this.obstaclePool = new ObjectPool(
            () => new Obstacle(0, 0, 0, this.assetLoader), // createFn
            (obstacle) => obstacle.reset(), // resetFn
            20 // начальный размер пула
        );
        
        this.setupLanes();
    }
    
    setupLanes() {
        this.lanePositions = [];
        for (let i = 0; i < this.lanes; i++) {
            let laneCenter = i * this.laneWidth + this.laneWidth / 2;
            
            // Для 1 и 3 полосы (индексы 0 и 2) сдвигаем позицию дальше от краев
            if (i === 0) {
                // Первая полоса - сдвигаем вправо от левого края
                laneCenter += this.laneWidth * 0.2; // 20% от ширины полосы
            } else if (i === 2) {
                // Третья полоса - сдвигаем влево от правого края
                laneCenter -= this.laneWidth * 0.2; // 20% от ширины полосы
            }
            
            this.lanePositions.push(laneCenter);
        }
    }
    
    // Создание нового препятствия
    spawnObstacle(gameSpeed) {
        // Получаем занятые полосы в верхней части экрана
        const occupiedLanes = this.getOccupiedLanesInTopArea();
        
        // Если занято 2 из 3 полос, не спавним новое препятствие
        // Это гарантирует, что всегда остается хотя бы одна свободная полоса
        if (occupiedLanes.length >= this.lanes - 1) {
            return;
        }
        
        // Выбираем случайную свободную полосу
        const availableLanes = [];
        for (let i = 0; i < this.lanes; i++) {
            if (!occupiedLanes.includes(i)) {
                availableLanes.push(i);
            }
        }
        
        // Если есть свободные полосы, выбираем случайную
        if (availableLanes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableLanes.length);
            const lane = availableLanes[randomIndex];
            
            const obstacle = this.obstaclePool.get();
            obstacle.init(
                this.lanePositions[lane] - CONFIG.OBSTACLE.WIDTH / 2,
                -CONFIG.OBSTACLE.HEIGHT,
                gameSpeed
            );
        }
    }
    
    
    // Получение занятых полос в верхней части экрана
    getOccupiedLanesInTopArea() {
        const activeObstacles = this.obstaclePool.getActive();
        const occupiedLanes = new Set();
        const topAreaHeight = 200; // Проверяем верхние 200 пикселей
        
        for (let obstacle of activeObstacles) {
            // Проверяем, находится ли препятствие в верхней части экрана
            if (obstacle.y < topAreaHeight && obstacle.y > -CONFIG.OBSTACLE.HEIGHT) {
                // Определяем полосу препятствия
                const lane = this.getLaneFromPosition(obstacle.x + CONFIG.OBSTACLE.WIDTH / 2);
                if (lane !== -1) {
                    occupiedLanes.add(lane);
                }
            }
        }
        
        return Array.from(occupiedLanes);
    }
    
    // Определение полосы по позиции X
    getLaneFromPosition(x) {
        for (let i = 0; i < this.lanes; i++) {
            const laneCenter = this.lanePositions[i];
            const laneLeft = laneCenter - this.laneWidth / 2;
            const laneRight = laneCenter + this.laneWidth / 2;
            
            if (x >= laneLeft && x <= laneRight) {
                return i;
            }
        }
        return -1; // Не найдена полоса
    }
    
    // Обновление всех препятствий
    update(deltaTime, gameSpeed) {
        const activeObstacles = this.obstaclePool.getActive();
        
        // Обновляем позиции препятствий и удаляем вышедшие за экран
        for (let i = activeObstacles.length - 1; i >= 0; i--) {
            const obstacle = activeObstacles[i];
            obstacle.update(deltaTime);
            
            if (obstacle.isOffScreen(this.canvasHeight)) {
                this.obstaclePool.release(obstacle);
            }
        }
        
        // Спавним новые препятствия
        if (Math.random() < CONFIG.GAME.OBSTACLE_SPAWN_RATE) {
            this.spawnObstacle(gameSpeed);
        }
    }
    
    
    // Отрисовка всех препятствий
    draw(ctx) {
        const activeObstacles = this.obstaclePool.getActive();
        for (let obstacle of activeObstacles) {
            obstacle.draw(ctx);
        }
    }
    
    // Проверка столкновений с игроком
    checkCollisions(player) {
        const activeObstacles = this.obstaclePool.getActive();
        for (let obstacle of activeObstacles) {
            if (obstacle.checkCollision(player)) {
                return true;
            }
        }
        return false;
    }
    
    // Очистка всех препятствий
    clear() {
        this.obstaclePool.releaseAll();
    }
    
    // Обновление размеров canvas
    updateCanvasSize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.laneWidth = canvasWidth / this.lanes;
        this.setupLanes();
    }
}
