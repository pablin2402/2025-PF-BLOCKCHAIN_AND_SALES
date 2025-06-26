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
const orderTrackController = require("../controllers/OrderTrackController.js");
const salesObjectiveRegionController = require("../controllers/SalesObjectiveRegionController.js");

router
.post("/order/objective",orderController.getSalesSummary)
.post("/order/objective/region",orderController.getCategorySummary)
.post("/order/objective/region/id",salesObjectiveRegionController.getObjectiveWithSalesData)
.post("/order/objective/region/product",salesObjectiveRegionController.getObjectiveWithSalesDataProducts)
.put("/order/objective/region/product",salesObjectiveRegionController.updateSalesObjectiveRegion)
.delete("/order/objective/region/product",salesObjectiveRegionController.deleteSalesObjectiveRegion)

.put("/order/objective/product",salesObjectiveRegionController.updateSalesObjective)
.delete("/order/objective/product",salesObjectiveRegionController.deleteSalesObjective)


.put("/order/status/id",orderController.updateOrderTracking)

.post("/sales/objective/regional/id",salesObjectiveRegionController.getSalesObjectiveRegionByIdAndOwner)
.post("/sales/objective/regional",salesObjectiveRegionController.postSalesObjectiveRegion)
.post("/sales/objective/general",salesObjectiveRegionController.getSalesObjectiveGeneralByIdAndOwner)
.post("/sales/objective/id",salesObjectiveRegionController.postSalesObjective)
.post("/sales/objective/region/order",salesObjectiveRegionController.getOrdersWithSalesObjective)
.post("/sales/objective/national",salesObjectiveRegionController.getSalesDataByLyne)
.post("/sales/objective/sales",salesObjectiveRegionController.postSalesObjectiveSalesMan)
.post("/sales/objective/list",salesObjectiveRegionController.getSalesObjectiveSalesManByIdAndOwner)

.post("/order/track",orderTrackController.createOrderEvent)
.post("/order/track/list",authenticateToken,orderTrackController.getOrderEventsByOrderId)

.post("/automatization",automatizationController.getAutomatization)
.post("/automatization/new",automatizationController.postAutomatization)
.post("/automatization/list",automatizationController.postAutomatizationList)
.put("/automatization/list/id", authenticateToken,automatizationController.uploadAutomatizationStatus)


.post("/product/id",authenticateToken,productController.getProductsById)
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
.post("/order/id/user", orderController.getOrderByIdAndClient)
.post("/order/id/sales",authenticateToken, orderController.getOrderByIdAndSales)
.post("/order/id/statistics",authenticateToken, orderController.getOrderSalesById)
.post("/order/id/year",authenticateToken, orderController.getOrdersByYear)
.delete("/order/id", authenticateToken,orderController.deleteOrderById)
.post("/order/status",authenticateToken, orderController.getOrderByDeliverStatusAnd)
.post("/order/status/id", orderController.getOrderByIdAndOrderStatus)

.post("/maps/list/id",authenticateToken,clientLocationController.getClientLocationById)
.post("/maps/id",authenticateToken,clientLocationController.postClientLocation)
.post("/client/info/id",authenticateToken,clientLocationController.getClientInfoById)
.post("/maps/list/sales/id",authenticateToken,clientLocationController.getClientLocationByIdAndSales)

.post("/sales/inform",authenticateToken,SalesHistorialController.getSalesHistorial)
.post("/sales/inform/client",authenticateToken,SalesHistorialController.getSalesHistorialPerClient)
.post("/sales",authenticateToken,SalesHistorialController.postSalesHistorial)

.post("/client/info",authenticateToken, clientController.postClientInfo)
.post("/supplier/info",authenticateToken, supplierController.postSupplier)
.post("/supplier",authenticateToken, supplierController.getSupplier);

module.exports = router;