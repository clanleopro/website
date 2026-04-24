class Post {
    constructor({
        id,
        userId,
        heading,
        caption,
        tags = [],
        views = 0,
        createdAt,
        isBoosted = false,
        isBlocked = false,
        boostStartDate = null,
        boostExpiresAt = null,
        boostPackageId = null,
        maxViews = null,
        deleteReason = null,
        deletedAt = null,
        deletedBy = null,
        mediaFiles = [],
        user = null,
        comments = [],
        Reports = []
    }) {
        this.id = id;
        this.userId = userId;
        this.heading = heading;
        this.caption = caption;
        this.tags = tags;
        this.views = views;
        this.createdAt = createdAt ? new Date(createdAt) : null;
        this.isBoosted = isBoosted;
        this.isBlocked = isBlocked;
        this.boostStartDate = boostStartDate ? new Date(boostStartDate) : null;
        this.boostExpiresAt = boostExpiresAt ? new Date(boostExpiresAt) : null;
        this.boostPackageId = boostPackageId;
        this.maxViews = maxViews;
        this.deleteReason = deleteReason;
        this.deletedAt = deletedAt ? new Date(deletedAt) : null;
        this.deletedBy = deletedBy;
        this.mediaFiles = mediaFiles ? mediaFiles.map(m => new MediaFile(m)) : [];
        this.user = user;
        this.comments = comments ? comments.map(c => new Comment(c)) : [];
        this.Reports = Reports;
    }

    static fromJson(json) {
        if (!json) return null;
        return new Post(json);
    }
}
