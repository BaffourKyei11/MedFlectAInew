import crypto from 'crypto';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { EhrConnection } from '@shared/schema';

// FHIR Capability Statement types
interface FhirCapabilityStatement {
  resourceType: string;
  id: string;
  status: string;
  date: string;
  publisher?: string;
  version?: string;
  fhirVersion?: string;
  format: string[];
  rest: Array<{
    mode: string;
    resource?: Array<{
      type: string;
      interaction: Array<{
        code: string;
      }>;
    }>;
  }>;
}

// OAuth Token Response
interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
}

// Validation Result Types
export interface ValidationResult {
  status: 'success' | 'warning' | 'error';
  message?: string;
  data?: any;
}

export interface ConnectionValidationResults {
  capability: ValidationResult & { version?: string };
  oauth: ValidationResult & { tokenType?: string };
  testPatient: ValidationResult & { patientData?: any };
  subscription: ValidationResult & { subscriptionId?: string };
}

export class EhrFhirClient {
  private httpClient: AxiosInstance;
  private connection: EhrConnection;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(connection: EhrConnection) {
    this.connection = connection;
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json'
      }
    });
  }

  /**
   * Validates the complete EHR connection
   */
  async validateConnection(): Promise<ConnectionValidationResults> {
    const results: ConnectionValidationResults = {
      capability: { status: 'error' },
      oauth: { status: 'error' },
      testPatient: { status: 'error' },
      subscription: { status: 'error' }
    };

    try {
      // Step 1: Validate Capability Statement
      results.capability = await this.validateCapabilityStatement();

      // Step 2: Validate OAuth
      if (results.capability.status !== 'error') {
        results.oauth = await this.validateOAuth();
      }

      // Step 3: Test Patient Fetch
      if (results.oauth.status !== 'error' && this.connection.testPatientId) {
        results.testPatient = await this.validateTestPatient();
      }

      // Step 4: Test Subscription (if webhook endpoint provided)
      if (results.oauth.status !== 'error' && this.connection.webhookEndpoint) {
        results.subscription = await this.validateSubscription();
      }

    } catch (error) {
      console.error('Connection validation failed:', error);
    }

    return results;
  }

  /**
   * Validates FHIR Capability Statement
   */
  private async validateCapabilityStatement(): Promise<ValidationResult & { version?: string }> {
    try {
      const response = await this.httpClient.get<FhirCapabilityStatement>(
        `${this.connection.fhirBaseUrl}/metadata`
      );

      const capability = response.data;

      if (capability.resourceType !== 'CapabilityStatement') {
        return {
          status: 'error',
          message: 'Invalid response: Expected CapabilityStatement resource'
        };
      }

      // Check for required FHIR resources
      const requiredResources = ['Patient', 'Observation'];
      const supportedResources = this.extractSupportedResources(capability);
      const missingResources = requiredResources.filter(
        resource => !supportedResources.includes(resource)
      );

      if (missingResources.length > 0) {
        return {
          status: 'warning',
          message: `Missing support for resources: ${missingResources.join(', ')}`,
          version: capability.fhirVersion
        };
      }

      return {
        status: 'success',
        message: `FHIR ${capability.fhirVersion} compatible`,
        version: capability.fhirVersion,
        data: {
          publisher: capability.publisher,
          version: capability.version,
          supportedResources
        }
      };

    } catch (error: any) {
      return {
        status: 'error',
        message: `Capability validation failed: ${error.response?.status === 404 ? 'Endpoint not found' : error.message}`
      };
    }
  }

  /**
   * Validates OAuth token exchange
   */
  private async validateOAuth(): Promise<ValidationResult & { tokenType?: string }> {
    try {
      if (this.connection.clientType === 'system') {
        return await this.validateSystemOAuth();
      } else {
        return await this.validateSmartOAuth();
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `OAuth validation failed: ${error.message}`
      };
    }
  }

  /**
   * Validates System/M2M OAuth flow
   */
  private async validateSystemOAuth(): Promise<ValidationResult & { tokenType?: string }> {
    try {
      const tokenData = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.connection.clientId,
        client_secret: this.connection.clientSecret || '',
        scope: this.connection.scopes.join(' ')
      });

      const response = await axios.post<OAuthTokenResponse>(
        this.connection.tokenUrl,
        tokenData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 15000
        }
      );

      const tokenResponse = response.data;
      this.accessToken = tokenResponse.access_token;
      
      if (tokenResponse.expires_in) {
        this.tokenExpiry = new Date(Date.now() + (tokenResponse.expires_in * 1000));
      }

      return {
        status: 'success',
        message: 'System OAuth authentication successful',
        tokenType: tokenResponse.token_type,
        data: {
          scope: tokenResponse.scope,
          expiresIn: tokenResponse.expires_in
        }
      };

    } catch (error: any) {
      const errorMsg = error.response?.data?.error_description || 
                      error.response?.data?.error || 
                      error.message;
      
      return {
        status: 'error',
        message: `System OAuth failed: ${errorMsg}`
      };
    }
  }

  /**
   * Validates SMART on FHIR OAuth flow (simulation)
   */
  private async validateSmartOAuth(): Promise<ValidationResult & { tokenType?: string }> {
    try {
      // For SMART on FHIR, we simulate the flow by checking authorization endpoint
      if (!this.connection.authorizationUrl) {
        return {
          status: 'error',
          message: 'Authorization URL required for SMART on FHIR'
        };
      }

      // Test authorization endpoint accessibility
      await axios.get(this.connection.authorizationUrl, {
        timeout: 10000,
        validateStatus: (status) => status < 500 // Accept 4xx as valid endpoint
      });

      return {
        status: 'warning',
        message: 'SMART on FHIR endpoints accessible (full auth requires user interaction)',
        tokenType: 'Bearer',
        data: {
          authUrl: this.connection.authorizationUrl,
          tokenUrl: this.connection.tokenUrl
        }
      };

    } catch (error: any) {
      return {
        status: 'error',
        message: `SMART OAuth endpoint validation failed: ${error.message}`
      };
    }
  }

  /**
   * Validates test patient fetch
   */
  private async validateTestPatient(): Promise<ValidationResult & { patientData?: any }> {
    if (!this.accessToken) {
      return {
        status: 'error',
        message: 'No access token available for patient fetch'
      };
    }

    try {
      const response = await this.httpClient.get(
        `${this.connection.fhirBaseUrl}/Patient/${this.connection.testPatientId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const patient = response.data;

      if (patient.resourceType !== 'Patient') {
        return {
          status: 'error',
          message: 'Invalid response: Expected Patient resource'
        };
      }

      return {
        status: 'success',
        message: `Patient fetch successful: ${this.getPatientDisplay(patient)}`,
        patientData: {
          id: patient.id,
          name: this.getPatientDisplay(patient),
          gender: patient.gender,
          birthDate: patient.birthDate
        }
      };

    } catch (error: any) {
      const statusCode = error.response?.status;
      let message = 'Patient fetch failed';

      if (statusCode === 404) {
        message = `Patient ${this.connection.testPatientId} not found`;
      } else if (statusCode === 401) {
        message = 'Authentication failed - check client credentials';
      } else if (statusCode === 403) {
        message = 'Access forbidden - check scopes and permissions';
      } else {
        message = `Patient fetch failed: ${error.message}`;
      }

      return {
        status: 'error',
        message
      };
    }
  }

  /**
   * Validates subscription creation
   */
  private async validateSubscription(): Promise<ValidationResult & { subscriptionId?: string }> {
    if (!this.accessToken) {
      return {
        status: 'error',
        message: 'No access token available for subscription test'
      };
    }

    try {
      // Create a test subscription for Patient resources
      const subscription = {
        resourceType: 'Subscription',
        status: 'requested',
        criteria: 'Patient',
        channel: {
          type: 'rest-hook',
          endpoint: this.connection.webhookEndpoint,
          payload: 'application/fhir+json'
        },
        reason: 'MEDFLECT AI EHR Integration Test'
      };

      const response = await this.httpClient.post(
        `${this.connection.fhirBaseUrl}/Subscription`,
        subscription,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const createdSubscription = response.data;

      // Immediately delete the test subscription
      if (createdSubscription.id) {
        try {
          await this.httpClient.delete(
            `${this.connection.fhirBaseUrl}/Subscription/${createdSubscription.id}`,
            {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`
              }
            }
          );
        } catch (deleteError) {
          console.warn('Failed to delete test subscription:', deleteError);
        }
      }

      return {
        status: 'success',
        message: 'Subscription test successful',
        subscriptionId: createdSubscription.id,
        data: {
          status: createdSubscription.status,
          endpoint: this.connection.webhookEndpoint
        }
      };

    } catch (error: any) {
      const statusCode = error.response?.status;
      let message = 'Subscription test failed';

      if (statusCode === 422) {
        message = 'Subscription validation failed - check webhook endpoint accessibility';
      } else if (statusCode === 401) {
        message = 'Authentication failed for subscription creation';
      } else if (statusCode === 403) {
        message = 'Insufficient permissions for subscription creation';
      } else {
        message = `Subscription test failed: ${error.message}`;
      }

      return {
        status: statusCode === 501 ? 'warning' : 'error',
        message: statusCode === 501 ? 'Subscriptions not supported by this server' : message
      };
    }
  }

  /**
   * Generate cURL snippets for testing
   */
  generateCurlSnippets(): { [key: string]: string } {
    const snippets: { [key: string]: string } = {};

    // Capability Statement
    snippets.capability = `curl "${this.connection.fhirBaseUrl}/metadata" \\
  -H "Accept: application/fhir+json"`;

    // OAuth Token (System)
    if (this.connection.clientType === 'system') {
      snippets.oauth = `curl -X POST "${this.connection.tokenUrl}" \\
  -d "grant_type=client_credentials&client_id=${this.connection.clientId}&client_secret=${this.connection.clientSecret}&scope=${this.connection.scopes.join(' ')}" \\
  -H "Content-Type: application/x-www-form-urlencoded"`;
    }

    // Test Patient
    if (this.connection.testPatientId) {
      snippets.patient = `curl -H "Authorization: Bearer {TOKEN}" \\
  "${this.connection.fhirBaseUrl}/Patient/${this.connection.testPatientId}"`;
    }

    return snippets;
  }

  /**
   * Helper methods
   */
  private extractSupportedResources(capability: FhirCapabilityStatement): string[] {
    const resources: string[] = [];
    
    for (const rest of capability.rest) {
      if (rest.resource) {
        for (const resource of rest.resource) {
          resources.push(resource.type);
        }
      }
    }
    
    return [...new Set(resources)];
  }

  private getPatientDisplay(patient: any): string {
    if (patient.name && patient.name.length > 0) {
      const name = patient.name[0];
      const given = name.given ? name.given.join(' ') : '';
      const family = name.family || '';
      return `${given} ${family}`.trim();
    }
    return `Patient ${patient.id}`;
  }

  /**
   * Encrypt sensitive data
   */
  public static encryptSecret(secret: string, key: string = process.env.ENCRYPTION_KEY || 'default-key'): string {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  public static decryptSecret(encryptedSecret: string, key: string = process.env.ENCRYPTION_KEY || 'default-key'): string {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedSecret, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

export { EhrFhirClient as default };