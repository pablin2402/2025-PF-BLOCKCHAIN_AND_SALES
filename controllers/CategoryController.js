const ProductCategory = require("../models/ProductCategory");

const getCategory = async (req, res) => {
  try {
    const { userId, id_owner, page, limit } = req.body;

    const filter = {
      userId: String(userId),
      id_owner: String(id_owner),
    };

    let categoryList;
    let total;

    if (page && limit) {
      const skip = (page - 1) * limit;

      [categoryList, total] = await Promise.all([
        ProductCategory.find(filter).skip(skip).limit(limit),
        ProductCategory.countDocuments(filter),
      ]);
    } else {
      categoryList = await ProductCategory.find(filter);
      total = categoryList.length;
    }

    res.json({
      data: categoryList,
      total,
      page: page ? Number(page) : 1,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
};


const postCategory = (req, res) => {
  try {
   const category = new ProductCategory({
      categoryName: req.body.categoryName,
      categoryId: req.body.categoryId,
      categoryImage: req.body.categoryImage,
      userId: req.body.userId,
      categoryColor: req.body.categoryColor,
      id_owner: req.body.id_owner
    });
    category.save((err, category) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        categoryName: category.categoryName,
        categoryId: category.categoryId,
        categoryImage: category.categoryImage,
        userId: category.userId,
        categoryColor: category.categoryColor,
        id: category._id,
        id_owner: req.body.id_owner
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};
const postCategoryMany = async (req, res) => {
  try {
    const categories = req.body.categories;
    if (!categories || categories.length === 0) {
        return res.status(400).json({ message: "No hay categorias para importar." });
    }
    await ProductCategory.insertMany(categories);

    res.status(201).json({ message: "Productos importados correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en la importación." });
    }
};
module.exports = {
    getCategory,
    postCategory,
    postCategoryMany
};
