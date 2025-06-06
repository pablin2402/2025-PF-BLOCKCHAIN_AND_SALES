const expres = require("express");
const router = expres.Router();
const productController = require("../controllers/ProductController");
const categoryController = require("../controllers/CategoryController");
const carrouselController = require("../controllers/CarrouselController");
const quotationController = require("../controllers/QuotationController");
const priceController = require("../controllers/PriceController");
const userController = require("../controllers/ClientController");
const {authenticateToken} = require("../middlewares/authentication.js");
const orderController = require("../controllers/OrderController");
const clientLocationController = require("../controllers/ClientLocationController");
const clientController = require("../controllers/ClientInfoController");
const SalesHistorialController = require("../controllers/SalesHistorialController");
const supplierController = require("../controllers/SupplierController");
const automatizationController = require("../controllers/AutomatizationController");



router
.post("/automatization",authenticateToken,automatizationController.getAutomatization)
.post("/automatization/new", authenticateToken,automatizationController.postAutomatization)
.post("/automatization/list", authenticateToken,automatizationController.postAutomatizationList)
.put("/automatization/list/id", authenticateToken,automatizationController.uploadAutomatizationStatus)


.post("/product/id", authenticateToken,productController.getProductsById)
.post("/product", authenticateToken,productController.postProduct)
.post("/product/import",authenticateToken, productController.postProductsMany)
.put("/product/id",authenticateToken, productController.uploadProductStatus)
.delete("/product/id",authenticateToken, productController.deleteProduct)
.put("/product/price/id",authenticateToken, productController.updateProductAndPrice)


.post("/category/id",authenticateToken, categoryController.getCategory)
.post("/category",authenticateToken, categoryController.postCategory)
.post("/category/import",authenticateToken,  categoryController.postCategoryMany)
.get("/carrousel",authenticateToken, carrouselController.getCarrousel)
.get("/quotation",authenticateToken, quotationController.getQuotation)
.post("/quotation",authenticateToken, quotationController.postQuotation)

.post("/price/product",authenticateToken, priceController.getPriceByProductId)
.post("/price",authenticateToken, priceController.postPrice)
.put("/price",authenticateToken, priceController.uploadPriceProduct)

.post("/user", userController.postNewAccountUser)
.post("/login", userController.getUser)
.put("/user/id",authenticateToken, userController.updateUserFile)
.delete("/user/id",authenticateToken, userController.deleteClient)

.post("/order", authenticateToken,orderController.postOrder)
.post("/order/products/stadistics",orderController.getMostSoldProducts)
.post("/order/products/analysis",orderController.predictSalesForTopProducts)
.post("/order/id",authenticateToken, orderController.getOrderById)
.post("/order/id/user",authenticateToken, orderController.getOrderByIdAndClient)
.post("/order/id/sales",authenticateToken, orderController.getOrderByIdAndSales)
.post("/order/id/statistics",authenticateToken, orderController.getOrderSalesById)
.post("/order/id/year",authenticateToken, orderController.getOrdersByYear)
.delete("/order/id",authenticateToken, orderController.deleteOrderById)
.post("/order/status",authenticateToken, orderController.getOrderByDeliverStatusAnd)

.post("/maps/list/id",authenticateToken,clientLocationController.getClientLocationById)
.post("/maps/id",authenticateToken,clientLocationController.postClientLocation)
.post("/client/info/id",authenticateToken,clientLocationController.getClientInfoById)

.post("/sales/inform",authenticateToken,SalesHistorialController.getSalesHistorial)
.post("/sales/inform/client",authenticateToken,SalesHistorialController.getSalesHistorialPerClient)
.post("/sales",authenticateToken,SalesHistorialController.postSalesHistorial)

.post("/client/info",authenticateToken, clientController.postClientInfo)
.post("/supplier/info",authenticateToken, supplierController.postSupplier)
.post("/supplier",authenticateToken, supplierController.getSupplier);

module.exports = router;