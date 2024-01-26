const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const productsData = await Product.findAll({
include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(productsData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{model: Category }, { model: Tag }],
    });
    if (!productData) {
      res.status(404).json({ message: 'Not Found'});
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
  });

  router.post('/', async (req, res) => {
    try {
      const newProduct = await Product.create(req.body);
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tagId) => ({
          product_id: newProduct.id,
          tag_id: tagId,
        }));
        await ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(200).json(newProduct);
    } catch (err) {
      console.error(err);
      res.status(400).json(err);
    }
  });
  // Product.create(req.body)
  // .then((product) => {
  //   if (req.body.tagIds && req.body.tagIds.length) {
  //     const productTagIdArr = req.body.tagIds.map((tag_id) => {
  //       return {
  //         product_id: product.id,
  //         tag_id,
  //       };
  //     });
  //     return ProductTag.bulkCreate(productTagIdArr)
  //       .then(() => product);
  //   }
  //   return product;
  // })
  // .then((result) => res.status(200).json(result))
  // .catch((err) => {
  //   console.error(err);
  //   res.status(400).json(err);
  // });

router.put('/:id', (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
 try {
  const productId = req.params.id;
  const product = await Product.findByPk(productId);
  if (!product) {
    return res.status(404).json({ message: 'Not found' });
  }
  await ProductTag.destroy({
    where: {
      product_id: productId,
    },
  });
  await Product.destroy({
    where: {
      id: productId,
    }
  });
  return res.status(200).json({ message: 'Deletion successfull' });
 } catch (err) {
  console.error(err);
  return res.status(500).json(err);
 }
});

module.exports = router;
