import { isValidObjectId } from "mongoose";
import Certificate from "../Models/Certificate.js";
import Tracking from "../Models/Tracking.js";

export const getPendingCertificates = async (req, res) => {
    try {
        const pendingCertificates = await Certificate.find({ status: "pending" }).populate("entityId", "name email phoneNumber").populate("productId", "name category location quantity price description certifications manufacturingData registeredBy");
        return res.status(200).json({
            success: true,
            message: "Pending certificates fetched successfully",
            pendingCertificates,
        }
        );
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching pending certificates", error: error.message });
    }
}

export const getAllRequestes = async (req, res) => {
    try {
        const requests = await Certificate.find();
        return res.status(200).json({
            success: true,
            message: "All requests fetched successfully",
            requests,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching all requests", error: error.message });
    }
}

export const approveCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const { status, expiryDate } = req.body;
        console.log(certificateId, status, expiryDate);


        if (!status || !expiryDate) {
            return res.status(400).json({ message: "Please provide status and expiry date" });
        }
        if (isValidObjectId(certificateId) === false) {
            return res.status(400).json({ message: "Invalid certificate ID" });
        }

        // Find the existing certificate to get the productId
        const existingCertificate = await Certificate.findById(certificateId);

        if (!existingCertificate) {
            return res.status(404).json({
                message: "Certificate not found",
                success: false
            });
        }

        // Check if the status is "certified"
        if (status === "approved") {
            // Create a tracking event for the certification
            const trackingEvent = {
                status: 'certified',
                date: new Date(),
                location: 'Certification Office', // Adjust this location as needed
                handledBy: 'Certification Authority', // Adjust this as needed
                notes: 'Product certified successfully'
            };

            const productId = existingCertificate.productId;

            // Add the tracking event to the product's tracking timeline
            await Tracking.updateOne(
                { productId: productId },
                {
                    $push: { timeline: trackingEvent },
                    $set: { currentStatus: 'certified', lastUpdated: new Date() }
                }
            );
        }

        if (status == "approved") {
            existingCertificate.status = "active"
        }
        existingCertificate.expiryDate = expiryDate;
        await existingCertificate.save();

        return res.status(200).json({
            message: "Certificate updated successfully",
            success: true,
            certificate: existingCertificate
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error updating certificate",
            success: false,
            error: error.message
        });
    }
};