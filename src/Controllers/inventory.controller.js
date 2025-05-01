import Inventory from "../Models/Inventory.js";

export const createInventory = async (req, res) => {
    try {
        const { inventoryName, items } = req.body;
        const userId = req.session.userId;

        // Create new inventory
        const inventory = new Inventory({
            userId,
            inventoryName,
            items
        });

        await inventory.save();
        return res.status(201).json({
            success: true,
            message: "Inventory created successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const updateInventory = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const { inventoryName, items } = req.body;

        const inventory = await Inventory.findByIdAndUpdate(
            inventoryId,
            { inventoryName, items },
            { new: true }
        );

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Inventory updated successfully",
            inventory
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getUserInventories = async (req, res) => {
    try {
        const userId = req.session.userId;
        const inventories = await Inventory.find({ userId }).sort({ createdAt: -1 });

        if (!inventories.length) {
            return res.status(404).json({
                success: false,
                message: "No inventories found for this user"
            });
        }

        return res.status(200).json({
            success: true,
            inventories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getInventoryById = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const inventory = await Inventory.findById(inventoryId);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found"
            });
        }

        return res.status(200).json({
            success: true,
            inventory
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const deleteInventory = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const inventory = await Inventory.findByIdAndDelete(inventoryId);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Inventory deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};