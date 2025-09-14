import { CONFIG } from './config.js';

export class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
    }

    // Добавление ассета для загрузки
    addAsset(key, url) {
        this.assets.set(key, {
            url: url,
            loaded: false,
            error: false,
            image: null
        });
        this.totalCount++;
    }

    // Загрузка всех ассетов
    loadAll() {
        return new Promise((resolve, reject) => {
            this.onComplete = resolve;
            this.onError = reject;

            if (this.totalCount === 0) {
                resolve();
                return;
            }

            // Загружаем все ассеты
            for (const [key, asset] of this.assets) {
                this.loadAsset(key, asset);
            }
        });
    }

    // Загрузка одного ассета
    loadAsset(key, asset) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        
        image.onload = () => {
            asset.loaded = true;
            asset.image = image;
            this.loadedCount++;
            
            console.log(`Loaded asset: ${key} (${this.loadedCount}/${this.totalCount})`);
            
            // Вызываем callback прогресса
            if (this.onProgress) {
                this.onProgress(this.loadedCount, this.totalCount);
            }
            
            // Проверяем, загружены ли все ассеты
            if (this.loadedCount === this.totalCount) {
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        };
        
        image.onerror = () => {
            asset.error = true;
            console.error(`Failed to load asset: ${key} from ${asset.url}`);
            
            if (this.onError) {
                this.onError(new Error(`Failed to load asset: ${key}`));
            }
        };
        
        image.src = asset.url;
    }

    // Получение загруженного ассета
    getAsset(key) {
        const asset = this.assets.get(key);
        if (asset && asset.loaded) {
            return asset.image;
        }
        return null;
    }

    // Проверка готовности ассета
    isAssetReady(key) {
        const asset = this.assets.get(key);
        return asset && asset.loaded && !asset.error;
    }

    // Проверка готовности всех ассетов
    areAllAssetsReady() {
        return this.loadedCount === this.totalCount;
    }

    // Получение прогресса загрузки (0-1)
    getProgress() {
        if (this.totalCount === 0) return 1;
        return this.loadedCount / this.totalCount;
    }

    // Инициализация загрузки всех игровых ассетов
    static loadGameAssets() {
        const loader = new AssetLoader();
        
        // Добавляем все ассеты из конфигурации
        loader.addAsset('playerCar', CONFIG.SPRITES.PLAYER_CAR);
        loader.addAsset('obstacleCar', CONFIG.SPRITES.OBSTACLE_CAR);
        loader.addAsset('roadTexture', CONFIG.SPRITES.ROAD_TEXTURE);
        
        return loader;
    }
}
