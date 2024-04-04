const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      attributes: { exclude: ['category_id'] },
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          as: 'tags',
          through: {
            attributes: [],
          },
        },
      ],
    });
    res.status(200).json(productData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      attributes: { exclude: ['category_id'] },
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          as: 'tags',
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!productData) {
      res.status(404).json({ message: "No product found with this id" });
    } else {
      res.status(200).json(productData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const productData = await Product.create(req.body);
    
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map(tagId => ({
        productId: productData.id,
        tagId,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }

    const newProductData = await Product.findByPk(productData.id, {
      include: [
        { model: Category },
        { model: Tag, as: 'tags', through: { attributes: [] } },
      ],
    });

    res.status(200).json(newProductData);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// add a tag to a product by id
router.post('/:productId/addTag', async (req, res) => {
  const { productId } = req.params;
  const { tagId } = req.body;

  try {
    const tagExists = await Tag.findByPk(tagId);
    if (!tagExists) {
      return res.status(404).json({ message: 'tag not found' });
    }

    const productExists = await Product.findByPk(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'product not found' });
    }

    const productTag = await ProductTag.create({
      productId,
      tagId,
    });

    res.status(200).json({ message: 'tag added to product successfully', productTag });
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    // Update product data
    const productData = await Product.update(req.body, {
      where: {
        id: req.params.id
      },
    });

    if (req.body.tagIds && req.body.tagIds.length) {
      const currentProductTags = await ProductTag.findAll({
        where: { productId: req.params.id },
      });

      const currentProductTagIds = currentProductTags.map(tag => tag.tagId);
      const newProductTagIds = req.body.tagIds;

      const tagsToAdd = newProductTagIds.filter(id => !currentProductTagIds.includes(id))
        .map(tagId => ({ productId: req.params.id, tagId }));
      const tagsToRemove = currentProductTags.filter(({ tagId }) => !newProductTagIds.includes(tagId))
        .map(tag => tag.id);

      await Promise.all([
        tagsToRemove.length > 0 ? ProductTag.destroy({ where: { id: tagsToRemove } }) : null,
        tagsToAdd.length > 0 ? ProductTag.bulkCreate(tagsToAdd) : null,
      ]);

      const updatedProduct = await Product.findByPk(req.params.id, {
        include: [{
          model: Tag,
          through: ProductTag,
          as: 'tags'
        }]
      });

      res.json(updatedProduct);
    } else {

      const updatedProduct = await Product.findByPk(req.params.id);
      res.json(updatedProduct);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});


router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id
      },
    });

    if (!deletedProduct) {
      res.status(404).json({ message: 'no product found with that id' });
      return;
    }
    res.status(200).json({ message: 'product successfully deleted' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
