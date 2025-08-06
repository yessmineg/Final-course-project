import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import oneImage from '@salesforce/resourceUrl/one';
import twoImage from '@salesforce/resourceUrl/two';
import threeImage from '@salesforce/resourceUrl/three';
import fourImage from '@salesforce/resourceUrl/four';

export default class Process extends NavigationMixin(LightningElement) {
    darkMode = false;

    get steps() {
        const rawSteps = [
            {
                image: oneImage,
                title: 'Step 1: Understand What You Need',
                description: `🔍 Buying insurance always starts with knowing what you're protecting.<br>
                Are you covering your <strong>health</strong>, <strong>car</strong>, <strong>home</strong>, or <strong>loved ones</strong>?<br>
                💡 Evaluate your <strong>lifestyle</strong>, <strong>financial responsibilities</strong>, and <strong>risk tolerance</strong>.<br>
                💰 Consider your <strong>budget</strong> and make sure you’re not under- or over-insuring.`
            },
            {
                image: twoImage,
                title: 'Step 2: Explore Your Options',
                description: `📋 Once you know your needs, look at what we offer.<br>
                We provide a variety of plans tailored for <strong>every stage of life</strong> and <strong>every budget</strong>.<br>
                💼 Whether it’s basic coverage or comprehensive protection, we’re here to assist.`
            },
            {
                image: threeImage,
                title: 'Step 3: Get a Personalized Quote',
                description: `💬 Tell us a bit about yourself, and we’ll provide a <strong>customized quote</strong> instantly.<br>
                ✅ No hidden fees, no pressure — just clear, honest pricing.<br>
                📝 Save your quote and come back anytime.`
            },
            {
                image: fourImage,
                title: 'Step 4: Purchase & Stay Protected',
                description: `🛒 Ready to move forward? Great! You can <strong>buy online in minutes</strong>.<br>
                🔄 Review your plan annually to adjust for life changes.<br>
                🛡️ You're now protected — and we’re here whenever you need us.`
            }
        ];

        return rawSteps.map((step, index) => ({
            ...step,
            stepNumber: index + 1,
            showArrow: index < rawSteps.length - 1,
            computedClass: `timeline-step delay-${index}`,
            ariaLabelledBy: `step-title-${index + 1}`,
            ariaDescribedBy: `step-desc-${index + 1}`,
            imgAlt: `Illustration for ${step.title}`,
            arrowKey: `arrow-${index}`,
            groupKey: `group-${index}` // ✅ Add this line to fix the HTML key error
        }));
    }

    get darkModeToggleTitle() {
        return this.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    handleNavigate() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/products'
            }
        });
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
    }
}
