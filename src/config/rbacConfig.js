export const ROUTES_PATHS = {
    DASHBOARD: "/dashboard",
    INDIVIDUAL_PROFILE: "/individual-profile",
    NEW_INDIVIDUAL_PROFILE: "/new-individual-profile",
    INDIVIDUAL_PROFILE_DETAIL: "/individual-profile-detail",
    CORPORATE_PROFILE: "/corporate-profile",
    NEW_CORPORATE_PROFILE: "/new-corporate-profile",
    CORPORATE_PROFILE_DETAIL: "/corporate-profile-detail",
    CUSTOMER_LINK_PARTY: "/customer-link-party",
    PROFILE_VIEW: "/profile-view",
    QUICK_PROFILE: "/quick-profile",
    UPLOAD_ADDITIONAL_DOC: "/upload-additional-doc",
    TRANSACTION_ENTRY: "/transaction-entry",
    TRANSACTION_CANCEL: "/transaction-cancel",
    ONBOARDING_ALERT: "/onboarding-alert",
    TRANSACTION_ALERT: "/transaction-alert",
    ONGOING_ALERT: "/ongoing-alert",
    NAME_CHECKER: "/name-checker",
    DPMSR_REPORT: "/dpmsr-report",
    CUSTOMER_REPORT: "/customer-report",
    TRANSACTION_REPORT: "/transaction-report",
    SCREENING_VIOLATION: "/screening-violation",
    SCREENING_LOG_REPORT: "/screening-log-report",
    EXPIRED_IDS_REPORT: "/expired-ids-report",
    INACTIVE_CUSTOMERS: "/inactive-customers",
    RISK_REPORT: "/risk-report",
    ONGOING_SCREENING_REPORT: "/ongoing-screening-report",
    CUSTOMER_LINK_REPORT: "/customer-link-report",
    PROFESSION: "/profession",
    ID_TYPE: "/id-type",
    NATURE_OF_BUSINESS: "/nature-of-business",
    LEGAL_TYPE: "/legal-type",
    ID_ISSUE_AUTHORITY: "/id-issue-authority",
};

export const ROLE_PERMISSIONS = {
    SalesStaff: [
        {
            name: "Onboarding",
            icon: "UserPlus",
            subItems: [
                { name: "Quick Profile", path: ROUTES_PATHS.QUICK_PROFILE }
            ]
        },
        {
            name: "Report",
            icon: "FileText",
            subItems: [
                { name: "KYC Report individual", path: ROUTES_PATHS.CUSTOMER_REPORT },
                { name: "Risk Rating Report Individual", path: ROUTES_PATHS.RISK_REPORT }
            ]
        }
    ],
    ComplianceOfficer: [
        { name: "Dashboard", icon: "LayoutDashboard", path: ROUTES_PATHS.DASHBOARD },
        {
            name: "Onboarding",
            icon: "UserPlus",
            subItems: [
                { name: "Individual profile", path: ROUTES_PATHS.INDIVIDUAL_PROFILE },
                { name: "Corporate profile", path: ROUTES_PATHS.CORPORATE_PROFILE },
                { name: "Customer Link party", path: ROUTES_PATHS.CUSTOMER_LINK_PARTY },
                { name: "Profile View", path: ROUTES_PATHS.PROFILE_VIEW },
                { name: "Quick Profile", path: ROUTES_PATHS.QUICK_PROFILE },
                { name: "Upload Additional Doc", path: ROUTES_PATHS.UPLOAD_ADDITIONAL_DOC }
            ]
        },
        {
            name: "Transaction",
            icon: "ArrowRightLeft",
            subItems: [
                { name: "Transaction Entry", path: ROUTES_PATHS.TRANSACTION_ENTRY },
                { name: "Transaction Cancel", path: ROUTES_PATHS.TRANSACTION_CANCEL }
            ]
        },
        {
            name: "Alert",
            icon: "Bell",
            subItems: [
                { name: "Onboarding Alert", path: ROUTES_PATHS.ONBOARDING_ALERT },
                { name: "Transaction Alert", path: ROUTES_PATHS.TRANSACTION_ALERT },
                { name: "Ongoing Alert", path: ROUTES_PATHS.ONGOING_ALERT },
                { name: "Name Checker", path: ROUTES_PATHS.NAME_CHECKER }
            ]
        },
        {
            name: "Report",
            icon: "FileText",
            subItems: [
                { name: "DPMSR Report", path: ROUTES_PATHS.DPMSR_REPORT },
                { name: "Snapshot Report", path: ROUTES_PATHS.CUSTOMER_REPORT },
                { name: "Customer Report", path: ROUTES_PATHS.CUSTOMER_REPORT },
                { name: "Transaction Report", path: ROUTES_PATHS.TRANSACTION_REPORT },
                { name: "Screening Violation", path: ROUTES_PATHS.SCREENING_VIOLATION },
                { name: "Exploit-IDs Report", path: ROUTES_PATHS.EXPIRED_IDS_REPORT },
                { name: "Inactive Customers", path: ROUTES_PATHS.INACTIVE_CUSTOMERS },
                { name: "Risk Report", path: ROUTES_PATHS.RISK_REPORT },
                { name: "Ongoing Screening Report", path: ROUTES_PATHS.ONGOING_SCREENING_REPORT },
                { name: "Ongoing Alert Report", path: ROUTES_PATHS.ONGOING_ALERT }
            ]
        },
        {
            name: "Masters",
            icon: "Settings",
            subItems: [
                { name: "Profession", path: ROUTES_PATHS.PROFESSION },
                { name: "ID Type", path: ROUTES_PATHS.ID_TYPE },
                { name: "Nature of Business", path: ROUTES_PATHS.NATURE_OF_BUSINESS },
                { name: "Entity", path: ROUTES_PATHS.LEGAL_TYPE },
                { name: "Logo Type", path: ROUTES_PATHS.ID_TYPE }, // Fallback to ID Type if logo type missing or similar
                { name: "ID Issue Authority", path: ROUTES_PATHS.ID_ISSUE_AUTHORITY }
            ]
        }
    ],
    Owner: [
        { name: "Dashboard", icon: "LayoutDashboard", path: ROUTES_PATHS.DASHBOARD },
        {
            name: "Onboarding",
            icon: "UserPlus",
            subItems: [
                { name: "Individual profile", path: ROUTES_PATHS.INDIVIDUAL_PROFILE },
                { name: "Corporate profile", path: ROUTES_PATHS.CORPORATE_PROFILE },
                { name: "Customer Link party", path: ROUTES_PATHS.CUSTOMER_LINK_PARTY },
                { name: "Profile View", path: ROUTES_PATHS.PROFILE_VIEW },
                { name: "Quick Profile", path: ROUTES_PATHS.QUICK_PROFILE },
                { name: "Upload Additional Doc", path: ROUTES_PATHS.UPLOAD_ADDITIONAL_DOC }
            ]
        },
        {
            name: "Transaction",
            icon: "ArrowRightLeft",
            subItems: [
                { name: "Transaction Entry", path: ROUTES_PATHS.TRANSACTION_ENTRY },
                { name: "Transaction Cancel", path: ROUTES_PATHS.TRANSACTION_CANCEL }
            ]
        },
        {
            name: "Alert",
            icon: "Bell",
            subItems: [
                { name: "Onboarding Alert", path: ROUTES_PATHS.ONBOARDING_ALERT },
                { name: "Transaction Alert", path: ROUTES_PATHS.TRANSACTION_ALERT },
                { name: "Ongoing Alert", path: ROUTES_PATHS.ONGOING_ALERT },
                { name: "Name Checker", path: ROUTES_PATHS.NAME_CHECKER }
            ]
        },
        {
            name: "Report",
            icon: "FileText",
            subItems: [
                { name: "DPMSR Report", path: ROUTES_PATHS.DPMSR_REPORT },
                { name: "Snapshot Report", path: ROUTES_PATHS.CUSTOMER_REPORT },
                { name: "Customer Report", path: ROUTES_PATHS.CUSTOMER_REPORT },
                { name: "Transaction Report", path: ROUTES_PATHS.TRANSACTION_REPORT },
                { name: "Screening Violation", path: ROUTES_PATHS.SCREENING_VIOLATION },
                { name: "Exploit-IDs Report", path: ROUTES_PATHS.EXPIRED_IDS_REPORT },
                { name: "Inactive Customers", path: ROUTES_PATHS.INACTIVE_CUSTOMERS },
                { name: "Risk Report", path: ROUTES_PATHS.RISK_REPORT },
                { name: "Ongoing Screening Report", path: ROUTES_PATHS.ONGOING_SCREENING_REPORT },
                { name: "Ongoing Alert Report", path: ROUTES_PATHS.ONGOING_ALERT }
            ]
        },
        {
            name: "Masters",
            icon: "Settings",
            subItems: [
                { name: "Profession", path: ROUTES_PATHS.PROFESSION },
                { name: "ID Type", path: ROUTES_PATHS.ID_TYPE },
                { name: "Nature of Business", path: ROUTES_PATHS.NATURE_OF_BUSINESS },
                { name: "Entity", path: ROUTES_PATHS.LEGAL_TYPE },
                { name: "Logo Type", path: ROUTES_PATHS.ID_TYPE },
                { name: "ID Issue Authority", path: ROUTES_PATHS.ID_ISSUE_AUTHORITY }
            ]
        }
    ]
};
