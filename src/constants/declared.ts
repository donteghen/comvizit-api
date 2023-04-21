export const constants = {
    RENT_INTENTION_STATUS_OPTIONS: {
        'INITIATED': 'INITIATED',
        'CONCLUDED': 'CONCLUDED', // when a rental-history is initiated for that particular rent-intention
        'CONFIRMED': 'CONFIRMED', // when booking has been paid for by the tenant
        'CANCELED': 'CANCELED' // if the tenant doesn't pay the booking fee within the set maxDuration on property or landlord changes hismind on the tenant choice.
    },
    REVIEW_TYPES: {
        'PROPERTY': 'Property',
        'LANDLORD': 'Landlord',
        'TENANT': 'Tenant',
        'PLATFORM': 'Platform'
    },
    REVIEW_STATUS: {
        ACTIVE: 'Active',
        'INACTIVE': 'Inactive'
    },
    USER_ROLE: {
        ADMIN: 'ADMIN',
        TENANT: 'TENANT',
        LANDLORD: 'LANDLORD'
    },
    PROPERTY_AVAILABILITY_STATUS_OPTIONS: {
        'BOOKED': 'Booked',
        'TAKEN': 'Taken',
        'UNAVAILABLE': 'Unavailable',
        'AVAILABLE': 'Available'
    },
    RENTAL_HISTORY_STATUS_OPTIONS: {
        'ONGOING' : 'ONGOING',
        'TERMINATED': 'TERMINATED'
    },
    BOOKING_PAYMENT_OPTIONS : {
        'MTN_MOMO': 'MTN_MOMO',
        'ORANGE_MOMO': 'ORANGE_MOMO',
        'CASH': 'CASH'
    },
}


export const messages = {
    'AUTO_CREATE_RENT_INTENTION_COMMENT': {
        'en': "I'm interested in this property and will love to rent it. Please get back to me soonest.",
        'fr': "Je suis intéressé par cette propriété et j'aimerai la louer. Merci de me recontacter au plus vite."
    }
}