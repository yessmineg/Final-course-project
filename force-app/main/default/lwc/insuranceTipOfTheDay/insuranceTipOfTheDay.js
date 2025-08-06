import { LightningElement } from 'lwc';

export default class InsuranceTipOfTheDay extends LightningElement {
    tips = [
        "📌 Always check if your policy covers international medical care.",
        "🩺 Keep a digital copy of your medical receipts.",
        "📅 Submit your claims within the deadline to avoid rejection.",
        "🔐 Protect your medical data – share it only via secure channels.",
        "🧾 Keep your supporting documents for at least 2 years.",
        "📍 Check if you're eligible for supplemental health coverage.",
        "🔍 Read the exclusions in your contract carefully.",
        "💬 If unsure, contact your advisor before incurring any costs.",
        "⚖️ Some benefits may be transferred to your dependents.",
        "📱 Use your client portal to track your reimbursements in real time."
    ];

    currentIndex = 0;
    rotationInterval;
    progressInterval;
    progressValue = 0;
    progressStep = 1.666; // 100 / 60 steps = 6 seconds
    intervalMs = 100; // progress updates every 100ms
    tipChangeMs = 6000; // tip changes every 6 seconds

    get currentTip() {
        return this.tips[this.currentIndex];
    }

    connectedCallback() {
        this.startRotation();
        this.startProgress();
    }

    disconnectedCallback() {
        this.stopRotation();
        this.stopProgress();
    }

    startRotation() {
        if (this.rotationInterval) return;

        this.rotationInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.tips.length;
            this.animateTip();
            this.resetProgress();
        }, this.tipChangeMs);
    }

    stopRotation() {
        clearInterval(this.rotationInterval);
        this.rotationInterval = null;
    }

    startProgress() {
        this.progressValue = 0;
        this.progressInterval = setInterval(() => {
            this.progressValue += this.progressStep;
            const bar = this.template.querySelector('.progress-bar-fill');
            if (bar) {
                bar.style.width = `${Math.min(this.progressValue, 100)}%`;
            }
        }, this.intervalMs);
    }

    stopProgress() {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
    }

    resetProgress() {
        this.progressValue = 0;
        const bar = this.template.querySelector('.progress-bar-fill');
        if (bar) {
            bar.style.width = `0%`;
        }
    }

    animateTip() {
        const tipElement = this.template.querySelector('.tip-text');
        if (tipElement) {
            tipElement.classList.remove('fade-in');
            void tipElement.offsetWidth;
            tipElement.classList.add('fade-in');
        }
    }

    handleMouseEnter() {
        this.stopRotation();
        this.stopProgress();
    }

    handleMouseLeave() {
        this.startRotation();
        this.startProgress();
    }
}
