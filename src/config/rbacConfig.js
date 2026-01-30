export const ROLE_PERMISSIONS = {
    SalesStaff: [
        {
            name: "Onboarding",
            icon: "UserPlus",
            subItems: [
                { name: "Quick Profile", path: "/onboarding/quick-profile" }
            ]
        },
        {
            name: "Report",
            icon: "FileText",
            subItems: [
                { name: "KYC Report individual", path: "/report/kyc-individual" },
                { name: "Risk Rating Report Individual", path: "/report/risk-rating-individual" }
            ]
        }
    ],
    ComplianceOfficer: [
        { name: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
        {
            name: "Onboarding",
            icon: "UserPlus",
            subItems: [
                { name: "Individual profile", path: "/onboarding/individual" },
                { name: "Corporate profile", path: "/onboarding/corporate" },
                { name: "Customer Link party", path: "/onboarding/link-party" },
                { name: "Profile View", path: "/onboarding/view" },
                { name: "Quick Profile", path: "/onboarding/quick-profile" },
                { name: "Upload Additional Doc", path: "/onboarding/upload" }
            ]
        },
        {
            name: "Transaction",
            icon: "ArrowRightLeft",
            subItems: [
                { name: "Transaction Entry", path: "/transaction/entry" },
                { name: "Transaction Cancel", path: "/transaction/cancel" }
            ]
        },
        {
            name: "Alert",
            icon: "Bell",
            subItems: [
                { name: "Onboarding Alert", path: "/alert/onboarding" },
                { name: "Transaction Alert", path: "/alert/transaction" },
                { name: "Ongoing Alert", path: "/alert/ongoing" },
                { name: "Name Checker", path: "/alert/name-checker" }
            ]
        },
        {
            name: "Report",
            icon: "FileText",
            subItems: [
                { name: "DPMSR Report", path: "/report/dpmsr" },
                { name: "Snapshot Report", path: "/report/snapshot" },
                { name: "Customer Report", path: "/report/customer" },
                { name: "Transaction Report", path: "/report/transaction" },
                { name: "Screening Violation", path: "/report/violation" },
                { name: "Exploit-IDs Report", path: "/report/exploit-ids" },
                { name: "Inactive Customers", path: "/report/inactive" },
                { name: "Risk Report", path: "/report/risk" },
                { name: "Ongoing Screening Report", path: "/report/ongoing-screening" },
                { name: "Ongoing Alert Report", path: "/report/ongoing-alert" }
            ]
        },
        {
            name: "Masters",
            icon: "Settings",
            subItems: [
                { name: "Profession", path: "/masters/profession" },
                { name: "ID Type", path: "/masters/id-type" },
                { name: "Nature of Business", path: "/masters/business-nature" },
                { name: "Entity", path: "/masters/entity" },
                { name: "Logo Type", path: "/masters/logo-type" },
                { name: "ID Issue Authority", path: "/masters/issue-authority" }
            ]
        }
    ],
    Owner: [
        { name: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
        {
            name: "Onboarding",
            icon: "UserPlus",
            subItems: [
                { name: "Individual profile", path: "/onboarding/individual" },
                { name: "Corporate profile", path: "/onboarding/corporate" },
                { name: "Customer Link party", path: "/onboarding/link-party" },
                { name: "Profile View", path: "/onboarding/view" },
                { name: "Quick Profile", path: "/onboarding/quick-profile" },
                { name: "Upload Additional Doc", path: "/onboarding/upload" }
            ]
        },
        {
            name: "Transaction",
            icon: "ArrowRightLeft",
            subItems: [
                { name: "Transaction Entry", path: "/transaction/entry" },
                { name: "Transaction Cancel", path: "/transaction/cancel" }
            ]
        },
        {
            name: "Alert",
            icon: "Bell",
            subItems: [
                { name: "Onboarding Alert", path: "/alert/onboarding" },
                { name: "Transaction Alert", path: "/alert/transaction" },
                { name: "Ongoing Alert", path: "/alert/ongoing" },
                { name: "Name Checker", path: "/alert/name-checker" }
            ]
        },
        {
            name: "Report",
            icon: "FileText",
            subItems: [
                { name: "DPMSR Report", path: "/report/dpmsr" },
                { name: "Snapshot Report", path: "/report/snapshot" },
                { name: "Customer Report", path: "/report/customer" },
                { name: "Transaction Report", path: "/report/transaction" },
                { name: "Screening Violation", path: "/report/violation" },
                { name: "Exploit-IDs Report", path: "/report/exploit-ids" },
                { name: "Inactive Customers", path: "/report/inactive" },
                { name: "Risk Report", path: "/report/risk" },
                { name: "Ongoing Screening Report", path: "/report/ongoing-screening" },
                { name: "Ongoing Alert Report", path: "/report/ongoing-alert" }
            ]
        },
        {
            name: "Masters",
            icon: "Settings",
            subItems: [
                { name: "Profession", path: "/masters/profession" },
                { name: "ID Type", path: "/masters/id-type" },
                { name: "Nature of Business", path: "/masters/business-nature" },
                { name: "Entity", path: "/masters/entity" },
                { name: "Logo Type", path: "/masters/logo-type" },
                { name: "ID Issue Authority", path: "/masters/issue-authority" }
            ]
        }
    ]
};
