// Конфигурация игры Fuel Rush
export const CONFIG = {
    // Игровые параметры
    GAME: {
        BASE_SPEED: 0.5,
        OBSTACLE_SPAWN_RATE: 0.01,
        SCORE_MULTIPLIER: 0.1, // Уменьшено для подсчета метров (было 5)
        FUEL_EVENT_ENABLED: false // Флаг для включения/выключения события заправки (изменить на true для включения)
    },
    
    // Игрок
    PLAYER: {
        WIDTH: 80,  // Увеличено в 2 раза
        HEIGHT: 120, // Увеличено в 2 раза
        COLLISION_WIDTH: 72, // Ширина коллизионной модели (на 10% меньше)
        COLLISION_HEIGHT: 120, // Высота коллизионной модели (без изменений)
        COLOR: '#3498db',
        MOVE_SPEED: 0.15,
        TURN_SPEED: 0.08,
        TURN_ANGLE: 5, // градусы
        MOVE_DISTANCE: 4 // пикселей за кадр
    },
    
    // Препятствия
    OBSTACLE: {
        WIDTH: 80,  // Увеличено в 2 раза
        HEIGHT: 120, // Увеличено в 2 раза
        COLLISION_WIDTH: 72, // Ширина коллизионной модели (на 10% меньше)
        COLLISION_HEIGHT: 120, // Высота коллизионной модели (без изменений)
        COLOR: '#e74c3c',
        SPEED_MULTIPLIER: 0.6, // относительно скорости игры
        DIRECTION: 'down' // 'down' - движение вниз, 'up' - движение вверх
    },
    
    // Дорога
    ROAD: {
        LANES: 3,
        ROAD_COLOR: '#34495e',
        BACKGROUND_COLOR: '#2c3e50',
        ANIMATION_SPEED: 1.2 // Коэффициент скорости анимации дороги (больше = быстрее)
    },
    
    // UI
    UI: {
        SCORE_COLOR: 'white',
        SCORE_FONT_SIZE: 24,
        GAME_OVER_BG: 'rgba(0,0,0,0.9)',
        GAME_OVER_BORDER: '#e74c3c',
        BUTTON_COLOR: '#27ae60',
        BUTTON_HOVER: '#2ecc71',
        BUTTON_ACTIVE: '#229954'
    },
    
    // Анимация
    ANIMATION: {
        FADE_DURATION: 200, // мс
        FUEL_INDICATOR_SWITCH_INTERVAL: 600 // мс
    },
    
    // Тряска при столкновении
    SHAKE: {
        COLLISION_INTENSITY: 5, // пикселей
        COLLISION_DURATION: 600, // мс
        OTHER_CARS_INTENSITY: 3, // пикселей для остальных машин
        OTHER_CARS_DURATION: 400 // мс для остальных машин
    },
    
    // Индикатор топлива
    FUEL_INDICATOR: {
        WIDTH: 80,  // Увеличиваем размер для лучшей видимости
        HEIGHT: 67, // Сохраняем соотношение сторон 270:226 ≈ 1.19
        OFFSET_X: -10, // Смещаем влево, чтобы левый край касался правого края машины
        OFFSET_Y: -67 // Смещаем вверх, чтобы нижний край касался верхнего края машины
    },
    
    // Высокое разрешение
    DISPLAY: {
        PIXEL_RATIO: window.devicePixelRatio || 1,
        MAX_PIXEL_RATIO: 2 // Ограничиваем для производительности
    },
    
    // Спрайты
    SPRITES: {
        PLAYER_CARS: {
            sedan: 'assets/images/sedan.png',
            coupe: 'assets/images/coupe.png',
            van: 'assets/images/van.png',
            suv: 'assets/images/suv.png',
            convertible: 'assets/images/convertible.png'
        },
        OBSTACLE_CARS: [
            'assets/images/obstacle-car1.png',
            'assets/images/obstacle-car2.png',
            'assets/images/obstacle-car3.png',
            'assets/images/obstacle-car4.png',
            'assets/images/obstacle-car5.png'
        ],
        ROAD_TEXTURE: 'assets/images/road-texture.png',
        FUEL_CHECK: [
            'assets/images/fuel-check1.png',
            'assets/images/fuel-check2.png'
        ]
    },
    
    // Выбор машины
    CAR_SELECTION: {
        DEFAULT_CAR: 'sedan',
        PREVIEW_SIZE: 120,
        GRID_COLUMNS: 3,
        TILE_SPACING: 20
    }
};
