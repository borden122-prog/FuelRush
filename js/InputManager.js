export class InputManager {
    constructor(canvas, player) {
        this.canvas = canvas;
        this.player = player;
        this.gameRunning = false;
        // Используем логическую ширину canvas (CSS пиксели), а не физическую
        this.canvasWidth = canvas.clientWidth || canvas.offsetWidth;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Обработка касаний для мобильных устройств
        this.canvas.addEventListener('touchstart', this.handleInput.bind(this));
        this.canvas.addEventListener('touchmove', this.handleInput.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Обработка мыши для десктопа
        this.canvas.addEventListener('mousedown', this.handleInput.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    handleInput(e) {
        e.preventDefault();
        if (!this.gameRunning) return;
        
        const inputX = this.getInputX(e);
        const screenCenter = this.canvasWidth / 2;
        
        if (inputX < screenCenter) {
            this.player.moveLeft();
        } else {
            this.player.moveRight();
        }
    }
    
    handleMouseMove(e) {
        e.preventDefault();
        if (!this.gameRunning || e.buttons !== 1) return;
        
        this.handleInput(e);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.player.stopMoving();
    }
    
    handleMouseUp(e) {
        e.preventDefault();
        this.player.stopMoving();
    }
    
    getInputX(e) {
        let clientX;
        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        
        // Получаем позицию canvas относительно viewport
        const canvasRect = this.canvas.getBoundingClientRect();
        // Вычисляем координату X относительно canvas
        return clientX - canvasRect.left;
    }
    
    setGameRunning(running) {
        this.gameRunning = running;
    }
    
    updateCanvasSize(canvasWidth) {
        // Используем логическую ширину canvas
        this.canvasWidth = this.canvas.clientWidth || this.canvas.offsetWidth || canvasWidth;
    }
}
