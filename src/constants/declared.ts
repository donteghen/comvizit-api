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
    REVIEW_AUTHOR_TYPE: {
        TENANT:'TENANT',
        LANDLORD:'LANDLORD'
    },
    USER_ROLE: {
        ADMIN: 'ADMIN',
        TENANT: 'TENANT',
        LANDLORD: 'LANDLORD'
    },
    USER_GENDER_OPTIONS : {
        MALE: 'M',
        FEMALE: 'F'
    },
    USER_LANGUAGE_OPTIONS :  {
        FRENCH: 'French',
        ENGLISH: 'English',
        ENGLISH_FRENCH: 'English & French'
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
    COMPLAIN_TYPES : {
        'property': 'PROPERTY',
        'landlord': 'LANDLORD'
    },
    COMPLAIN_SUBJECTS : {
        'reportLandlord': 'Report a Landlord',
        'reportProperty': 'Report a Property'
    },
    FEATURED_PROPERTY_STATUS : {
        'ACTIVE': 'Active',
        'INACTIVE': 'Inactive'
    },
    PROPERTY_TYPES : {
        STUDIO: 'Studio',
        APARTMENT: 'Apartment',
        PRIVATE_ROOM: 'Private Room',
        VILLA: 'Villa',
        HOUSE: 'House',
        OFFICE: 'Office'
    },
    PROPERTY_BEDROOM_OPTIONS : {
        ONE: 'ONE',
        TWO: 'TWO',
        THREE: 'THREE',
        FOURPLUS: 'FOURPLUS'
    },
    PROPERTY_FURNISHED_STATE : {
        FURNISHED: 'Furnished',
        UNFURNISHED: 'Unfurnished'
    },
    PROPERTY_PREFERED_TENANT_GENDERS : {
        MALE: 'Male',
        FEMALE: 'Female',
        ALL: 'All'
    },
    PROPERTY_PREFERED_TENANT_TYPES : {
        STUDENTS: 'Student',
        FAMILY: 'Family',
        ALL: 'All'
    },
    PROPERTY_AVAILABILITY_STATUS_OPTIONS: {
        'BOOKED': 'Booked',
        'TAKEN': 'Taken',
        'UNAVAILABLE': 'Unavailable',
        'AVAILABLE': 'Available'
    },
    TAG_STATUS_OPTIONS : {
        ACTIVE: 'Active',
        INACTIVE: 'Inactive'
    },
    TAG_TYPES : {
        PROPERTY: 'Property',
        USER: 'User'
    }
}


export const messages = {
    'AUTO_CREATE_RENT_INTENTION_COMMENT': {
        'en': "I'm interested in this property and will love to rent it. Please get back to me soonest.",
        'fr': "Je suis intéressé par cette propriété et j'aimerai la louer. Merci de me recontacter au plus vite."
    }
}
