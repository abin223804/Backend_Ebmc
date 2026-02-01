import { ROLE_PERMISSIONS } from "../config/rbacConfig.js";

/**
 * Get sidetab permissions based on the authenticated user's role.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getSidetabPermissions = async (req, res) => {
    try {
        const { role } = req.user;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "User role not found in request"
            });
        }

        const permissions = ROLE_PERMISSIONS[role];

        if (!permissions) {
            return res.status(404).json({
                success: false,
                message: `Permissions not found for role: ${role}`
            });
        }

        return res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error) {
        console.error("Error fetching RBAC permissions:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching permissions"
        });
    }
};
