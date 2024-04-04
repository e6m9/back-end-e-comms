// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
});

// Categories have many Products
Category.hasMany(Product, {
  foreignKey: 'categoryId',
});

// Products belongToMany Tags (through ProductTag)
Product.belongsToMany(Tag, {
  through: {
    model: ProductTag,
    foreignKey: 'productId',
    as: 'tags'
  },
});

// Tags belongToMany Products (through ProductTag)
Tag.belongsToMany(Product, {
  through: {
    model: ProductTag,
    foreignKey: 'tagId',
    as: 'products',
  },
});

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
