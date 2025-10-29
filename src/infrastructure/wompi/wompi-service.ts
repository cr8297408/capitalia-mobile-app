/**
 * Wompi Service
 * Servicio para interactuar con la API de Wompi
 * Following Scope Rule Pattern - Infrastructure
 */

import { wompiConfig } from './wompi-client';
import type {
  WompiAcceptanceToken,
  WompiPaymentSourceToken,
} from './wompi-client';

class WompiService {
  private baseUrl = wompiConfig.apiUrl;
  private publicKey = wompiConfig.publicKey;

  /**
   * Obtiene el token de aceptación de términos y condiciones
   */
  async getAcceptanceToken(): Promise<WompiAcceptanceToken> {
    try {
      const response = await fetch(
        `${this.baseUrl}/merchants/${this.publicKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to get acceptance token');
      }

      const data = await response.json();
      return {
        acceptance_token: data.data.presigned_acceptance.acceptance_token,
        permalink: data.data.presigned_acceptance.permalink,
      };
    } catch (error) {
      console.error('Error getting acceptance token:', error);
      throw error;
    }
  }

  /**
   * Tokeniza una tarjeta de crédito
   */
  async tokenizeCard(cardData: {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
  }): Promise<WompiPaymentSourceToken> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.reason || 'Failed to tokenize card');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error tokenizing card:', error);
      throw error;
    }
  }

  /**
   * Crea una transacción de pago
   */
  async createTransaction(transactionData: {
    acceptanceToken: string;
    amountInCents: number;
    currency: string;
    customerEmail: string;
    paymentMethod: {
      type: string;
      token: string;
      installments: number;
    };
    reference: string;
    redirectUrl?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify({
          acceptance_token: transactionData.acceptanceToken,
          amount_in_cents: transactionData.amountInCents,
          currency: transactionData.currency,
          customer_email: transactionData.customerEmail,
          payment_method: transactionData.paymentMethod,
          reference: transactionData.reference,
          redirect_url: transactionData.redirectUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.reason || 'Failed to create transaction',
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de una transacción
   */
  async getTransactionStatus(transactionId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.publicKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to get transaction status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  /**
   * Genera un enlace de pago de Wompi
   */
  getPaymentLink(params: {
    reference: string;
    amountInCents: number;
    currency?: string;
    redirectUrl?: string;
    publicKey?: string;
  }): string {
    const currency = params.currency || wompiConfig.currency;
    const queryParams = new URLSearchParams({
      'public-key': params.publicKey || this.publicKey,
      currency: currency,
      'amount-in-cents': params.amountInCents.toString(),
      reference: params.reference,
    });

    if (params.redirectUrl) {
      queryParams.append('redirect-url', params.redirectUrl);
    }

    return `https://checkout.wompi.co/p/?${queryParams.toString()}`;
  }
}

export const wompiService = new WompiService();
