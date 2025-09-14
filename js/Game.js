import { CONFIG } from './config.js';
import { Player } from './Player.js';
import { ObstacleManager } from './ObstacleManager.js';
import { Road } from './Road.js';
import { InputManager } from './InputManager.js';
import { DisplayManager } from './DisplayManager.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.screenFadeElement = document.getElementById('screenFade');
        this.loadingScreenElement = document.getElementById('loadingScreen');
        this.startScreenElement = document.getElementById('startScreen');
        this.startBtn = document.getElementById('startBtn');
        
        // Размеры canvas
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        
        // Менеджер отображения для высокого разрешения
        this.displayManager = new DisplayManager();
        
        // Игровые параметры
        this.gameRunning = false;
        this.score = 0;
        this.gameSpeed = CONFIG.GAME.BASE_SPEED;
        this.restartFrameCount = 0;
        this.assetsLoaded = false;
        
        // Игровые объекты
        this.player = null;
        this.obstacleManager = null;
        this.road = null;
        this.inputManager = null;
        
        // Анимация
        this.animationId = null;
        this.lastTime = 0;
        this.startScreenAnimationId = null;
        this.startScreenLastTime = 0;
        
        // Оптимизация отрисовки
        this.needsRedraw = true;
        this.lastScore = 0;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadAssets();
    }
    
    setupCanvas() {
        // Устанавливаем размеры canvas под размер экрана
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight;
        
        // Настраиваем canvas для высокого разрешения
        const displayInfo = this.displayManager.setupCanvas(this.canvas, this.canvasWidth, this.canvasHeight);
        this.ctx = displayInfo.ctx;
        
        // Обработка изменения размера окна с throttling
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.canvasWidth = window.innerWidth;
                this.canvasHeight = window.innerHeight;
                
                // Обновляем canvas с поддержкой высокого разрешения
                this.displayManager.updateCanvasSize(this.canvas, this.canvasWidth, this.canvasHeight);
                this.ctx = this.canvas.getContext('2d');
                
                // Обновляем размеры всех объектов
                this.player.updateCanvasSize(this.canvasWidth, this.canvasHeight);
                this.obstacleManager.updateCanvasSize(this.canvasWidth, this.canvasHeight);
                this.road.updateCanvasSize(this.canvasWidth, this.canvasHeight);
                this.inputManager.updateCanvasSize(this.canvasWidth);
                
                this.needsRedraw = true;
            }, 100); // Throttling 100ms
        });
    }
    
    setupGameObjects() {
        this.player = new Player(this.canvasWidth, this.canvasHeight);
        this.obstacleManager = new ObstacleManager(this.canvasWidth, this.canvasHeight);
        this.road = new Road(this.canvasWidth, this.canvasHeight);
        this.inputManager = new InputManager(this.canvas, this.player);
    }
    
    setupEventListeners() {
        // Кнопка рестарта
        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
        
        // Кнопка старта
        this.startBtn.addEventListener('click', () => {
            this.startGame();
        });
    }
    
    loadAssets() {
        // Симулируем загрузку ассетов
        // В реальной игре здесь бы загружались изображения, звуки и т.д.
        setTimeout(() => {
            this.assetsLoaded = true;
            this.showStartScreen();
        }, 2000); // 2 секунды загрузки
    }
    
    showStartScreen() {
        // Скрываем экран загрузки
        this.loadingScreenElement.style.display = 'none';
        
        // Инициализируем игровые объекты для фоновой анимации
        this.setupGameObjects();
        
        // Показываем стартовый экран
        this.startScreenElement.style.display = 'flex';
        
        // Запускаем фоновую анимацию
        this.startBackgroundAnimation();
    }
    
    startBackgroundAnimation() {
        const animate = (currentTime = 0) => {
            if (this.startScreenElement.style.display === 'none') {
                // Останавливаем анимацию, если стартовый экран скрыт
                if (this.startScreenAnimationId) {
                    cancelAnimationFrame(this.startScreenAnimationId);
                    this.startScreenAnimationId = null;
                }
                return;
            }
            
            const deltaTime = currentTime - this.startScreenLastTime;
            this.startScreenLastTime = currentTime;
            
            // Обновляем только дорогу для фоновой анимации
            this.road.update(deltaTime, CONFIG.GAME.BASE_SPEED * 0.5); // Медленная анимация
            
            // Отрисовываем фон
            this.drawBackground();
            
            this.startScreenAnimationId = requestAnimationFrame(animate);
        };
        
        this.startScreenLastTime = 0;
        animate();
    }
    
    drawBackground() {
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Рисуем дорогу
        this.road.draw(this.ctx, CONFIG.GAME.BASE_SPEED * 0.5);
        
        // Рисуем игрока в центре
        this.player.draw(this.ctx);
    }
    
    updateScore(deltaTime) {
        if (!this.gameRunning) {
            return;
        }
        
        this.restartFrameCount++;
        
        if (this.restartFrameCount <= 3) {
            return;
        }
        
        const pixelsPerMeter = 10;
        const distanceInPixels = this.gameSpeed * deltaTime;
        const metersGained = distanceInPixels / pixelsPerMeter;
        
        this.score += metersGained;
        
        const displayScore = Math.floor(this.score);
        if (displayScore !== this.lastScore) {
            this.scoreElement.textContent = displayScore;
            this.lastScore = displayScore;
            this.needsRedraw = true;
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = Math.floor(this.score);
        
        // Плавное затемнение экрана
        this.screenFadeElement.classList.add('active');
        
        // Показываем поп-ап после затемнения
        setTimeout(() => {
            this.gameOverElement.style.display = 'block';
        }, 300); // 300ms для плавного перехода
        
        cancelAnimationFrame(this.animationId);
    }
    
    restartGame() {
        this.gameRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.score = 0;
        this.lastScore = 0;
        this.gameSpeed = CONFIG.GAME.BASE_SPEED;
        this.restartFrameCount = 0;
        
        this.obstacleManager.clear();
        this.player.reset();
        
        this.gameOverElement.style.display = 'none';
        this.screenFadeElement.classList.remove('active');
        
        this.scoreElement.textContent = '0';
        this.scoreElement.innerHTML = '0';
        
        // Сразу запускаем игру
        setTimeout(() => {
            this.gameRunning = true;
            this.inputManager.setGameRunning(true);
            this.needsRedraw = true;
            this.gameLoop();
        }, 50);
    }
    
    startGame() {
        // Останавливаем фоновую анимацию
        if (this.startScreenAnimationId) {
            cancelAnimationFrame(this.startScreenAnimationId);
            this.startScreenAnimationId = null;
        }
        
        // Скрываем стартовый экран
        this.startScreenElement.style.display = 'none';
        
        // Игровые объекты уже инициализированы в showStartScreen
        this.gameRunning = true;
        this.inputManager.setGameRunning(true);
        this.gameLoop();
    }
    
    draw() {
        this.road.draw(this.ctx, this.gameSpeed);
        this.obstacleManager.draw(this.ctx);
        this.player.draw(this.ctx);
    }
    
    update(deltaTime) {
        if (!this.gameRunning) return;
        
        this.player.update(deltaTime);
        this.obstacleManager.update(deltaTime, this.gameSpeed);
        this.road.update(deltaTime, this.gameSpeed);
        
        // Проверяем столкновения
        if (this.obstacleManager.checkCollisions(this.player)) {
            this.gameOver();
            return;
        }
        
        this.updateScore(deltaTime);
        
        // Помечаем, что нужна перерисовка
        this.needsRedraw = true;
    }
    
    gameLoop(currentTime = 0) {
        if (!this.gameRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        
        // Отрисовываем только при необходимости
        if (this.needsRedraw) {
            this.draw();
            this.needsRedraw = false;
        }
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
}
