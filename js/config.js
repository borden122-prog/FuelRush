// Конфигурация игры Fuel Rush
export const CONFIG = {
    // Игровые параметры
    GAME: {
        BASE_SPEED: 0.5,
        OBSTACLE_SPAWN_RATE: 0.01,
        SCORE_MULTIPLIER: 0.1 // Уменьшено для подсчета метров (было 5)
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
        MOVE_DISTANCE: 3 // пикселей за кадр
    },
    
    // Препятствия
    OBSTACLE: {
        WIDTH: 80,  // Увеличено в 2 раза
        HEIGHT: 120, // Увеличено в 2 раза
        COLLISION_WIDTH: 72, // Ширина коллизионной модели (на 10% меньше)
        COLLISION_HEIGHT: 120, // Высота коллизионной модели (без изменений)
        COLOR: '#e74c3c',
        SPEED_MULTIPLIER: 0.6 // относительно скорости игры
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
        FADE_DURATION: 200 // мс
    },
    
    // Высокое разрешение
    DISPLAY: {
        PIXEL_RATIO: window.devicePixelRatio || 1,
        MAX_PIXEL_RATIO: 2 // Ограничиваем для производительности
    },
    
    // Спрайты
    SPRITES: {
        PLAYER_CAR: 'assets/images/player-car.png',
        OBSTACLE_CAR: 'assets/images/obstacle-car.png',
        ROAD_TEXTURE: 'assets/images/road-texture.png'
    }
};
