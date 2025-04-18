// services/webpay.service.js
// Simulación del servicio de WebPay (para producción se usaría la SDK oficial)

// Función para iniciar un pago
exports.initTransaction = async (amount, buyOrder, returnUrl, finalUrl) => {
    // En un caso real, aquí se usaría la SDK de WebPay
    console.log(`Iniciando transacción WebPay: Monto ${amount}, Orden ${buyOrder}`);
    
    // Simular respuesta de WebPay
    return {
      token: `WEBPAY-TOKEN-${Date.now()}`,
      url: 'https://webpay.cl/simulacion-pago'
    };
  };
  
  // Función para confirmar un pago
  exports.confirmTransaction = async (token) => {
    // En un caso real, aquí se consultaría a WebPay
    console.log(`Confirmando transacción WebPay con token: ${token}`);
    
    // Simular respuesta exitosa
    return {
      vci: "TSY",
      amount: 10000,
      status: "AUTHORIZED",
      buyOrder: "ordenCompra12345678",
      sessionId: "sesion1234557545",
      cardDetail: {
        cardNumber: "1234"
      },
      accountingDate: "0621",
      transactionDate: new Date(),
      authorizationCode: "1213",
      paymentTypeCode: "VN",
      responseCode: 0,
      installmentsAmount: 10000,
      installmentsNumber: 1
    };
  };