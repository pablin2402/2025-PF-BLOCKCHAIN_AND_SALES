const Product = require("../models/Product");
const Price = require("../models/Price");


const getProductsById = async (req, res) => {
  try {
    let query = { id_user: String(req.body.id_user) };
    if (req.body.status === true) {
      query.status = req.body.status;
    }

    if (req.body.category) {
      query.categoryId = req.body.category;
    }

    if (req.body.search && req.body.search.trim() !== "") {
      query.productName = { $regex: req.body.search.trim(), $options: "i" };
    }
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("categoryId")
      .populate("supplierId")
      .populate("priceId")
      .skip((req.body.page - 1) * req.body.limit)
      .limit(Number(req.body.limit));

    res.json({
      products,
      total,
      page: Number(req.body.page),
      totalPages: Math.ceil(total / req.body.limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

const postProductsMany = async (req, res) => {
  try {
    const categories = req.body.categories;
    if (!categories || categories.length === 0) {
        return res.status(400).json({ message: "No hay categorias para importar." });
    }
    await Product.insertMany(categories);

    res.status(201).json({ message: "Productos importados correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en la importación." });
    }
};
const deleteProduct = async (req, res) => {
  const product_id = req.body.productId;
  const deleteProduct = await Product.deleteOne({ productId: product_id });

  if (deleteProduct.deletedCount === 0) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  return res.status(200).json({ message: 'Producto eliminado correctamente' });
};
const uploadProductStatus = async (req, res) => {
  const { id_user, status, productId } = req.body;
  
    try {
      const product = await Product.findOneAndUpdate(
        { id_user: id_user, productId: productId },
        { status: status },
        { new: true }
      );
  
      if (!product) {
        return res.status(404).json({ error: 'No se encontró el product con los parámetros proporcionados' });
      }
  
      return res.json({ product });
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      res.status(500).json({ error: 'Error al actualizar el estadoxx' });
    }
}
const postProduct = (req, res) => {
  try {
   const product = new Product({
      productName: req.body.productName ,
      categoryId: req.body.categoryId,
      priceId: req.body.priceId,
      supplierId: req.body.supplierId,
      productImage: req.body.productImage,
      description: req.body.description,
      id_user : req.body.id_user,
      brand: req.body.brand,
      productId: req.body.productId,
      status: true, 
      numberofUnitsPerBox: req.body.numberofUnitsPerBox   
    });
    product.save((err,product) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        productName: product.productName ,
        categoryId: product.categoryId,
        priceId: product.priceId,
        productImage: product.productImage,
        description: product.description,
        id_user : product.id_user,
        brand: product.brand,
        status: product.status,
        productId: product.productId,
        numberofUnitsPerBox: product.numberofUnitsPerBox
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};

const updateProductAndPrice = async (req, res) => {
  try {
    const { productId, priceId, newName, newPrice } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { productName: newName },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).send({ message: "Producto no encontrado" });
    }

    const updatedPrice = await Price.findByIdAndUpdate(
      priceId,
      { price: newPrice },
      { new: true }
    );

    if (!updatedPrice) {
      return res.status(404).send({ message: "Precio no encontrado" });
    }

    res.status(200).send({
      message: "Producto y precio actualizados correctamente",
      product: {
        id: updatedProduct._id,
        productName: updatedProduct.productName,
      },
      price: {
        id: updatedPrice._id,
        price: updatedPrice.price,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error al actualizar producto y precio" });
  }
};


module.exports = {
  getProductsById,postProduct, uploadProductStatus, deleteProduct,postProductsMany, updateProductAndPrice
};
