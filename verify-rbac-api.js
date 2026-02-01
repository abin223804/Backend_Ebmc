import { getSidetabPermissions } from "./src/controllers/rbacController.js";

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

const test = async () => {
    console.log("--- Testing RBAC Controller Logic ---");

    // Test CASE 1: ComplianceOfficer
    const req1 = { user: { role: "ComplianceOfficer" } };
    const res1 = mockRes();
    await getSidetabPermissions(req1, res1);
    console.log("Role: ComplianceOfficer");
    console.log("Status:", res1.statusCode);
    console.log("Success:", res1.body.success);
    console.log("Permissions count:", res1.body.data ? res1.body.data.length : 0);
    console.log("-----------------------------------");

    // Test CASE 2: Owner
    const req2 = { user: { role: "Owner" } };
    const res2 = mockRes();
    await getSidetabPermissions(req2, res2);
    console.log("Role: Owner");
    console.log("Status:", res2.statusCode);
    console.log("Success:", res2.body.success);
    console.log("Permissions count:", res2.body.data ? res2.body.data.length : 0);
    console.log("-----------------------------------");

    // Test CASE 3: SalesStaff
    const req3 = { user: { role: "SalesStaff" } };
    const res3 = mockRes();
    await getSidetabPermissions(req3, res3);
    console.log("Role: SalesStaff");
    console.log("Status:", res3.statusCode);
    console.log("Success:", res3.body.success);
    console.log("Permissions count:", res3.body.data ? res3.body.data.length : 0);
    console.log("-----------------------------------");

    // Test CASE 4: Invalid Role
    const req4 = { user: { role: "InvalidRole" } };
    const res4 = mockRes();
    await getSidetabPermissions(req4, res4);
    console.log("Role: InvalidRole");
    console.log("Status:", res4.statusCode);
    console.log("Success:", res4.body.success);
    console.log("Message:", res4.body.message);
    console.log("-----------------------------------");
};

test().catch(console.error);
