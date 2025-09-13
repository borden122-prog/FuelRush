import { CONFIG } from './config.js';

export class DisplayManager {
    constructor() {
        this.pixelRatio = Math.min(CONFIG.DISPLAY.PIXEL_RATIO, CONFIG.DISPLAY.MAX_PIXEL_RATIO);
        this.backingStoreRatio = 1; // Для совместимости со старыми браузерами
    }
    
    // Настройка canvas для высокого разрешения
    setupCanvas(canvas, width, height) {
        const ctx = canvas.getContext('2d');
        
        // Получаем реальный pixel ratio
        this.pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            CONFIG.DISPLAY.MAX_PIXEL_RATIO
        );
        
        // Устанавливаем размеры canvas в CSS пикселях
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Устанавливаем размеры canvas в реальных пикселях
        canvas.width = width * this.pixelRatio;
        canvas.height = height * this.pixelRatio;
        
        // Масштабируем контекст для высокого разрешения
        ctx.scale(this.pixelRatio, this.pixelRatio);
        
        // Настраиваем сглаживание
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        console.log(`Canvas setup: ${width}x${height}, pixel ratio: ${this.pixelRatio}`);
        
        return {
            canvas,
            ctx,
            pixelRatio: this.pixelRatio,
            logicalWidth: width,
            logicalHeight: height,
            actualWidth: canvas.width,
            actualHeight: canvas.height
        };
    }
    
    // Обновление размеров canvas
    updateCanvasSize(canvas, width, height) {
        const ctx = canvas.getContext('2d');
        
        // Сохраняем текущие настройки
        const currentPixelRatio = this.pixelRatio;
        
        // Устанавливаем новые размеры
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width * this.pixelRatio;
        canvas.height = height * this.pixelRatio;
        
        // Сбрасываем трансформации и применяем масштабирование
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(this.pixelRatio, this.pixelRatio);
        
        // Восстанавливаем настройки сглаживания
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        return {
            canvas,
            ctx,
            pixelRatio: this.pixelRatio,
            logicalWidth: width,
            logicalHeight: height,
            actualWidth: canvas.width,
            actualHeight: canvas.height
        };
    }
    
    // Получение текущего pixel ratio
    getPixelRatio() {
        return this.pixelRatio;
    }
    
    // Проверка, поддерживается ли высокое разрешение
    isHighDPI() {
        return this.pixelRatio > 1;
    }
}
