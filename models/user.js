class User {
    constructor({
        id,
        email,
        createdAt,
        otp = null,
        otpExpiry = null,
        isVerified = false,
        isPaymentStatus = false,
        subscriptionExpiry = null,
        companyLogo = null,
        companyName = null,
        country = null,
        lastActiveAt = null,
        lastNotifiedAt = null,
        isAndroidUser = false,
        fcmToken = null,
        profilePhoto = null,
        userName = null,
        accountType = null,
        companyAddress = null,
        companyDescription = null,
        companyEmail = null,
        companyWebsite = null,
        companyZipCode = null,
        companyphoneNumber = null,
        userDesignation = null
    }) {
        this.id = id;
        this.email = email;
        this.createdAt = createdAt ? new Date(createdAt) : null;
        this.otp = otp;
        this.otpExpiry = otpExpiry ? new Date(otpExpiry) : null;
        this.isVerified = isVerified;
        this.isPaymentStatus = isPaymentStatus;
        this.subscriptionExpiry = subscriptionExpiry ? new Date(subscriptionExpiry) : null;
        this.companyLogo = companyLogo;
        this.companyName = companyName;
        this.country = country;
        this.lastActiveAt = lastActiveAt ? new Date(lastActiveAt) : null;
        this.lastNotifiedAt = lastNotifiedAt ? new Date(lastNotifiedAt) : null;
        this.isAndroidUser = isAndroidUser;
        this.fcmToken = fcmToken;
        this.profilePhoto = profilePhoto;
        this.userName = userName;
        this.accountType = accountType;
        this.companyAddress = companyAddress;
        this.companyDescription = companyDescription;
        this.companyEmail = companyEmail;
        this.companyWebsite = companyWebsite;
        this.companyZipCode = companyZipCode;
        this.companyphoneNumber = companyphoneNumber;
        this.userDesignation = userDesignation;
    }

    static fromJson(json) {
        if (!json) return null;
        return new User(json);
    }
}