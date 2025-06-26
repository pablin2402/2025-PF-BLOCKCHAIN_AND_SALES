const SalesMan = require("../models/SalesManActivity");
const SalesManRoute = require("../models/RouteSalesMan");

const mongoose = require("mongoose");

const postNewActivity = (req, res) => {
  try {
   const client = new SalesMan({
        salesMan: new mongoose.Types.ObjectId(req.body.salesMan),
        details:req.body.details,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        location: req.body.location,
        id_owner: req.body.id_owner,
        clientName: new mongoose.Types.ObjectId(req.body.clientName),
        visitDuration: req.body.visitDuration,
        visitDurationSeconds: req.body.visitDurationSeconds
    });
    client.save((err,client) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200, 204).send({
        salesMan: client.salesMan,
        details:client.details,
        latitude: client.latitude,
        longitude: client.longitude,
        location: client.location,
        id_owner: client.id_owner,
        clientName: client.clientName,
        visitDuration: client.visitDuration,
        visitDurationSeconds: client.visitDurationSeconds
      });
    });
  } catch (e) {
  }
};
const postNewRoute = (req, res) => {
  try {
   const client = new SalesManRoute({
        salesMan: new mongoose.Types.ObjectId(req.body.salesMan),
        details:req.body.details,
        route: req.body.route,
        status: req.body.status,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        id_owner: req.body.id_owner,
        progress: req.body.progress,
        startDateRouteSales: null,
    });
    client.save((err,client) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200, 204).send({
        salesMan: client.salesMan,
        details: client.details,
        route: client.route,
        status: client.status,
        startDate: client.startDate,
        endDate: client.endDate,
        id_owner: client.id_owner,
        progress: client.progress,
        startDateRouteSales: client.startDateRouteSales,
      });
    });
  } catch (e) {
  }
};
const getSalesMan = async (req, res) => {
      await SalesMan.find({id_owner:String(req.body.id_owner)}).then(p=>  res.json(p));
};
const getSalesManByIdRoute = async (req, res) => {
  try {
    const query = {
      id_owner: String(req.body.id_owner),
      salesMan: new mongoose.Types.ObjectId(req.body.salesMan),
    };

    if (req.body.startDate) {
      const startDateUTC = new Date(req.body.startDate);
      const year = startDateUTC.getUTCFullYear();
      const month = startDateUTC.getUTCMonth();
      const day = startDateUTC.getUTCDate();
  
      const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));   
      startOfDay.setHours(startOfDay.getHours());
      const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999)); 
      endOfDay.setHours(endOfDay.getHours());  
      query.startDate = { $gte: startOfDay, $lte: endOfDay };
  }
    const salesManData = await SalesManRoute.find(query)
      .populate("salesMan")

    res.json(salesManData || []);

  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ message: "Error en la búsqueda", error });
  }
};
const getRouteSalesById = async (req, res) => {
  try {
    const query = {
      id_owner: String(req.body.id_owner),
      _id: new mongoose.Types.ObjectId(req.body._id),
    };
    const salesManData = await SalesManRoute.find(query)
      .populate("salesMan")
    res.json(salesManData || []);

  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ message: "Error en la búsqueda", error });
  }
};
const deleteRouteSalesById = async (req, res) => {
  try {
      const query = {
        id_owner: String(req.body.id_owner),
        _id: new mongoose.Types.ObjectId(req.body._id),
      };
      const result = await SalesManRoute.findOneAndDelete(query);
      if (!result) {
        return res.status(404).json({ message: "Ruta no encontrada o ya eliminada" });
      }
      res.json({ message: "Ruta eliminada con éxito", data: result });
    } catch (error) {
      console.error("Error al eliminar la ruta:", error);
      res.status(500).json({ message: "Error al eliminar la ruta", error });
    }
};
const getSalesManByIdActivity = async (req, res) => {
  try {
    const query = {
      id_owner: String(req.body.id_owner),
      salesMan: new mongoose.Types.ObjectId(req.body.salesMan),
    };

    if (req.body.startDate && req.body.endDate) {
      query.creationDate = {
        $gte: new Date(req.body.startDate),
        $lte: new Date(req.body.endDate),
      };
    } else {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      query.creationDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    if (req.body.details) {
      query.details = req.body.details;
    }

    const salesManData = await SalesMan.find(query)
      .populate("salesMan")
      .populate("clientName");

    res.json(salesManData || []);
    
  } catch (error) {
    res.status(500).json({ message: "Error en la búsqueda", error });
  }
};

const getSalesManByIdAndDayActivity = async (req, res) => {
  try {
    const limit = 8;

    const query = {
      id_owner: String(req.body.id_owner),
    };
    if (req.body.salesMan && req.body.salesMan !== "") {
      query.salesMan = new mongoose.Types.ObjectId(req.body.salesMan);
    }
    if (req.body.startDate) {
      const offsetMinutes = 4 * 60;
    
      const start = new Date(req.body.startDate);
      start.setUTCHours(0, 0, 0, 0);
      start.setMinutes(start.getMinutes() + offsetMinutes);
    
      const end = new Date(req.body.startDate);
      end.setUTCHours(23, 59, 59, 999);
      end.setMinutes(end.getMinutes() + offsetMinutes);
    
      query.creationDate = { $gte: start, $lte: end };
    }

    if (req.body.details) {
      query.details = req.body.details;
    }
    const skip = (parseInt(req.body.page) - 1) * limit;
    const [data, total] = await Promise.all([
      SalesMan.find(query)
        .populate("salesMan")
        .populate({
          path: "clientName",
          populate: {
            path: "client_location",
          },
        })
        .sort({ creationDate: -1 })
        .skip(skip)
        .limit(limit),
      SalesMan.countDocuments(query),
    ]);
    res.json({
      total,
      page: parseInt(req.body.page),
      pages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error("Error al buscar actividades:", error);
    res.status(500).json({ message: "Error en la búsqueda", error });
  }
};
const getAllRoutes = async (req, res) => {
  try {
    const query = { id_owner: String(req.body.id_owner) };

    if (req.body.salesMan && req.body.salesMan !== "todos") {
      query.salesMan = new mongoose.Types.ObjectId(req.body.salesMan);
    }

    if (req.body.status && req.body.status !== "") {
      query.status = req.body.status;
    }

    const page = parseInt(req.body.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    if (req.body.startDate && req.body.endDate) {
      const startOfDay = new Date(req.body.startDate);
      const endOfDay = new Date(req.body.endDate);
      query.startDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const totalItems = await SalesManRoute.countDocuments(query);

    let data = await SalesManRoute.find(query)
      .populate("salesMan")
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);

    const statusPriority = { Finalizado: 1, "En progreso": 2, "Por iniciar": 3 };
    data = data.sort((a, b) => {
      const aStatus = statusPriority[a.status] || 4;
      const bStatus = statusPriority[b.status] || 4;
      return aStatus - bStatus;
    });

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ message: "Error en la búsqueda", error });
  }
};


const updateRouteSalesStatus = async (req, res) => {
  const { _id, routeId, visitStatus, visitTime, orderTaken, visitStartTime, visitEndTime, status } = req.body;

  try {
    const updateRoute = await SalesManRoute.findOneAndUpdate(
      { _id, 'route._id': routeId },  
      {
        $set: {
          'route.$.visitStatus': visitStatus,    
          'route.$.visitTime': visitTime,        
          'route.$.orderTaken': orderTaken,      
          'route.$.visitStartTime': visitStartTime,  
          'route.$.visitEndTime': visitEndTime   
        }
      },
      { new: true }  
    );

    if (!updateRoute) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    if (status) {
      await SalesManRoute.findOneAndUpdate(
        { _id },
        { $set: { status } },  
        { new: true }
      );
    }

    res.json({ message: 'Ruta actualizada con éxito', textMessage: updateRoute });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la ruta', error });
  }
};

const updateRouteSalesProgress = async (req, res) => {
  try {
    const query = {
      id_owner: String(req.body.id_owner),
      _id: new mongoose.Types.ObjectId(req.body._id),
    };

    const existingRoute = await SalesManRoute.findOne(query);
    if (!existingRoute) {
      return res.status(404).json({ message: "Ruta no encontrada" });
    }

    const totalItems = existingRoute.route.length; 
    
    let newProgress = existingRoute.progress;

    if (totalItems > 0) {
      const progressIncrement = Math.floor(100 / totalItems);
      newProgress = Math.min(newProgress + progressIncrement, 100);
    
      const stepsCompleted = Math.round(newProgress / progressIncrement);
      if (stepsCompleted >= totalItems) {
        newProgress = 100;
      }
    }
    const updateFields = { progress: newProgress };

    if (newProgress === 100) {
      updateFields.status = "Finalizado";
    }

    const updatedRoute = await SalesManRoute.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true }
    );

    res.json({ message: "Progreso actualizado con éxito", data: updatedRoute });
  } catch (error) {
    console.error("Error al actualizar el progreso:", error);
    res.status(500).json({ message: "Error al actualizar el progreso", error });
  }
};

  
module.exports = {
    postNewActivity,
    getSalesMan,
    getAllRoutes,
    getSalesManByIdActivity,
    getSalesManByIdAndDayActivity,
    getSalesManByIdRoute,
    postNewRoute,
    getRouteSalesById,
    deleteRouteSalesById,
    updateRouteSalesStatus,
    updateRouteSalesProgress
};
  