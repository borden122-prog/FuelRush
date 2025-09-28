import { CONFIG } from './config.js';
import { Player } from './Player.js';
import { ObstacleManager } from './ObstacleManager.js';
import { Road } from './Road.js';
import { InputManager } from './InputManager.js';
import { DisplayManager } from './DisplayManager.js';
import { AssetLoader } from './AssetLoader.js';
import { Sprite } from './Sprite.js';

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
        this.fuelEmptyElement = document.getElementById('fuelEmpty');
        this.refuelBtn = document.getElementById('refuelBtn');
        this.gamePausedElement = document.getElementById('gamePaused');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.carGridElement = document.getElementById('carGrid');
        this.desktopScreenElement = document.getElementById('desktopScreen');
        
        // Загрузчик ассетов
        this.assetLoader = null;
        
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
        this.selectedCarType = CONFIG.CAR_SELECTION.DEFAULT_CAR;
        
        // Состояние события "закончился бензин"
        this.fuelEventTriggered = false;
        this.fuelEventDistance = 200; // метров
        this.isSlowingDown = false;
        this.isAccelerating = false;
        this.slowDownSpeed = 0;
        this.accelerationSpeed = 0;
        this.isFuelScreenVisible = false;
        this.slowDownAnimationId = null;
        this.isChangingDirection = false;
        this.directionChangeAnimationId = null;
        this.obstacleSpeedAtSlowDown = null;
        
        // Состояние столкновения
        this.isCollisionInProgress = false;
        
        // Состояние изменения направления препятствий
        this.obstaclesReversed = false;
        
        // Индикатор топлива
        this.fuelIndicatorVisible = false;
        this.fuelIndicatorCurrentFrame = 0;
        this.fuelIndicatorLastSwitch = 0;
        this.fuelIndicatorSprites = [];
        
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
        
        // Состояние видимости вкладки
        this.isTabVisible = true;
        this.wasGameRunningBeforeHide = false;
        this.visibilityCheckInterval = null;
        this.gamePausedByTab = false;
        this.pauseStartTime = 0;
        
        // Состояние события заправки при паузе
        this.wasFuelScreenVisibleBeforePause = false;
        this.wasSlowingDownBeforePause = false;
        this.wasFuelEventTriggeredBeforePause = false;
        this.wasFuelEventCompletedBeforePause = false;
        
        this.init();
    }
    
    init() {
        // Проверяем, является ли устройство десктопным
        if (this.isDesktopDevice()) {
            this.showDesktopScreen();
            return;
        }
        
        this.setupCanvas();
        this.setupEventListeners();
        this.loadAssets();
    }
    
    isDesktopDevice() {
        // Проверяем размер экрана и наличие touch событий
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isLargeScreen = window.innerWidth > 768 && window.innerHeight > 600;
        
        // Если это большой экран и нет touch событий, считаем десктопом
        return isLargeScreen && !hasTouch;
    }
    
    showDesktopScreen() {
        // Скрываем все остальные экраны
        this.loadingScreenElement.style.display = 'none';
        this.startScreenElement.style.display = 'none';
        this.gameOverElement.style.display = 'none';
        this.fuelEmptyElement.style.display = 'none';
        this.gamePausedElement.style.display = 'none';
        
        // Показываем экран для десктопных устройств
        this.desktopScreenElement.style.display = 'flex';
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
        this.player = new Player(this.canvasWidth, this.canvasHeight, this.assetLoader, this.selectedCarType);
        this.obstacleManager = new ObstacleManager(this.canvasWidth, this.canvasHeight, this.assetLoader);
        this.road = new Road(this.canvasWidth, this.canvasHeight, this.assetLoader);
        this.inputManager = new InputManager(this.canvas, this.player);
        
        // Инициализируем спрайты индикатора топлива
        this.initFuelIndicatorSprites();
    }
    
    initFuelIndicatorSprites() {
        try {
            this.fuelIndicatorSprites = CONFIG.SPRITES.FUEL_CHECK.map(spritePath => 
                new Sprite(spritePath, CONFIG.FUEL_INDICATOR.WIDTH, CONFIG.FUEL_INDICATOR.HEIGHT, this.assetLoader)
            );
        } catch (error) {
            console.warn('Не удалось загрузить спрайты индикатора топлива:', error);
            this.fuelIndicatorSprites = [];
        }
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
        
        // Кнопка заправки
        this.refuelBtn.addEventListener('click', () => {
            this.refuel();
        });
        
        // Кнопка продолжения игры
        this.resumeBtn.addEventListener('click', () => {
            this.resumeGame();
        });
        
        // Обработчики видимости вкладки
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Дополнительные обработчики для большей совместимости
        window.addEventListener('blur', () => {
            console.log('Window blur event');
            this.handleVisibilityChange();
        });
        
        window.addEventListener('focus', () => {
            console.log('Window focus event');
            this.handleVisibilityChange();
        });
        
        // Периодическая проверка видимости каждые 100ms
        this.visibilityCheckInterval = setInterval(() => {
            if (document.hidden && this.gameRunning) {
                console.log('Periodic check: tab is hidden, pausing game');
                this.handleVisibilityChange();
            }
        }, 100);
    }
    
    handleVisibilityChange() {
        console.log('Visibility changed, document.hidden:', document.hidden);
        
        if (document.hidden) {
            // Вкладка скрыта - приостанавливаем игру
            console.log('Tab hidden - pausing game');
            this.isTabVisible = false;
            this.wasGameRunningBeforeHide = this.gameRunning;
            this.gamePausedByTab = true;
            
            if (this.gameRunning) {
                this.gameRunning = false;
                console.log('Game paused due to hidden tab');
                // Сохраняем время начала паузы
                this.pauseStartTime = performance.now();
                
                // Сохраняем состояние события заправки
                this.wasFuelScreenVisibleBeforePause = this.isFuelScreenVisible;
                this.wasSlowingDownBeforePause = this.isSlowingDown;
                this.wasFuelEventTriggeredBeforePause = this.fuelEventTriggered;
                this.wasFuelEventCompletedBeforePause = this.fuelEventTriggered && !this.isSlowingDown && !this.isFuelScreenVisible;
                
                // Останавливаем анимацию замедления, если она активна
                this.stopSlowDownAnimation();
                
                // Показываем поп-ап приостановки
                this.screenFadeElement.classList.add('active');
                setTimeout(() => {
                    this.gamePausedElement.style.display = 'block';
                }, 300);
            }
            
            // Останавливаем игровой цикл
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
                console.log('Animation frame cancelled');
            }
        } else {
            // Вкладка видна - НЕ возобновляем игру автоматически
            console.log('Tab visible - NOT resuming game automatically');
            this.isTabVisible = true;
            
            // Игра НЕ возобновляется автоматически при возврате к вкладке
            // Игрок должен нажать кнопку рестарта или продолжить игру вручную
        }
    }
    
    resumeGame() {
        // Скрываем поп-ап приостановки
        this.gamePausedElement.style.display = 'none';
        this.screenFadeElement.classList.remove('active');
        
        // Сбрасываем флаги приостановки
        this.gamePausedByTab = false;
        this.isTabVisible = true;
        
        // Корректируем время последнего обновления, чтобы не начислялись очки за время паузы
        if (this.pauseStartTime > 0) {
            const pauseDuration = performance.now() - this.pauseStartTime;
            this.lastTime += pauseDuration;
            this.pauseStartTime = 0;
            console.log('Pause duration compensated:', pauseDuration + 'ms');
        }
        
        // Восстанавливаем состояние события заправки
        if (this.wasFuelScreenVisibleBeforePause) {
            console.log('Restoring fuel screen state');
            this.isFuelScreenVisible = true;
            this.inputManager.setFuelScreenVisible(true);
            this.fuelEmptyElement.style.display = 'block';
            this.screenFadeElement.classList.add('active');
        } else if (this.wasSlowingDownBeforePause) {
            console.log('Restoring slowing down state');
            this.isSlowingDown = true;
            this.fuelIndicatorVisible = true;
            this.fuelIndicatorLastSwitch = performance.now();
            // НЕ возобновляем анимацию замедления, так как она уже должна быть завершена
            // Просто показываем индикатор топлива
        } else if (this.wasFuelEventTriggeredBeforePause && !this.wasFuelEventCompletedBeforePause) {
            console.log('Restoring fuel event triggered state');
            this.fuelEventTriggered = true;
            this.fuelIndicatorVisible = true;
            this.fuelIndicatorLastSwitch = performance.now();
        } else if (this.wasFuelEventCompletedBeforePause) {
            console.log('Fuel event was already completed, not showing indicator');
            this.fuelEventTriggered = true;
            this.fuelIndicatorVisible = false;
        }
        
        // Сбрасываем сохраненные состояния
        this.wasFuelScreenVisibleBeforePause = false;
        this.wasSlowingDownBeforePause = false;
        this.wasFuelEventTriggeredBeforePause = false;
        this.wasFuelEventCompletedBeforePause = false;
        
        // Возобновляем игру
        this.gameRunning = true;
        this.inputManager.setGameRunning(true);
        this.needsRedraw = true;
        
        console.log('Game resumed by user');
        this.gameLoop();
    }
    
    loadAssets() {
        // Запоминаем время начала загрузки
        this.loadStartTime = performance.now();
        this.minLoadTime = 1000; // Минимум 1 секунда загрузки
        
        // Создаем загрузчик ассетов
        this.assetLoader = AssetLoader.loadGameAssets();
        
        // Настраиваем callback для прогресса загрузки
        this.assetLoader.onProgress = (loaded, total) => {
            const progress = (loaded / total) * 100;
            console.log(`Loading progress: ${progress.toFixed(1)}%`);
        };
        
        // Загружаем все ассеты
        this.assetLoader.loadAll()
            .then(() => {
                console.log('All assets loaded successfully!');
                this.onAssetsLoaded();
            })
            .catch((error) => {
                console.error('Failed to load assets:', error);
                // Показываем стартовый экран даже при ошибке загрузки
                this.onAssetsLoaded();
            });
    }
    
    onAssetsLoaded() {
        const elapsedTime = performance.now() - this.loadStartTime;
        const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);
        
        console.log(`Assets loaded in ${elapsedTime.toFixed(0)}ms, waiting ${remainingTime.toFixed(0)}ms more...`);
        
        // Ждем оставшееся время до минимума
        setTimeout(() => {
            this.assetsLoaded = true;
            this.showStartScreen();
        }, remainingTime);
    }
    
    showStartScreen() {
        // Скрываем экран загрузки
        this.loadingScreenElement.style.display = 'none';
        
        // Инициализируем игровые объекты для фоновой анимации
        this.setupGameObjects();
        
        // Создаем плитки выбора машин
        this.createCarSelectionTiles();
        
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
    
    createCarSelectionTiles() {
        // Очищаем существующие плитки
        this.carGridElement.innerHTML = '';
        
        // Получаем все типы машин
        const carTypes = Object.entries(CONFIG.SPRITES.PLAYER_CARS);
        
        // Создаем первую строку (3 машины)
        const firstRow = document.createElement('div');
        firstRow.className = 'car-row';
        
        // Создаем вторую строку (2 машины)
        const secondRow = document.createElement('div');
        secondRow.className = 'car-row';
        
        // Создаем плитки для каждого типа машины
        carTypes.forEach(([carType, carPath], index) => {
            const tile = document.createElement('div');
            tile.className = 'car-tile';
            tile.dataset.carType = carType;
            
            // Создаем изображение
            const img = document.createElement('img');
            img.src = carPath;
            img.alt = carType;
            img.onload = () => {
                // Изображение загружено
            };
            img.onerror = () => {
                console.warn(`Failed to load car image: ${carPath}`);
            };
            
            tile.appendChild(img);
            
            // Добавляем обработчик клика
            tile.addEventListener('click', () => {
                this.selectCar(carType);
            });
            
            // Выбираем машину по умолчанию
            if (carType === this.selectedCarType) {
                tile.classList.add('selected');
            }
            
            // Добавляем в соответствующую строку
            if (index < 3) {
                firstRow.appendChild(tile);
            } else {
                secondRow.appendChild(tile);
            }
        });
        
        // Добавляем строки в сетку
        this.carGridElement.appendChild(firstRow);
        this.carGridElement.appendChild(secondRow);
        
        // Активируем кнопку старта, если машина выбрана
        this.updateStartButton();
    }
    
    getCarDisplayName(carType) {
        const names = {
            sedan: 'Седан',
            coupe: 'Купе',
            van: 'Фургон',
            suv: 'Внедорожник',
            convertible: 'Кабриолет'
        };
        return names[carType] || carType;
    }
    
    selectCar(carType) {
        // Мгновенно обновляем визуальное выделение
        const previousSelected = this.carGridElement.querySelector('.car-tile.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        const newSelected = this.carGridElement.querySelector(`[data-car-type="${carType}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
        }
        
        // Обновляем выбранный тип машины
        this.selectedCarType = carType;
        
        // Активируем кнопку старта
        this.updateStartButton();
        
        // Асинхронно обновляем спрайт игрока (не блокирует UI)
        setTimeout(() => {
            if (this.player && this.assetLoader) {
                this.player.setCarType(carType, this.assetLoader);
                console.log(`Player sprite updated, loaded: ${this.player.sprite.loaded}, error: ${this.player.sprite.loadError}`);
            } else {
                console.warn('Player or assetLoader not available for car type change');
            }
        }, 0);
    }
    
    updateStartButton() {
        if (this.selectedCarType) {
            this.startBtn.disabled = false;
        } else {
            this.startBtn.disabled = true;
        }
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
        if (!this.gameRunning || !this.isTabVisible || document.hidden || this.gamePausedByTab) {
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
        
        // Проверяем событие "закончился бензин" (только если включено в конфигурации)
        if (CONFIG.GAME.FUEL_EVENT_ENABLED && !this.fuelEventTriggered && this.score >= this.fuelEventDistance) {
            this.triggerFuelEvent();
        }
    }
    
    triggerFuelEvent() {
        this.fuelEventTriggered = true;
        this.isSlowingDown = true;
        this.slowDownSpeed = this.gameSpeed;
        
        // Сохраняем текущую скорость препятствий
        this.obstacleSpeedAtSlowDown = CONFIG.GAME.BASE_SPEED;
        
        // Сразу меняем направление препятствий на 'up'
        CONFIG.OBSTACLE.DIRECTION = 'up';
        
        // Показываем индикатор топлива
        this.fuelIndicatorVisible = true;
        this.fuelIndicatorLastSwitch = performance.now();
        
        // Плавное замедление до минимальной скорости
        this.slowDownToMinSpeed();
    }
    
    slowDownToMinSpeed() {
        const slowDownDuration = 2000; // 2 секунды на замедление
        const minSpeed = CONFIG.GAME.BASE_SPEED * 0.3; // Минимальная скорость (30% от базовой)
        const startTime = performance.now();
        
        const animateSlowDown = (currentTime) => {
            // Проверяем, не была ли анимация отменена
            if (this.slowDownAnimationId === null) {
                return;
            }
            
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / slowDownDuration, 1);
            
            // Плавное замедление с использованием ease-out функции
            const easeOut = 1 - Math.pow(1 - progress, 3);
            // Замедляем до минимальной скорости, а не до полной остановки
            this.gameSpeed = this.slowDownSpeed - (this.slowDownSpeed - minSpeed) * easeOut;
            
            if (progress < 1) {
                this.slowDownAnimationId = requestAnimationFrame(animateSlowDown);
            } else {
                // Достигли минимальной скорости
                this.gameSpeed = minSpeed;
                this.isSlowingDown = false;
                this.slowDownAnimationId = null;
                
                // Показываем затемнение и поп-ап
                this.screenFadeElement.classList.add('active');
                setTimeout(() => {
                    this.fuelEmptyElement.style.display = 'block';
                    this.isFuelScreenVisible = true;
                    this.inputManager.setFuelScreenVisible(true);
                }, 300);
            }
        };
        
        this.slowDownAnimationId = requestAnimationFrame(animateSlowDown);
    }
    
    
    stopSlowDownAnimation() {
        if (this.slowDownAnimationId !== null) {
            cancelAnimationFrame(this.slowDownAnimationId);
            this.slowDownAnimationId = null;
            this.isSlowingDown = false;
        }
    }
    
    refuel() {
        // Скрываем поп-ап
        this.fuelEmptyElement.style.display = 'none';
        this.isFuelScreenVisible = false;
        this.inputManager.setFuelScreenVisible(false);
        
        // Убираем затемнение
        this.screenFadeElement.classList.remove('active');
        
        // Возвращаем направление препятствий к нормальному
        CONFIG.OBSTACLE.DIRECTION = 'down';
        
        // Скрываем индикатор топлива
        this.fuelIndicatorVisible = false;
        
        // Плавное ускорение до стандартной скорости
        this.accelerateToNormalSpeed();
    }
    
    accelerateToNormalSpeed() {
        const accelerationDuration = 2000; // 2 секунды на ускорение
        const startTime = performance.now();
        const targetSpeed = CONFIG.GAME.BASE_SPEED;
        
        const animateAcceleration = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / accelerationDuration, 1);
            
            // Плавное ускорение с использованием ease-out функции
            const easeOut = 1 - Math.pow(1 - progress, 3);
            this.gameSpeed = targetSpeed * easeOut;
            
            if (progress < 1) {
                requestAnimationFrame(animateAcceleration);
            } else {
                // Достигли стандартной скорости
                this.gameSpeed = targetSpeed;
                this.isAccelerating = false;
            }
        };
        
        requestAnimationFrame(animateAcceleration);
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
        
        // Сбрасываем состояние видимости вкладки
        this.isTabVisible = true;
        this.wasGameRunningBeforeHide = false;
        this.gamePausedByTab = false;
        this.pauseStartTime = 0;
        
        // Сбрасываем состояние события заправки при паузе
        this.wasFuelScreenVisibleBeforePause = false;
        this.wasSlowingDownBeforePause = false;
        this.wasFuelEventTriggeredBeforePause = false;
        this.wasFuelEventCompletedBeforePause = false;
        
        // Очищаем интервал проверки видимости
        if (this.visibilityCheckInterval) {
            clearInterval(this.visibilityCheckInterval);
            this.visibilityCheckInterval = null;
        }
        
        // Перезапускаем периодическую проверку
        this.visibilityCheckInterval = setInterval(() => {
            if (document.hidden && this.gameRunning) {
                console.log('Periodic check: tab is hidden, pausing game');
                this.handleVisibilityChange();
            }
        }, 100);
        
        // Сбрасываем состояние события "закончился бензин"
        this.fuelEventTriggered = false;
        this.isSlowingDown = false;
        this.isAccelerating = false;
        this.slowDownSpeed = 0;
        this.accelerationSpeed = 0;
        this.isFuelScreenVisible = false;
        this.slowDownAnimationId = null;
        this.isChangingDirection = false;
        this.directionChangeAnimationId = null;
        this.obstacleSpeedAtSlowDown = null;
        
        // Сбрасываем состояние столкновения
        this.isCollisionInProgress = false;
        
        // Сбрасываем состояние изменения направления препятствий
        this.obstaclesReversed = false;
        
        // Сбрасываем индикатор топлива
        this.fuelIndicatorVisible = false;
        this.fuelIndicatorCurrentFrame = 0;
        this.fuelIndicatorLastSwitch = 0;
        
        // Возвращаем направление препятствий к нормальному
        CONFIG.OBSTACLE.DIRECTION = 'down';
        
        this.obstacleManager.clear();
        this.player.reset();
        
        // Обновляем тип машины при рестарте
        this.player.setCarType(this.selectedCarType, this.assetLoader);
        
        this.gameOverElement.style.display = 'none';
        this.fuelEmptyElement.style.display = 'none';
        this.gamePausedElement.style.display = 'none';
        this.screenFadeElement.classList.remove('active');
        this.inputManager.setFuelScreenVisible(false);
        
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
        
        // Отрисовываем индикатор топлива
        this.drawFuelIndicator();
    }
    
    update(deltaTime) {
        if (!this.gameRunning || !this.isTabVisible || document.hidden || this.gamePausedByTab) return;
        
        // Обновляем игрока с учетом скорости поворота
        const turnSpeedMultiplier = this.isSlowingDown ? (this.gameSpeed / CONFIG.GAME.BASE_SPEED) : 1;
        this.player.update(deltaTime, turnSpeedMultiplier);
        
        // Препятствия используют сохраненную скорость во время замедления игрока
        const obstacleSpeed = this.isSlowingDown ? this.obstacleSpeedAtSlowDown : this.gameSpeed;
        // Во время экрана заправки не спавним новые препятствия
        const allowSpawning = !this.isFuelScreenVisible;
        // Передаем информацию о том, что препятствия развернуты
        this.obstacleManager.update(deltaTime, this.gameSpeed, obstacleSpeed, this.player.y, this.isSlowingDown, allowSpawning, this.obstaclesReversed);
        
        // Дорога замедляется вместе с игроком для реалистичности
        this.road.update(deltaTime, this.gameSpeed);
        
        // Проверяем столкновения (всегда, кроме ускорения)
        if (!this.isAccelerating && !this.isCollisionInProgress && this.obstacleManager.checkCollisions(this.player)) {
            // Устанавливаем флаг столкновения
            this.isCollisionInProgress = true;
            
            // Запускаем тряску для игрока при столкновении
            this.player.startShake(CONFIG.SHAKE.COLLISION_INTENSITY, CONFIG.SHAKE.COLLISION_DURATION);
            
            // Останавливаем движение игрока
            this.player.stopMovement();
            
            // Меняем направление всех препятствий на "вверх"
            this.obstaclesReversed = true;
            this.obstacleManager.reverseAllObstacles();
            
            // Останавливаем анимацию замедления, если она активна
            this.stopSlowDownAnimation();
            
            // Если экран бензина виден, скрываем его и показываем game over
            if (this.isFuelScreenVisible) {
                this.fuelEmptyElement.style.display = 'none';
                this.screenFadeElement.classList.remove('active');
                this.isFuelScreenVisible = false;
                this.inputManager.setFuelScreenVisible(false);
            }
            
            // Задержка перед game over, чтобы тряска успела проиграться
            setTimeout(() => {
                this.gameOver();
            }, 600); // 600ms - время тряски
            return;
        }
        
        this.updateScore(deltaTime);
        
        // Обновляем анимацию индикатора топлива
        this.updateFuelIndicator();
        
        // Помечаем, что нужна перерисовка
        this.needsRedraw = true;
    }
    
    updateFuelIndicator() {
        if (!this.fuelIndicatorVisible) return;
        
        const currentTime = performance.now();
        const timeSinceLastSwitch = currentTime - this.fuelIndicatorLastSwitch;
        
        // Переключаем кадр каждые 600ms
        if (timeSinceLastSwitch >= CONFIG.ANIMATION.FUEL_INDICATOR_SWITCH_INTERVAL) {
            this.fuelIndicatorCurrentFrame = (this.fuelIndicatorCurrentFrame + 1) % 2;
            this.fuelIndicatorLastSwitch = currentTime;
        }
    }
    
    drawFuelIndicator() {
        if (!this.fuelIndicatorVisible || !this.fuelIndicatorSprites.length) return;
        
        // Проверяем, что текущий спрайт загружен
        const currentSprite = this.fuelIndicatorSprites[this.fuelIndicatorCurrentFrame];
        if (!currentSprite || !currentSprite.loaded) return;
        
        // Позиция индикатора: левый нижний угол касается правого верхнего угла машины
        const indicatorX = this.player.x + this.player.width + CONFIG.FUEL_INDICATOR.OFFSET_X;
        const indicatorY = this.player.y + CONFIG.FUEL_INDICATOR.OFFSET_Y;
        
        // Отрисовываем текущий кадр анимации
        currentSprite.draw(this.ctx, indicatorX, indicatorY);
    }
    
    gameLoop(currentTime = 0) {
        // Проверяем видимость вкладки и состояние игры
        if (!this.gameRunning || !this.isTabVisible || document.hidden || this.gamePausedByTab) {
            console.log('Game loop stopped - gameRunning:', this.gameRunning, 'isTabVisible:', this.isTabVisible, 'document.hidden:', document.hidden, 'gamePausedByTab:', this.gamePausedByTab);
            return;
        }
        
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
