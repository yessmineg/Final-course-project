import { LightningElement } from 'lwc';
import gif1 from '@salesforce/resourceUrl/gif1';
import gif2 from '@salesforce/resourceUrl/gif2';
import gif3 from '@salesforce/resourceUrl/gif3';
import gif4 from '@salesforce/resourceUrl/gif4';
import gif5 from '@salesforce/resourceUrl/gif5';
import gif6 from '@salesforce/resourceUrl/gif6';

export default class ImageCarousel extends LightningElement {
    images = [
        { src: gif1, caption: 'Fast & Reliable Claim Processing' },
        { src: gif2, caption: 'Smooth Customer Experience' },
        { src: gif3, caption: 'Real-Time Claim Tracking' },
        { src: gif4, caption: 'AI-Powered Health Insights'},
        { src: gif5, caption: 'Adaptable solutions' },
        { src: gif6, caption: 'Customer satisfaction' }
    ];

    currentIndex = 0;
    intervalId;

    get currentImage() {
        return this.images[this.currentIndex];
    }

    get dotList() {
        return this.images.map((_, index) => {
            return {
                index,
                class: `dot ${index === this.currentIndex ? 'active' : ''}`
            };
        });
    }

    connectedCallback() {
        this.startAutoPlay();
    }

    disconnectedCallback() {
        clearInterval(this.intervalId);
    }

    startAutoPlay() {
        this.intervalId = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
        }, 6000);
    }

    handleDotClick(event) {
        this.currentIndex = parseInt(event.target.dataset.index, 10);
    }
}
