const expres = require("express");
const router = expres.Router();

const {authenticateToken} = require("../middlewares/authentication.js");
const kanbanController = require("../controllers/KanbanController");

router
.post("/kanban/list/id",authenticateToken, kanbanController.getListOfKanban)
.post("/kanban/kanbanId",authenticateToken, kanbanController.postKanbanByKanbanId)
.post("/kanban/task/kanbanId", authenticateToken,kanbanController.postKanbanByKanbanTasksId)
.post("/kanban/user/id",authenticateToken, kanbanController.findIdKanban)
.post("/kanban/client/id",authenticateToken, kanbanController.findListOfClientsIdKanban)
.post("/kanban/create/id",authenticateToken, kanbanController.postKanban)
.post("/kanban/id",authenticateToken, kanbanController.findIdKanbanByClientTasks)
.post("/kanban/task/id",authenticateToken, kanbanController.findIdKanbanByClient)
.put("/kanban/id",authenticateToken, kanbanController.updateKanban)
.put("/kanban/client",authenticateToken, kanbanController.updateKanban)
.delete("/kanban/id",authenticateToken, kanbanController.deleteMessageOrClientFromKanban);

module.exports = router;