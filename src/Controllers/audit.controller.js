import Audit from "../Models/Audit.js ";

export const createAudit = async (req, res) => {
    try {
        const { certificateId, auditType, scheduledDate, farmerId } = req.body;
        const auditor = req.session.userId;
        const status = "scheduled";
        // Check if the audit is already scheduled for the certificate
        const existingAudit = await Audit.findOne({ certificateId, status });
        if (existingAudit) {
            return res.status(400).json({
                success: false,
                message: "Audit already scheduled for this certificate"
            });
        }

        //create new audit
        const audit = new Audit({
            certificateId,
            auditor,
            auditType,
            status,
            farmerId,
            scheduledDate
        });
        await audit.save();
        return res.status(201).json({
            success: true,
            message: "Audit created successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const updateAudiit = async (req, res) => {
}

export const completeAudit = async (req, res) => {
    try {
        const { auditId } = req.params;
        const { findings } = req.body;

        if (!findings) {
            return res.status(400).json({
                success: false,
                message: "Findings are required"
            });
        }

        const audit = await Audit.findByIdAndUpdate(
            auditId,
            {
                status: "completed",
                findings,
                completionDate: new Date()
            },
            { new: true }
        );

        if (!audit) {
            return res.status(404).json({
                success: false,
                message: "Audit not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Audit completed successfully",
            audit
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


export const getUserAudit = async (req, res) => {
    try {
        const userId = req.session.userId;
        // Find audits for the user
        // console.log(req.user);
        const audits = await Audit.find({ auditor: userId }).populate("certificateId", "productName entityId certificationType expiryDate status").populate("farmerId", "name email role company").sort({ createdAt: -1 });
        if (!audits) {
            return res.status(404).json({
                success: false,
                message: "No audits found for this user"
            });
        }
        return res.status(200).json({
            success: true,
            audits
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const getUserCompletedAudit = async (req, res) => {
    try {
        const userId = req.session.userId;
        const audits = await Audit.find({ auditor: userId, status: "completed" }).populate("certificateId", "productName entityId certificationType expiryDate status").populate("farmerId", "name email role company").sort({ createdAt: -1 });
        if (!audits) {
            return res.status(404).json({
                success: false,
                message: "No audits found for this user"
            });
        }
        return res.status(200).json({
            success: true,
            Completedaudits:audits
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
