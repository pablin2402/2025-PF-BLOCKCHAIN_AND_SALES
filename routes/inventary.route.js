const expres = require("express");
const router = expres.Router();

const inventoryController = require("../controllers/InventoryController");
const inventaryManagementController = require("../controllers/InventaryManagementController");
const {authenticateToken} = require("../middlewares/authentication.js");

router
.post("/inventory/list",authenticateToken, inventoryController.getListOfInventary)
.post("/inventory",authenticateToken, inventoryController.postInventary)
.delete("/inventoryManagement/id", authenticateToken,inventaryManagementController.deleteInventaryManagement)
.put("/inventory/id", authenticateToken,inventoryController.updateQuantity)
.post("/inventory/id", authenticateToken,inventoryController.getInventaryByProductId)
.post("/inventoryManagement/userid",authenticateToken, inventaryManagementController.getListOfInventaryManagement)
.post("/inventoryManagement/id", authenticateToken,inventaryManagementController.postInventaryManagement)

module.exports = router;