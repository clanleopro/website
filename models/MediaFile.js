class MediaFile {
    constructor({
        id,
        postId,
        mediaUrl,
        mediaType,
        thumbnail = null,
        createdAt
    }) {
        this.id = id;
        this.postId = postId;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.thumbnail = thumbnail;
        this.createdAt = createdAt ? new Date(createdAt) : null;
    }

    static fromJson(json) {
        if (!json) return null;
        return new MediaFile(json);
    }
}
