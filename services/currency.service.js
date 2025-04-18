// services/currency.service.js
// Simulación del servicio de conversión de divisas

// Función para obtener tasa de cambio desde API Banco Central
exports.getExchangeRate = async (currency) => {
    try {
      // En un caso real, aquí consultarías la API del Banco Central
      // Para esta simulación, usaremos valores fijos
      
      const rates = {
        USD: 850.5, // 1 USD = 850.5 CLP
        EUR: 950.3, // 1 EUR = 950.3 CLP
        GBP: 1100.2, // 1 GBP = 1100.2 CLP
        ARS: 2.3, // 1 ARS = 2.3 CLP
        BRL: 150.8, // 1 BRL = 150.8 CLP
        MXN: 42.5 // 1 MXN = 42.5 CLP
      };
      
      if (!rates[currency]) {
        throw new Error(`Moneda no soportada: ${currency}`);
      }
      
      return {
        currency,
        rate: rates[currency],
        date: new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error al obtener tasa de cambio:', error);
      throw error;
    }
  };
  
  // Función para convertir montos
  exports.convertAmount = (amount, rate, toCLP = true) => {
    if (toCLP) {
      // Convertir de moneda extranjera a CLP
      return amount * rate;
    } else {
      // Convertir de CLP a moneda extranjera
      return amount / rate;
    }
  };