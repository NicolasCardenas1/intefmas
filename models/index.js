const User = require('./user.model');
const Category = require('./category.model');
const Brand = require('./brand.model');
const Product = require('./product.model');
const Branch = require('./branch.model');
const Inventory = require('./inventory.model');
const InventoryMovement = require('./inventoryMovement.model');
const Order = require('./order.model');
const OrderDetail = require('./orderDetail.model');
const Payment = require('./payment.model');

// Relaciones entre categorías (para subcategorías)
Category.hasMany(Category, { as: 'subcategorias', foreignKey: 'categoria_padre_id' });
Category.belongsTo(Category, { as: 'categoria_padre', foreignKey: 'categoria_padre_id' });

// Relaciones para productos
Product.belongsTo(Category, { foreignKey: 'categoria_id' });
Category.hasMany(Product, { foreignKey: 'categoria_id' });

Product.belongsTo(Brand, { foreignKey: 'marca_id' });
Brand.hasMany(Product, { foreignKey: 'marca_id' });

// Relaciones para inventario
Inventory.belongsTo(Product, { foreignKey: 'producto_id' });
Product.hasMany(Inventory, { foreignKey: 'producto_id' });

Inventory.belongsTo(Branch, { foreignKey: 'sucursal_id' });
Branch.hasMany(Inventory, { foreignKey: 'sucursal_id' });

// Relaciones para movimientos de inventario
InventoryMovement.belongsTo(Product, { foreignKey: 'producto_id' });
Product.hasMany(InventoryMovement, { foreignKey: 'producto_id' });

InventoryMovement.belongsTo(Branch, { foreignKey: 'sucursal_id' });
Branch.hasMany(InventoryMovement, { foreignKey: 'sucursal_id' });

InventoryMovement.belongsTo(User, { foreignKey: 'usuario_id' });
User.hasMany(InventoryMovement, { foreignKey: 'usuario_id' });

// Relaciones para pedidos
Order.belongsTo(User, { as: 'cliente', foreignKey: 'cliente_id' });
User.hasMany(Order, { foreignKey: 'cliente_id' });

Order.belongsTo(User, { as: 'vendedor', foreignKey: 'vendedor_id' });
User.hasMany(Order, { as: 'ventas', foreignKey: 'vendedor_id' });

Order.belongsTo(Branch, { as: 'sucursal_retiro', foreignKey: 'sucursal_retiro_id' });
Branch.hasMany(Order, { as: 'pedidos_retiro', foreignKey: 'sucursal_retiro_id' });

// Relaciones para detalles de pedido
OrderDetail.belongsTo(Order, { foreignKey: 'pedido_id' });
Order.hasMany(OrderDetail, { foreignKey: 'pedido_id' });

OrderDetail.belongsTo(Product, { foreignKey: 'producto_id' });
Product.hasMany(OrderDetail, { foreignKey: 'producto_id' });

// Relaciones para pagos
Payment.belongsTo(Order, { foreignKey: 'pedido_id' });
Order.hasMany(Payment, { foreignKey: 'pedido_id' });

module.exports = {
  User,
  Category,
  Brand,
  Product,
  Branch,
  Inventory,
  InventoryMovement,
  Order,
  OrderDetail,
  Payment
};