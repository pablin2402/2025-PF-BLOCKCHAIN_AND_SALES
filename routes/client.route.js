const expres = require("express");
const router = expres.Router();

const clientController = require("../controllers/ClientController");
const salesManController = require("../controllers/SalesManController");
const {authenticateToken} = require("../middlewares/authentication.js");
const orderPayController = require("../controllers/OrderPayController");
const deliveryController = require("../controllers/DeliveryController.js");
const salesManActivityController = require("../controllers/SalesManActivityController");
const upload = require("./upload");

router
.post("/client",authenticateToken, clientController.postClient)
.post("/client/message/id", authenticateToken,clientController.getMessagesById)
.post("/client/list/id", authenticateToken,clientController.getClients)
.post("/client/id", authenticateToken,clientController.getClientInfoById)
.post("/client/archived",authenticateToken, clientController.getClientsArchived)
.post("/client/sales",authenticateToken, clientController.getClientInfoByIdAndSales)
.post("/login",authenticateToken, clientController.loginUser)

.post("/delivery",authenticateToken, deliveryController.postNewDelivery)
.post("/delivery/list",authenticateToken, deliveryController.getDelivery)


.put("/client/archived",authenticateToken, clientController.updateUserStatus)
.post("/sales/list/id",authenticateToken, salesManController.getSalesMan)
.post("/sales/id",authenticateToken, salesManController.getSalesManById)
.post("/sales/salesman", authenticateToken,salesManController.postNewAccount)
.post("/sales/location", authenticateToken,salesManController.getClientLocationById)

.post("/salesman/activity",authenticateToken, salesManActivityController.postNewActivity)
.post("/salesman/id",authenticateToken, salesManActivityController.getSalesManByIdActivity)
.post("/salesman/date/id", authenticateToken,salesManActivityController.getSalesManByIdAndDayActivity)

.post("/salesman/list/route",authenticateToken, salesManActivityController.getAllRoutes)
.post("/salesman/route",authenticateToken, salesManActivityController.postNewRoute)
.post("/salesman/route/id",authenticateToken, salesManActivityController.getSalesManByIdRoute)
.post("/salesman/route/sales/id", authenticateToken,salesManActivityController.getRouteSalesById)
.delete("/route/sales/id",authenticateToken, salesManActivityController.deleteRouteSalesById)
.put("/route/sales/id",authenticateToken,salesManActivityController.updateRouteSalesStatus)
.put("/route/progress/id",authenticateToken,salesManActivityController.updateRouteSalesProgress)

.post("/order/pay/list/id",authenticateToken, orderPayController.getOrderPay)
.post("/order/pay/list/calendar",authenticateToken, orderPayController.getOrderPayByCalendar)
.post("/order/pay/sales/id",authenticateToken, orderPayController.getOrderPayBySales)
.post("/order/pay",authenticateToken, upload.single("saleImage"), orderPayController.postOrderPay)
.post("/order/pay/id",authenticateToken, orderPayController.getOrderPayId);


module.exports = router;