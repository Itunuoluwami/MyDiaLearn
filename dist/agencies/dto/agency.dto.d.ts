export declare class UpdateAgencyDto {
    name?: string;
    registrationNumber?: string | null;
    countryCode?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    website?: string | null;
    about?: string | null;
}
export declare class AddAgencyTutorDto {
    fullName: string;
    email: string;
    timezone?: string;
}
export declare class AgencyBookingsQueryDto {
    status?: string;
    from?: string;
    to?: string;
}
export declare class AgencyPayoutDto {
    amount: number;
}
