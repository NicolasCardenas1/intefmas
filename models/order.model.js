const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vendedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha_pedido: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'en_preparacion', 'listo_para_entrega', 'en_camino', 'entregado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  tipo_entrega: {
    type: DataTypes.ENUM('retiro_tienda', 'despacho_domicilio'),
    allowNull: false
  },
  direccion_entrega: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ciudad_entrega: {
    type: DataTypes.STRING,
    allowNull: true
  },
  region_entrega: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sucursal_retiro_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  iva: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  costo_envio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Order;