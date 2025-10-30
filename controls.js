export class Controls {
    constructor() {
        this.tilt = 0;
        this.isIOS = typeof DeviceOrientationEvent.requestPermission === 'function' || typeof DeviceMotionEvent.requestPermission === 'function';
        this.lastCastTime = 0;
    }
    
    #addEventListeners() {
        window.addEventListener('deviceorientation', (event) => {
            // gamma is the left-to-right tilt in degrees, where right is positive
            let tiltLR = event.gamma;
            // Cap the tilt value for sensitivity control
            this.tilt = Math.max(-45, Math.min(45, tiltLR));
        });

        window.addEventListener('devicemotion', (event) => {
            if (event.rotationRate) {
                // beta is rotation around x-axis (front to back). A sharp forward flick has a large positive beta.
                if (event.rotationRate.beta > 350) { // Cast threshold
                    this.lastCastTime = Date.now();
                }
            }
        });
    }

    async requestPermission() {
        if (!this.isIOS) {
            this.#addEventListeners();
            return true; // Non-iOS devices don't need permission
        }

        try {
            let motionGranted = true;
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const motionPermission = await DeviceMotionEvent.requestPermission();
                motionGranted = motionPermission === 'granted';
            }

            let orientationGranted = true;
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                const orientationPermission = await DeviceOrientationEvent.requestPermission();
                orientationGranted = orientationPermission === 'granted';
            }
            
            if (motionGranted && orientationGranted) {
                this.#addEventListeners();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Permission request for device motion/orientation failed.", error);
            return false;
        }
    }

    wasCastRecently(windowMs = 250) {
        return (Date.now() - this.lastCastTime) < windowMs;
    }

    getTilt() {
        return this.tilt;
    }
}

