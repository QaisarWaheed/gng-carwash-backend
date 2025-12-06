/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  placeId: string;
  formattedAddress: string;
}

interface ReverseGeocodeResult {
  streetAddress?: string;
  area?: string;
  city?: string;
  emirate?: string;
  formattedAddress: string;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';
  private readonly serviceAreaCenterLat: number;
  private readonly serviceAreaCenterLng: number;
  private readonly serviceAreaRadiusKm: number;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    this.serviceAreaCenterLat = parseFloat(
      this.configService.get<string>('SERVICE_AREA_CENTER_LAT') || '25.2048',
    );
    this.serviceAreaCenterLng = parseFloat(
      this.configService.get<string>('SERVICE_AREA_CENTER_LNG') || '55.2708',
    );
    this.serviceAreaRadiusKm = parseFloat(
      this.configService.get<string>('SERVICE_AREA_RADIUS_KM') || '50',
    );
  }

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    if (!this.apiKey) {
      this.logger.warn('Google Maps API key not configured. Skipping geocoding.');
      throw new Error('Google Maps API key not configured');
    }

    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results[0]) {
        const result = data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          placeId: result.place_id,
          formattedAddress: result.formatted_address,
        };
      }

      this.logger.error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
      throw new Error(`Unable to geocode address: ${data.status}`);
    } catch (error) {
      this.logger.error('Geocoding error:', error);
      throw error;
    }
  }


  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    if (!this.apiKey) {
      this.logger.warn('Google Maps API key not configured. Skipping reverse geocoding.');
      throw new Error('Google Maps API key not configured');
    }

    try {
      const url = `${this.baseUrl}/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results[0]) {
        const result = data.results[0];
        const components = result.address_components;

        const getComponent = (types: string[]): string | undefined => {
          const component = components.find((c: any) =>
            types.some((type) => c.types.includes(type)),
          );
          return component?.long_name;
        };

        return {
          streetAddress:
            getComponent(['route']) ||
            getComponent(['street_address']) ||
            getComponent(['premise']),
          area:
            getComponent(['sublocality', 'sublocality_level_1']) ||
            getComponent(['neighborhood']),
          city: getComponent(['locality', 'administrative_area_level_2']),
          emirate: getComponent(['administrative_area_level_1']),
          formattedAddress: result.formatted_address,
        };
      }

      this.logger.error(`Reverse geocoding failed: ${data.status}`);
      throw new Error(`Unable to reverse geocode coordinates: ${data.status}`);
    } catch (error) {
      this.logger.error('Reverse geocoding error:', error);
      throw error;
    }
  }


  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }


  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }


  async isWithinServiceArea(lat: number, lng: number): Promise<boolean> {
    const distance = this.calculateDistance(
      lat,
      lng,
      this.serviceAreaCenterLat,
      this.serviceAreaCenterLng,
    );

    const isWithin = distance <= this.serviceAreaRadiusKm;

    if (!isWithin) {
      this.logger.warn(
        `Location (${lat}, ${lng}) is ${distance.toFixed(2)}km from service center, exceeds ${this.serviceAreaRadiusKm}km limit`,
      );
    }

    return isWithin;
  }


  getServiceAreaInfo() {
    return {
      center: {
        latitude: this.serviceAreaCenterLat,
        longitude: this.serviceAreaCenterLng,
      },
      radiusKm: this.serviceAreaRadiusKm,
      configured: !!this.apiKey,
    };
  }
}
