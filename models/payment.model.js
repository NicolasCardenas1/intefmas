const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pedido_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  metodo_pago: {
    type: DataTypes.ENUM('debito', 'credito', 'transferencia'),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'procesando', 'aprobado', 'rechazado', 'reembolsado'),
    defaultValue: 'pendiente'
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: true
  },
  transaccion_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gateway: {
    type: DataTypes.STRING,
    allowNull: true
  },
  moneda: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'CLP'
  }
}, {
  timestamps: true
});

module.exports = Payment;