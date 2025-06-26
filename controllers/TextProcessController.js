const fs = require("fs");
const TextProcess = require("../models/TextProcess");
const getListOfTextProcess = async (req, res) => {
    await TextProcess.find({idClient:String(req.body.idClient)}).then(p=>  res.json(p));
  };
const postTextProcess = (req, res) => { 
  try {
   const text = new TextProcess({
      inputMessage: req.body.inputMessage,
      targetMessage: req.body.targetMessage,
      idClient: req.body.idClient,
      children: req.body.children,
    });
    text.save((err,text) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      res.status(200).send({
        inputMessage: text.inputMessage,
        targetMessage: text.targetMessage,
        idClient: text.idClient,
        children: text.children,
      });
    });
  } catch (e) {
    myConsole.log(e);
  }
};
const addNewChild = async (req, res) => {
    const { _id, newChild } = req.body;
    try {
        const updatedTextMessage = await TextProcess.findOneAndUpdate(
            { _id },
            { $push: { children: newChild } },
            { new: true }
        );
        if (!updatedTextMessage) {
            return res.status(404).json({ message: 'Text Message not found' });
        }
        res.json({ message: 'New Child added successfully', textMessage: updatedTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add new child', error });
    }
};
const addNewGrandChild = async (req, res) => {
    const { _id, newChild } = req.body;
    try {
        const parentChildIndex = req.body.parentChildIndex;
        const updatedTextMessage = await TextProcess.findOneAndUpdate(
            { _id },
            { $push: { [`children.${parentChildIndex}.children`]: newChild } },
            { new: true }
        );

        if (!updatedTextMessage) {
            return res.status(404).json({ message: 'Text Message not found' });
        }

        res.json({ message: 'New Grandchild added successfully', textMessage: updatedTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add new grandchild', error });
    }
};
const addInputMessage = async (req, res) => {
    const { _id, newInputMessage } = req.body;

    try {
        const updatedTextMessage = await TextProcess.findOneAndUpdate(
            { _id },
            { $push: { inputMessage: newInputMessage } },
            { new: true }
        );
        if (!updatedTextMessage) {
            return res.status(404).json({ message: 'Text Message not found' });
        }
        res.json({ message: 'New Input Message added successfully', textMessage: updatedTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add new input message', error });
    }
};
const removeInputMessage = async (req, res) => {
    try {
        const updatedTextMessage = await TextProcess.findOneAndUpdate(
            { _id : req.body._id },
            { $pull: { inputMessage: req.body.inputMessageToRemove } },
            { new: true }
        );
        if (!updatedTextMessage) {
            return res.status(404).json({ message: 'Text Message not found' });
        }
        res.json({ message: 'Input Message removed successfully', textMessage: updatedTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove input message', error });
    }
};
const removeInputMessageFromChildren = async (req, res) => {
    const { _id, targetId, inputMessageToRemove } = req.body;
    try {
        const updatedTextMessage = await TextProcess.findOneAndUpdate(
            { _id, 'children.targetId': targetId },
            { $pull: { 'children.$.inputMessage': inputMessageToRemove } },
            { new: true }
        );
        
        if (!updatedTextMessage) {
            return res.status(404).json({ message: 'Text Message or Child not found' });
        }
        
        res.json({ message: 'Input Message removed successfully from Child', textMessage: updatedTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove input message from Child', error });
    }
};
const addInputMessageChildren = async (req, res) => {
    const { _id, newInputMessage, targetId } = req.body;

    try {
        const updatedTextMessage = await TextProcess.findOneAndUpdate(
            { _id, 'children.targetId': targetId },
            { $push: { 'children.$.inputMessage': newInputMessage } },
            { new: true }
        );
        if (!updatedTextMessage) {
            return res.status(404).json({ message: 'Text Message not found' });
        }
        res.json({ message: 'New Input Message added successfully', textMessage: updatedTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add new input message', error });
    }
};
const getDefaultMessageFromDB = async () => {
    try {
        const defaultMessage = await TextProcess.findOne({ 'children.$.type_message': "Default" });
        if (defaultMessage) {
            return defaultMessage.targetMessage;
        } else {
            return "Mensaje por defecto cuando no se entiende";
        }
    } catch (error) {
        console.error("Error fetching default message from the database:", error);
        return "Mensaje por defecto cuando no se entiende";
    }
};
const updateText = async (req, res) => {
    const { _id, targetMessage} = req.body;
    try {
      const updateTextMessage = await TextProcess.findOneAndUpdate(
        { _id },
        { targetMessage: targetMessage},
        { new: true }
      );
      if (!updateTextMessage) {
        return res.status(404).json({ message: 'Text Message not found' });
      }
      res.json({ message: 'Text Message status updated successfully', textMessage: updateTextMessage });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user status', error });
    }
};
const updateTextChildren = async (req, res) => {
    const { _id, targetId, targetMessage } = req.body;
    try {
        const updateTextMessage = await TextProcess.findOneAndUpdate(
            { _id, 'children.targetId': targetId },
            { $set: { 'children.$.targetMessage': targetMessage } },
            { new: true }
        );
        if (!updateTextMessage) {
            return res.status(404).json({ message: 'Text Message not found' });
        }
        res.json({ message: 'Child Text Message updated successfully', textMessage: updateTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update child text message', error });
    }
};
const updateTypeTextChildren = async (req, res) => {
    const { _id, targetId, type_message } = req.body;
    try {
        const updateTextMessage = await TextProcess.findOneAndUpdate(
            { _id, 'children.targetId': targetId },
            { $set: { 'children.$.type_message': type_message } },
            { new: true }
        );
        if (!updateTextMessage) {
            return res.status(404).json({ message: 'Text Message not found' });
        }
        res.json({ message: 'Child Text Message updated successfully', type_message: updateTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update child text message', error });
    }
};
const updateImageChildren = async (req, res) => {
    const { _id, targetId, messageType, link } = req.body;
    try {
        const updateTextMessage = await TextProcess.findOneAndUpdate(
            { _id, 'children.targetId': targetId },
            { $set: { 'children.$.messageType': messageType, 'children.$.link': link  } },
            { new: true }
        );
        if (!updateTextMessage) {
            return res.status(404).json({ message: 'Text Message not found' });
        }
        res.json({ message: 'Child Text Message updated successfully', textMessage: updateTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update child text message', error });
    }
};
const removeChild = async (req, res) => {
    const { _id, targetId } = req.body;
    try {
        const updatedTextMessage = await TextProcess.findOneAndUpdate(
            { _id },
            { $pull: { children: { targetId: targetId } } },
            { new: true }
        );
        if (!updatedTextMessage) {
            return res.status(404).json({ message: 'Text Message not found' });
        }
        res.json({ message: 'Child removed successfully', textMessage: updatedTextMessage });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove child', error });
    }
};

const updateStatusTemplateTrue = async (req, res) => {
    const { _id, status } = req.body;
    try {
      const updateTextMessage = await TextProcess.findOneAndUpdate(
        { _id },
        { template_message: status },
        { new: true }
      );
      if (!updateTextMessage) {
        return res.status(404).json({ message: 'Text Message not found' });
      }
      res.json({ message: 'Text Message status updated successfully', textMessage: updateTextMessage });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user status', error });
    }
};
module.exports = {
    getListOfTextProcess, 
    updateTypeTextChildren,
    getDefaultMessageFromDB,
    updateImageChildren, 
    postTextProcess, 
    updateText, 
    updateTextChildren, 
    addInputMessage, 
    addInputMessageChildren, 
    addNewChild,
    addNewGrandChild, 
    removeInputMessage, 
    removeInputMessageFromChildren, 
    removeChild,
    updateStatusTemplateTrue
};