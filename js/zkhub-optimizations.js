// ZK Gaming Hub - Frontend Optimizations
// See documentation for usage and integration

// 2. IMPROVED LOCAL STORAGE MANAGEMENT
class ZKGameStorage {
    constructor() {
        this.storageKey = 'zk-gaming-hub';
        this.version = '1.2';
        this.maxDataSize = 5 * 1024 * 1024; // 5MB limit
    }
    save(key, data, compress = true) {
        try {
            const payload = {
                data: compress ? this.compress(data) : data,
                timestamp: Date.now(),
                version: this.version,
                compressed: compress
            };
            const serialized = JSON.stringify(payload);
            if (serialized.length > this.maxDataSize) {
                this.cleanup();
            }
            localStorage.setItem(`${this.storageKey}-${key}`, serialized);
            return true;
        } catch (error) {
            console.warn('Storage save failed:', error);
            this.handleStorageError?.(error);
            return false;
        }
    }
    load(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(`${this.storageKey}-${key}`);
            if (!stored) return defaultValue;
            const payload = JSON.parse(stored);
            if (payload.version !== this.version) {
                this.migrate?.(key, payload);
            }
            return payload.compressed ? this.decompress(payload.data) : payload.data;
        } catch (error) {
            console.warn('Storage load failed:', error);
            return defaultValue;
        }
    }
    compress(data) {
        const json = JSON.stringify(data);
        return btoa(json);
    }
    decompress(data) {
        const json = atob(data);
        return JSON.parse(json);
    }
    cleanup() {
        const keys = Object.keys(localStorage);
        const gameKeys = keys.filter(key => key.startsWith(this.storageKey));
        gameKeys.sort().slice(0, Math.floor(gameKeys.length / 2))
            .forEach(key => localStorage.removeItem(key));
    }
    exportData() {
        const data = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.storageKey)) {
                data[key] = localStorage.getItem(key);
            }
        });
        return JSON.stringify(data, null, 2);
    }
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            Object.entries(data).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
}

// 3. ENHANCED PERFORMANCE MONITORING
class PerformanceTracker {
    constructor() {
        this.metrics = new Map();
        this.observer = null;
        this.init();
    }
    init() {
        window.addEventListener('load', () => { this.trackPageLoad(); });
        this.trackGameMetrics();
        this.monitorMemory();
    }
    trackPageLoad() {
        const perfData = performance.getEntriesByType('navigation')[0];
        const metrics = {
            domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart,
            loadComplete: perfData?.loadEventEnd - perfData?.loadEventStart,
            firstContentfulPaint: this.getFCP?.(),
            largestContentfulPaint: this.getLCP?.()
        };
        this.logMetric?.('pageLoad', metrics);
    }
    trackGameMetrics() {
        window.trackProofGeneration = (gameType, startTime) => {
            const duration = performance.now() - startTime;
            this.logMetric?.('proofGeneration', { gameType, duration, timestamp: Date.now() });
        };
    }
    monitorMemory() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.logMetric?.('memory', {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });
            }, 30000);
        }
    }
    getInsights() {
        const insights = [];
        const memoryMetrics = this.metrics.get('memory') || [];
        const latest = memoryMetrics[memoryMetrics.length - 1];
        if (latest && latest.used > latest.limit * 0.8) {
            insights.push({ type: 'warning', message: 'High memory usage detected. Consider refreshing the page.' });
        }
        return insights;
    }
}

// 4. PROGRESSIVE WEB APP ENHANCEMENTS
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }
    init() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton?.();
        });
        this.handleConnectivity();
    }
    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.innerHTML = '📱 Install App';
        installBtn.className = 'install-btn';
        installBtn.onclick = () => this.promptInstall();
        const nav = document.querySelector('.nav-content');
        if (nav) nav.appendChild(installBtn);
    }
    async promptInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const result = await this.deferredPrompt.userChoice;
            if (result.outcome === 'accepted') {
                console.log('User installed the app');
            }
            this.deferredPrompt = null;
        }
    }
    handleConnectivity() {
        const updateOnlineStatus = () => {
            const status = navigator.onLine ? 'online' : 'offline';
            document.body.classList.toggle('offline', !navigator.onLine);
            if (!navigator.onLine) {
                this.showOfflineNotice();
            } else {
                this.hideOfflineNotice?.();
            }
        };
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }
    showOfflineNotice() {
        if (!document.querySelector('.offline-notice')) {
            const notice = document.createElement('div');
            notice.className = 'offline-notice';
            notice.innerHTML = '📶 You\'re offline. Games will continue to work!';
            document.body.appendChild(notice);
        }
    }
}

// 5. ENHANCED ERROR HANDLING & RECOVERY
class ErrorManager {
    constructor() {
        this.errorLog = [];
        this.maxErrors = 50;
        this.init();
    }
    init() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'javascript');
        });
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'promise');
        });
        window.reportGameError = (gameType, error, context) => {
            this.handleError(error, 'game', { gameType, context });
        };
    }
    handleError(error, type, context = {}) {
        const errorData = {
            message: error.message || error,
            stack: error.stack,
            type,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        this.errorLog.push(errorData);
        if (this.errorLog.length > this.maxErrors) {
            this.errorLog.shift();
        }
        this.attemptRecovery(errorData);
        this.storeError?.(errorData);
    }
    attemptRecovery(errorData) {
        if (errorData.message.includes('localStorage')) {
            console.warn('Storage error detected, clearing cache...');
            this.clearCorruptedStorage?.();
        }
        if (errorData.type === 'game' && errorData.context.gameType) {
            console.warn(`Game error in ${errorData.context.gameType}, resetting...`);
            this.resetGameState?.(errorData.context.gameType);
        }
    }
    showUserFriendlyError(error) {
        const errorMessages = {
            'localStorage': 'Storage is full. Would you like to clear some data?',
            'network': 'Connection issue. Please check your internet.',
            'game': 'Game encountered an issue. Restarting...'
        };
        const message = errorMessages[error.type] || 'Something went wrong. Refreshing might help.';
        this.showNotification?.(message, 'error');
    }
    exportErrorLog() {
        return JSON.stringify(this.errorLog, null, 2);
    }
}

// 6. IMPROVED ASSET OPTIMIZATION
class AssetOptimizer {
    constructor() {
        this.imageCache = new Map();
        this.fontCache = new Map();
        this.init();
    }
    init() {
        this.preloadCriticalAssets();
        this.lazyLoadImages();
        this.optimizeFonts?.();
    }
    preloadCriticalAssets() {
        const criticalAssets = [
            '/css/styles.css',
            '/js/zkapi-mock.js',
        ];
        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = asset;
            link.as = asset.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }
    lazyLoadImages() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    detectWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').startsWith('data:image/webp');
    }
}

// 7. DEPLOYMENT OPTIMIZATIONS
class DeploymentOptimizer {
    constructor() {
        this.buildInfo = {
            version: '1.2.0',
            buildTime: new Date().toISOString(),
            features: this.detectFeatures()
        };
    }
    detectFeatures() {
        return {
            serviceWorker: 'serviceWorker' in navigator,
            webAssembly: typeof WebAssembly === 'object',
            webGL: this.hasWebGL(),
            localStorage: typeof Storage !== 'undefined',
            indexedDB: 'indexedDB' in window
        };
    }
    hasWebGL() {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    }
    enableFeatureBasedOptimizations() {
        const features = this.buildInfo.features;
        if (features.webAssembly) {
            console.log('WebAssembly supported - enabling advanced ZK computations');
        }
        if (features.webGL) {
            console.log('WebGL supported - enabling enhanced visualizations');
        }
        if (!features.localStorage) {
            console.warn('localStorage not available - using memory storage');
        }
    }
    optimizeBundleSize() {
        const gameModules = {
            sudoku: () => import('./games/sudoku.js'),
            snake: () => import('./games/snake.js'),
            rps: () => import('./games/rps.js')
        };
        window.loadGame = async (gameType) => {
            if (gameModules[gameType]) {
                const module = await gameModules[gameType]();
                return module.default;
            }
        };
    }
}

// 8. INITIALIZATION AND COORDINATION
class ZKGamingHubOptimized {
    constructor() {
        this.storage = new ZKGameStorage();
        this.performance = new PerformanceTracker();
        this.pwa = new PWAManager();
        this.errors = new ErrorManager();
        this.assets = new AssetOptimizer();
        this.deployment = new DeploymentOptimizer();
        this.init();
    }
    init() {
        this.deployment.enableFeatureBasedOptimizations();
        this.deployment.optimizeBundleSize();
        this.registerServiceWorker();
        this.setupGlobalUtils();
        this.startPerformanceMonitoring();
    }
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registered successfully');
                registration.addEventListener?.('updatefound', () => {
                    this.handleServiceWorkerUpdate?.(registration);
                });
            } catch (error) {
                console.log('ServiceWorker registration failed');
            }
        }
    }
    setupGlobalUtils() {
        window.ZKHub = {
            storage: this.storage,
            reportError: this.errors.handleError.bind(this.errors),
            trackPerformance: this.performance.logMetric?.bind(this.performance),
            isOnline: () => navigator.onLine,
            exportData: () => this.storage.exportData(),
            importData: (data) => this.storage.importData(data)
        };
    }
    startPerformanceMonitoring() {
        setInterval(() => {
            const insights = this.performance.getInsights();
            insights.forEach(insight => {
                if (insight.type === 'warning') {
                    console.warn(insight.message);
                }
            });
        }, 60000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.zkHub = new ZKGamingHubOptimized();
});
