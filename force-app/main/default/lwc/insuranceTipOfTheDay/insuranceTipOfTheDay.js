import { LightningElement } from 'lwc';

export default class InsuranceTipOfTheDay extends LightningElement {
    tips = [
        "📌 Vérifiez toujours que votre contrat couvre les soins à l’étranger.",
        "🩺 Gardez une copie numérique de vos factures médicales.",
        "📅 Déclarez vos réclamations dans les délais pour éviter tout refus.",
        "🔐 Protégez vos données médicales : ne les partagez que sur des canaux sécurisés.",
        "🧾 Conservez vos justificatifs pendant au moins 2 ans.",
        "📍 Vérifiez si vous êtes éligible à une surcomplémentaire santé.",
        "🔍 Lisez bien les exclusions de garantie dans votre contrat.",
        "💬 En cas de doute, contactez votre conseiller avant d'engager des frais.",
        "⚖️ Certaines garanties peuvent être transférées à vos ayants droit.",
        "📱 Utilisez votre espace client pour suivre vos remboursements en temps réel."
    ];

    currentTip;

    connectedCallback() {
        const today = new Date();
        const index = today.getDate() % this.tips.length;
        this.currentTip = this.tips[index];
    }
}
