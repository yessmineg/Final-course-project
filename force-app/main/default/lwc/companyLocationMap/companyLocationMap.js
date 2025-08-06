import { LightningElement, track, api } from 'lwc';

export default class CompanyLocationMap extends LightningElement {
    @api latitude = 48.8566;  // Paris
    @api longitude = 2.3522;

    @track markers = [];

    connectedCallback() {
        this.markers = [
            {
                location: {
                    Latitude: this.latitude,
                    Longitude: this.longitude
                },
                title: '🏢 Siège de la Société',
                description: 'Cliquez pour plus d\'informations sur notre siège.'
            }
        ];
    }

    get center() {
        return {
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            }
        };
    }

    get mapOptions() {
        return {
            draggable: true,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true
        };
    }

    get googleMapsLink() {
        return `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
    }
}
