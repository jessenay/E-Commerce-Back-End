const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
try {
  const tagsData = await Tag.findAll({
    include: [{ model: Product, through: ProductTag }],
  });
  res.status(200).json(tagsData);
} catch (err) {
  console.error(err);
  res.status(500).json(err);
}
});

router.get('/:id', async (req, res) => {
try {
  const tagData = await Tag.findByPk(req.params.id, {
    include: [{ model: Product, through: ProductTag }],
  });
  if (!tagData) {
    return res.status(404).json({ message: 'Not found'});
  }
  res.status(200).json(tagData);
} catch (err) {
  console.error(err);
  res.status(500).json(err);
}
});

router.post('/', async (req, res) => {
  try {
    const tagData = await Tag.create(req.body);
    res.status(200).json(tagData);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (updatedTag[0] === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.status(200).json({ message: 'Updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deletedTag) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json({ message: 'Deletion successfull' });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
