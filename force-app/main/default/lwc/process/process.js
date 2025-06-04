import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import oneImage from '@salesforce/resourceUrl/one';
import twoImage from '@salesforce/resourceUrl/two';
import threeImage from '@salesforce/resourceUrl/three';
import fourImage from '@salesforce/resourceUrl/four';

export default class Process extends NavigationMixin(LightningElement) {
    get steps() {
        const rawSteps = [
            {
                image: oneImage,
                title: 'Step 1: Understand What You Need',
                description: `🔍 Buying insurance alwasys starts with knowing what you're protecting. <br>
                Are you covering your <strong>health</strong>, <strong>car</strong>, <strong>home</strong>, or <strong>loved ones</strong>? <br>   
                💡 Evaluate your lifestyle, <strong>financial responsibilities</strong>, and <strong>risk tolerance</strong>. <br>
                💰 Consider your <strong>budget</strong> and make sure you’re not under- or over-insuring.`
            },
            {
                image: twoImage,
                title: 'Step 2: Explore Your Options',
                description: `📋 Once you know your needs, look at what we offer. <br>
                We provide a variety of plans tailored for <strong>every stage of life</strong> and <strong>every budget</strong>. <br>
                💼 Whether it’s basic coverage or comprehensive protection, we’re here to assist you and help you with your decision making.`
            },
            {
                image: threeImage,
                title: 'Step 3: Get a Personalized Quote',
                description: `💬 Tell us a bit about yourself, and we’ll provide a <strong>customized quote</strong> instantly. <br>
                This includes pricing, coverage details, and optional add-ons. 
                No hidden fees, no pressure — just clear, honest pricing. <br>
                ✅ You can even save your quote and come back later.`
            },
            {
                image: fourImage,
                title: 'Step 4: Purchase & Stay Protected',
                description: `🛒 Ready to move forward? Great! You can <strong>buy online in just minutes</strong>. <br>
                🔄 Review your plan annually to adjust for life changes. <br>
                🛡️ You're now protected — and we’re here if you ever need support.`
            }
        ];

        return rawSteps.map((step, index) => ({
            ...step,
            showArrow: index < rawSteps.length - 1
        }));
    }

    handleNavigate() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/products'
            }
        });
    }
}
