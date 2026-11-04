// TurfOS plan catalogue: the single source of truth for what each plan
// unlocks. The registry embeds the matching entry in every licence/status
// response, so deployments enforce limits and feature flags from here.

const BASIC_FEATURES = {
    bookingPWA: true,
    onlinePayments: true,
    manualBookings: true,
    calendarManagement: true,
    basicAnalytics: true,

    coupons: false,
    advancedAnalytics: false,
    leaderboards: false,
    pitchWiseReports: false,

    staffManagement: false,
    roleBasedAccess: false,
    financialExports: false
};

const GROWTH_FEATURES = {
    ...BASIC_FEATURES,
    coupons: true,
    advancedAnalytics: true,
    leaderboards: true,
    pitchWiseReports: true
};

const BUSINESS_FEATURES = {
    ...GROWTH_FEATURES,
    staffManagement: true,
    roleBasedAccess: true,
    financialExports: true
};

export const PLANS = {
    basic: {
        code: "basic",
        name: "Basic",
        label: "Entry plan",
        tagline: "Everything needed to digitize a single turf.",
        price: 1299,
        currency: "INR",
        interval: "month",
        limits: {
            maxPitches: 1,
            maxStaff: 1,
            maxAdmins: 1
        },
        features: BASIC_FEATURES,
        highlights: [
            "1 pitch",
            "Customer-facing booking PWA",
            "Complete booking CRM",
            "Unlimited bookings",
            "Unlimited customers",
            "Online payment integration",
            "Manual / walk-in booking management",
            "Calendar and availability management",
            "Time slots and pricing management",
            "Services management",
            "Basic revenue analytics",
            "Booking history",
            "Customer management",
            "Booking status notifications"
        ]
    },

    growth: {
        code: "growth",
        name: "Growth",
        label: "Recommended",
        tagline: "For growing facilities with multiple pitches.",
        price: 1999,
        currency: "INR",
        interval: "month",
        limits: {
            maxPitches: 3,
            maxStaff: 1,
            maxAdmins: 1
        },
        features: GROWTH_FEATURES,
        includes: "basic",
        highlights: [
            "Up to 3 pitches",
            "Coupon and discount management",
            "Advanced analytics dashboard",
            "Pitch-wise revenue tracking",
            "Pitch-wise booking statistics",
            "Leaderboards",
            "Customer booking insights",
            "Promotional campaigns",
            "Peak-hour analysis"
        ]
    },

    business: {
        code: "business",
        name: "Business",
        label: "Advanced",
        tagline: "For established sports facilities.",
        price: 2999,
        currency: "INR",
        interval: "month",
        limits: {
            maxPitches: 6,
            maxStaff: 10,
            maxAdmins: 3
        },
        features: BUSINESS_FEATURES,
        includes: "growth",
        highlights: [
            "Up to 6 pitches",
            "Staff management",
            "Multiple admin accounts",
            "Role-based access control",
            "Advanced financial reports",
            "Customer retention analytics",
            "Booking export (CSV / Excel)",
            "Custom booking policies",
            "Priority support",
            "Advanced business insights"
        ]
    }
};

export const PLAN_CODES = Object.keys(PLANS);

export const DEFAULT_PLAN_CODE = "basic";

export function isValidPlanCode(code) {
    return Object.hasOwn(PLANS, code);
}

// Subscriptions created before plan tiers existed carry billing-cycle codes
// such as "monthly"; they receive the entry-level entitlements.
export function resolvePlan(code) {
    return PLANS[code] || PLANS[DEFAULT_PLAN_CODE];
}

// The licence payload a deployment receives: just what it needs to enforce.
export function getPlanEntitlements(code) {
    const plan = resolvePlan(code);

    return {
        code: plan.code,
        name: plan.name,
        limits: { ...plan.limits },
        features: { ...plan.features }
    };
}
