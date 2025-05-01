import Product from "../Models/Product.js";
import Tracking from "../Models/Tracking.js";

export const getUserTracking = async (req, res) => {
    try {
        const tracking = await Tracking.find({ userId: req.session.userId })
            .populate("productId", "name category location quantity price description certifications manufacturingData registeredBy");
        // console.log(tracking);
        return res.status(200).json({
            message: "Tracking records fetched successfully",
            data: tracking,
            success: true,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching tracking records",
            error: error.message,
            success: false,
        });
    }
}

export const getTrackingByProductId = async (req, res) => {
    try {
        console.log(req.params.productId);
        const tracking = await Tracking.find({ _id: req.params.productId })
            .populate("productId", "name category location quantity price description certifications manufacturingData registeredBy")
            .populate("distributorId", "name email phone location");
        return res.status(200).json({
            message: "Tracking records fetched successfully",
            data: tracking,
            success: true,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching tracking records",
            error: error.message,
            success: false,
        });
    }
}

export const transferProduct = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const {
            distributorId,
            nextDestination,
            temperature,
            humidity,
            notes,
            expectedDeliveryDate
        } = req.body;

        const tracking = await Tracking.findOne({ _id: trackingId });
        // console.log(trackingId);
        if (!tracking) {
            return res.status(404).json({
                message: "Tracking record not found",
                success: false,
            });
        }

        tracking.currentStatus = 'in_transit';
        tracking.distributorId = distributorId || tracking.distributorId;
        tracking.nextDestination = nextDestination || tracking.nextDestination;
        tracking.currentLocation = tracking.currentLocation;
        tracking.expectedDeliveryDate = expectedDeliveryDate || tracking.expectedDeliveryDate;

        // Add a new event to the timeline
        tracking.timeline.push({
            status: 'in_transit',
            location: tracking.currentLocation,
            date: new Date(),
            notes: `Transferred to manufacturer. Temp: ${temperature || 'N/A'}°C, Humidity: ${humidity || 'N/A'}%. Notes: ${notes || 'N/A'}`
        });

        // Save the updated tracking document
        const updatedTracking = await tracking.save();

        return res.status(200).json({
            message: "Product transferred successfully",
            data: updatedTracking,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error transferring product",
            error: error.message,
            success: false,
        });
    }
};

export const getDistributorTracking = async (req, res) => {
    try {
        const distributorId = req.session.userId;
        const tracking = await Tracking.find({ distributorId: distributorId })
            .populate("productId", "name category location quantity price description certifications manufacturingData registeredBy")
            .populate("distributorId", "name email phone location");
        if (!tracking) {
            return res.status(404).json({
                message: "Tracking record not found",
                success: false,
            });
        }
        return res.status(200).json({
            data: tracking,
            message: "Tracking record fetched successfully",
            success: true,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching tracking record",
            error: error.message,
            success: false,
        });
    }
}

export const acceptProduct = async (req, res) => {
    try {
        const trackingId = req.params.trackingId;
        const tracking = await Tracking.findOne({ _id: trackingId });
        if (!tracking) {
            return res.status(404).json({
                message: "Tracking record not found",
                success: false,
            });
        }
        tracking.currentStatus = 'delivered';
        tracking.currentLocation = tracking.nextDestination || tracking.currentLocation;
        tracking.nextDestination = null; // Clear the next destination
        tracking.expectedDeliveryDate = null; // Clear the expected delivery date

        tracking.timeline.push({
            status: 'delivered',
            location: tracking.currentLocation,
            date: new Date(),
            notes: "Poduct accepted by distributor."
        });
        await tracking.save();

        const product = await Product.findByIdAndUpdate(tracking.productId, {
            status: 'delivered',
            owner: tracking.distributorId,
        }, { new: true });
        return res.status(200).json({
            message: "Product accepted successfully",
            data: tracking,
            success: true,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error accepting product",
            error: error.message,
            success: false,
        });
    }
}

export const getDistributorDeliveredProduct = async (req, res) => {
    try {
        const distributorId = req.session.userId;
        const products = await Tracking.find({ distributorId: distributorId, currentStatus: 'delivered' }).
            populate("productId", "name category location quantity price description certifications manufacturingData registeredBy")
        if (!products) {
            return res.status(404).json({
                message: "Tracking record not found",
                success: false,
            });
        }
        return res.status(200).json({
            data: products,
            message: "Tracking record fetched successfully",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server error.",
            Error: error
        })
    }
}